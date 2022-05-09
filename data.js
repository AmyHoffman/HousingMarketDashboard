import {enable_filtering} from "./filtering.js";
import {updatePriceChart, updateMortgageChart} from "./staticViz.js";

$(function() 
{
    var test_data = null;
    loadData();
    console.log(test_data);

    $.ajax({
        beforeSend: function(xhr) 
        {
            if (xhr.overrideMimeType)
            {
                xhr.overrideMimeType("application/json")
            }
        }
    });

    function loadData()
    {
        $.getJSON('output_data/price_input_data.json')
        .done( function(data)
        {
            test_data = data.data;
            console.log(test_data);

            updatePriceChart(test_data);

        }).fail( function()
        {
            console.log('error', errorThrown);
            $('#chart1').html('Failed to load data!');
        });

        $.getJSON('output_data/FRED_input_data.json')
        .done( function(data)
        {
            test_data = data.data;
            console.log(test_data);

            updateMortgageChart(test_data);

        }).fail( function()
        {
            console.log('error', errorThrown);
            $('#chart1').html('Failed to load data!');
        });

        $.getJSON('output_data/input_data.json')
        .done( function(data)
        {
            test_data = data.data;
            console.log(test_data);

            enable_filtering(test_data);

        }).fail( function()
        {
            console.log('error', errorThrown);
            $('#chart1').html('Failed to load data!');
        });


        console.log(test_data);
       
    }

});

// d3.select("body").append("span").text("D3 example text");
// python3 -m http.server
// python3 -m venv .venv
// source .venv/bin/activate
// python3 -m pip install
// https://stackoverflow.com/questions/10752055/cross-origin-requests-are-only-supported-for-http-error-when-loading-a-local

