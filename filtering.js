import {MultiSeriesLineChart} from "./MultiSeriesLineChart.js";
import { BarChart } from "./BarChart.js";

export function enable_filtering(input_data)
{
    const tParser = d3.timeParse("%Y-%m-%d");
    var sets = Array.from(new Set (d3.map(input_data, function(d){return d.set;})).values());
    console.log(sets);
    create_filters();
    

    function create_filters()
    {        
        var regions = Array.from(new Set (d3.map(input_data, function(d){return d.RegionName;}))).sort();
        console.log(regions);

        var years = Array.from(new Set (d3.map(input_data, function(d) {return tParser(d.Obs_Date).getFullYear()}))).sort();
        console.log(years);

        var regionDropdown = d3.select("#ops_zhvi")
            .insert("select", "svg")
            .on("change", regionDropdownChange);

        regionDropdown.selectAll("option")
            .data(regions)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function (d) {
                return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
            })
            .property('selected', 'UnitedStates');

        var yearDropDown = d3.select('#ops_zhvi')
            .insert("select", "svg")
            .on("change", regionDropdownChange);

        yearDropDown.selectAll("option")
            .data(years)
            .enter().append("option")
            .attr("value", function (d) {return d;} )
            .text(function (d) {return d;});

        refresh(getDropdownValues());
    }

    function getDropdownValues()
    {
        var selectedRegion = d3.select('select:nth-child(1)').property('value');
        var selectedYear = d3.select('select:nth-child(2)').property('value');

        return([selectedRegion, selectedYear]);
    }

    function removeAddChart(objectName, chart)
    {
        d3.select(objectName).selectAll('svg').remove();
        d3.select(objectName).node().append(chart);
        return(true);
    }
    
    function regionDropdownChange()
    {
        var newDropdownValues = getDropdownValues();
        refresh(newDropdownValues);
    }

    function refresh(dropdownValues)
    {
        var newData = d3.filter(input_data, function (d) { return ( (d.RegionName == dropdownValues[0]) & (tParser(d.Obs_Date).getFullYear() >= dropdownValues[1]) )});
        
        updateCharts(newData);
        updateTiles(newData);
    }

    function updateCharts(newChartData)
    {
        updateInventoryChart(newChartData);
        updateNewPendingChart(newChartData);
        updatePriceChart(newChartData);
    }

    function updateTiles(newChartData)
    {
        var myColor = d3.scaleSequential().domain([-10, 10]).interpolator(d3.interpolateRdYlGn);
        var grouped_data = d3.group(newChartData, d => d.set);

        for (let s =0; s <sets.length; s++)
        {
            var yoy_change = getPercentChange(grouped_data.get(sets[s]));
            console.log();
            d3.select('#'+sets[s]).attr("style", "background-color: " + d3.color(myColor(yoy_change)).formatHex()).select('p').text(yoy_change + "%");
        }
    }

    function getPercentChange(input_data)
    {
        var most_recent = d3.greatest(input_data, function(d) {return(tParser(d.Obs_Date))}); 
        var prior_year = d3.timeDay.offset(tParser(most_recent.Obs_Date), -365);
        var last_year = d3.least(input_data, function(d) { return(Math.abs(tParser(d.Obs_Date).getTime() - (prior_year).getTime()))}); 

        var yoy_change = Math.round((most_recent.value / last_year.value - 1) * 1000)/10;

        return(yoy_change);
    }

    function updatePriceChart(newChartData)
    {
        var myColor = d3.scaleOrdinal().domain(newChartData).range(["darkgreen"]);
        var zhvi = d3.filter(newChartData, function (d) { return ( (d.set == 'zhvi'))});
        zhvi = d3.filter(zhvi, function(d) {return ((d.trend != null))});
        console.log(zhvi);

        var chart = BarChart(zhvi, {
            x: d => tParser(d.Obs_Date),
            y: d => d.trend,
            z: d => d.set,
            yFormat: "$,d",
            xFormat: "%b %-d, %Y",
            title: 'Zillow Home Value Index',
            subtitle: 'By month',
            yLabel: "Price (USD)",
            width: 1200,
            height: 300,
            color: myColor,
            keys: ["ZHVI"],
          })
        
        var completed = removeAddChart('#viz_zhvi', chart);
    }

    function updateInventoryChart(newChartData)
    {
        var myColor = d3.scaleOrdinal().domain(input_data).range(["forestgreen", "royalblue"]);
        var inventorysales = d3.filter(newChartData, function (d) { return ( (d.set == 'inventory') | (d.set == 'sales') )});
        inventorysales = d3.filter(inventorysales, function(d) {return ((d.trend != null))});
        console.log(inventorysales);

        var input_keys = Array.from(new Set (d3.map(inventorysales, function(d){return d.set;})).values());

        var chart = MultiSeriesLineChart(inventorysales, {
            x: d => tParser(d.Obs_Date),
            y: d => d.trend,
            z: d => d.set,
            yFormat: ",.0f",
            xFormat: "%b %-d, %Y",
            title: 'Inventory and Sale Volume',
            subtitle: 'Sales data only available for USA. Sales data by month, inventory data by week.',
            yLabel: "Homes",
            width: 1200,
            height: 300,
            color: myColor,
            keys: input_keys,
          })
        
        var completed = removeAddChart('#viz_inventory', chart);
        
    }

    function updateNewPendingChart(newChartData)
    {
        var myColor = d3.scaleOrdinal().domain(input_data).range(["firebrick", "black"]);
        var newpending = d3.filter(newChartData, function (d) { return ( (d.set == 'new') | (d.set == 'pending') )});
        newpending = d3.filter(newpending, function(d) {return ((d.trend != null))});

        var input_keys = Array.from(new Set (d3.map(newpending, function(d){return d.set;})).values());

        var chart = MultiSeriesLineChart(newpending, {
            x: d => tParser(d.Obs_Date),
            y: d => d.trend,
            z: d => d.set,
            yFormat: ',.0f',
            xFormat: "%b %-d, %Y",
            title: 'New and Pending Listings',
            subtitle: 'By week',
            yLabel: "Homes",
            width: 1200,
            height: 300,
            color: myColor,
            keys: input_keys,
          })

        var completed = removeAddChart('#viz_newpending', chart);
    }
}
