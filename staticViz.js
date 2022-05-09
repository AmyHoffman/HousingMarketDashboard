import {DualAxisChart} from "./DualAxisChart.js";
import { LineBarChart } from "./LineBarChart.js";

const tParser = d3.timeParse("%Y-%m-%d");

function removeAddChart(objectName, chart)
{
    d3.select(objectName).selectAll('svg').remove();
    d3.select(objectName).node().append(chart);
    return(true);
}

export function updatePriceChart(input_data)
{
    var myColor = d3.scaleOrdinal().domain(input_data).range(["forestgreen", "royalblue", "black", "silver"]);
    var chartData = d3.filter(input_data, function(d) {return ((d.trend_listprice != null) & (d.trend_saleprice != null) & (d.trend_pricecuts != null))});

    var chart = DualAxisChart(chartData, {
        x: d => tParser(d.Obs_Date),
        y: d => d.value_listprice,
        y2: d => d.value_saleprice,
        bar: d => d.value_pricecuts,
        marginRight: 60,
        marginLeft: 60,
        marginTop: 60,
        marginBottom: 20,
        y1Set: "listprice",
        y2Set: "saleprice",
        yLabel: "Price (USD)",
        y2Label: "Percent",
        yHoverText: 'Listing Price: ',
        y2HoverText: 'Sale Price: ',
        barHoverText: "Percent of Listings with Price Reductions: ",
        xFormat: "%b %-d, %Y",
        yFormat: "$,d",
        barFormat: ",.1%",
        width: 1200,
        height: 300,
        color: myColor,
        title: "United States Pricing Trends",
        });
    
    var completed = removeAddChart('#viz_price', chart);
}

export function updateMortgageChart(input_data)
{
    var myColor = d3.scaleOrdinal().domain(input_data).range(["silver", "royalblue", "black"]);

    var chart = LineBarChart(input_data, {
        x: d => tParser(d.DATE),
        y: d => d.deliquency,
        bar: d => d.debt2income,
        marginRight: 60,
        marginLeft: 60,
        marginTop: 60,
        marginBottom: 20,
        y1Set: "delinquency",
        yLabel: "Deliquency Rate",
        yHoverText: 'Mortgage Deliquency Rate: ',
        barHoverText: 'Mortgage Debt-to-Income Ratio: ',
        xFormat: "%b %Y",
        yFormat: ",.2%",
        y2Label: "Debt-to-Income",
        barFormat: ",.2%",
        width: 1200,
        height: 300,
        color: myColor,
        title: "United States Mortgage Deliquency and Debt-to-Income Rate",
        subtitle: "By End of Quarter"
        });
    
    var completed = removeAddChart('#viz_mortgage', chart);
}