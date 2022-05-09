from preprocessor import ZillowPreprocessor


preprocessor = ZillowPreprocessor("2019-01-01", "2022-01-01", "MT")

input_list = [{"input_file": "./input_data/Metro_invt_fs_uc_sfrcondo_week.csv", "set": "inventory"},
            {"input_file": "./input_data/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_month.csv", "set": "zhvi"},
            {"input_file": "./input_data/Metro_new_listings_uc_sfrcondo_week.csv", "set": "new"},
            {"input_file": "./input_data/Metro_new_pending_uc_sfrcondo_week.csv", "set": "pending"},
            {"input_file": "./input_data/Metro_sales_count_now_uc_sfrcondo_month.csv", "set":"sales"}]

export_df = preprocessor.transformList(input_list, True)
preprocessor.exportJSON(export_df, './output_data/input_data.json')

input_list = [{"input_file": "./input_data/Metro_mlp_uc_sfrcondo_week.csv", "set": "listprice"},
            {"input_file": "./input_data/Metro_median_sale_price_uc_sfrcondo_week.csv", "set": "saleprice"},
            {"input_file": "./input_data/Metro_perc_listings_price_cut_uc_sfrcondo_week.csv", "set":"pricecuts"}]
export_df = preprocessor.transformList(input_list, False)
preprocessor.exportJSON(export_df, './output_data/price_input_data.json')

input_list = [{"input_file": "./input_data/DRSFRMACBS.csv", "set":"deliquency"},
            {"input_file": "./input_data/MDSP.csv", "set":"debt2income"}]
export_df = preprocessor.loadFREDdata(input_list)
preprocessor.exportJSON(export_df, './output_data/FRED_input_data.json')

# input_list = [{"input_file": "./input_data/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_month.csv", "set": "zhvi"}]

# export_df = preprocessor.transformList(input_list, True)
# print(export_df[export_df['RegionName'] == 'Helena, MT'])
# preprocessor.exportJSON(export_df, './output_data/FRED_input_data.json')