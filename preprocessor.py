import pandas as pd
import numpy as np
import json
from statsmodels.tsa.seasonal import seasonal_decompose

class ZillowPreprocessor():

    min_date = "2019-01-01"
    max_date = "2022-01-01"
    state_filter = "MT"

    def __init__(self, min_date, max_date, state_filter):
        self.min_date = min_date
        self.max_date = max_date
        self.state_filter = state_filter

    def setMinDate(self, newval):
        self.min_date = newval

    def setDateFilter(self, newval):
        self.state_filter = newval

    def loadFREDdata(self, input_list):
        appended_df = None

        for n in range(0, len(input_list)):
            transformed_df = pd.read_csv(input_list[n]['input_file'])
            transformed_df.columns = [transformed_df.columns[0], input_list[n]['set']]
            transformed_df[input_list[n]['set']] = transformed_df[input_list[n]['set']] / 100

            if appended_df is None:
                appended_df = transformed_df
            else:
                appended_df = pd.merge(appended_df, transformed_df, on = [transformed_df.columns[0]], how="outer")

        appended_df = appended_df.reset_index(drop = True)
        return(appended_df)

    def transformList(self, input_list, appendRow_bool):
        appended_df = None

        for n in range(0, len(input_list)):
            transformed_df = self.transform(input_list[n]['input_file'])
            transformed_df['set'] = input_list[n]['set']

            if appendRow_bool:
                appended_df = self.appendRows(appended_df, transformed_df)
            else:
                appended_df = self.appendColumns(appended_df, transformed_df, input_list[n]['set'])

        # appended_df = appended_df.loc[~appended_df['trend'].isnull()]
        appended_df = appended_df.reset_index(drop = True)
        return(appended_df)
    
    def appendRows(self, append_to, input_data):
        if append_to is None:
            append_to = input_data
        else:
            append_to = pd.concat([append_to, input_data])

        return append_to

    def appendColumns(self, append_to, input_data, set_val):
        input_data = input_data.rename({'trend': 'trend_' +  set_val, 'value': 'value_' + set_val}, axis='columns')
        input_data = input_data.drop(['set', 'StateName'], axis = 'columns')

        if append_to is None:
            append_to = input_data
        else:
            append_to = pd.merge(append_to, input_data, on = ['RegionName', 'Obs_Date'])

        return append_to
    
    def getActive(self, input_df):
        active_df = input_df.groupby(['RegionName', 'Obs_Date'])

    def transform(self, input_file):
        transformed_df = self.loadData(input_file)
        transformed_df = self.wideToLong(transformed_df)
        transformed_df = transformed_df.sort_values(by = ['RegionName', 'Obs_Date'])

        if (len(transformed_df['RegionName'].unique()) > 1):
            trend_df = transformed_df.groupby(['RegionName']).apply(self.trend_function)
            trend_df = trend_df.reset_index(level = 'RegionName', drop = True)
        else:
            trend_df = self.trend_function(transformed_df)

        # print(trend_df.columns.tolist())
        # print(trend_df)

        # print(transformed_df.groupby(['RegionName']).count())

        return(trend_df)

    def loadData(self, filename):
        # "./input_data/City_zhvi_bdrmcnt_1_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
        wide_df = pd.read_csv(filename)
        wide_df = wide_df.loc[(wide_df['StateName'] == self.state_filter) | (wide_df['RegionName'] == 'United States')]
        wide_df['RegionName'] = np.where((wide_df['RegionType'] != 'Msa') & (~wide_df['StateName'].isnull()), wide_df['RegionName'] + ", " + wide_df['StateName'], wide_df['RegionName'])

        return(wide_df)

    def getDateColumns(self, input_df):
        columns = input_df.columns.tolist()
        values = [val for val in columns if '-' in val and val >= self.min_date and val < self.max_date]
        ids = [id for id in columns if '-' not in id]

        return [values, ids]

    def wideToLong(self, input_df):
        column_list = self.getDateColumns(input_df)

        vars = ['RegionName', 'StateName', 'Obs_Date', 'value']
        if 'set' in input_df.columns.tolist():
            vars.append('set')

        long_df = pd.melt(input_df, id_vars = column_list[1], value_vars = column_list[0], var_name = "Obs_Date")[vars]
        long_df = long_df.loc[~long_df['value'].isnull()]

        return(long_df)

    def trend_function(self, input_df):
        input_df = input_df.set_index(pd.DatetimeIndex(pd.to_datetime(input_df['Obs_Date'], infer_datetime_format=True)))
        timespan = pd.to_datetime(input_df['Obs_Date'][1]) - pd.to_datetime(input_df['Obs_Date'][0])
        
        # print(timespan.days)
        if (timespan.days == 7):
            input_df = input_df.asfreq('W', method='bfill')
        else: 
            input_df = input_df.asfreq('M', method='ffill')
        # print(input_df['RegionName'].unique())
        # print(input_df)
        # do your lambda function here as you are sending each grouping
        input_df = input_df.assign(trend = lambda x: x["value"].mask(~x["value"].isna(), 
                    other = seasonal_decompose(x["value"], model='additive').trend))
        
        if (timespan.days > 7):
            input_df = input_df.drop('Obs_Date', axis = 1).reset_index(level = 'Obs_Date', drop = False)
            input_df['Obs_Date'] = input_df['Obs_Date'].dt.strftime('%Y-%m-%d')
        else:
            input_df = input_df.reset_index(level = 'Obs_Date', drop = True)
        print(input_df.dtypes)

        return (input_df)

    def exportJSON(self, input_data, filename):
        json_string = "{\"data\":\n" + json.dumps(json.loads(input_data.to_json(orient='table'))['data']) + "\n}"

        # './output_data/test2.json'
        with open(filename, 'w') as outfile:
            outfile.write(json_string)