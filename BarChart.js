// Adapted by Amy Hoffman 2022 to include:
// Secondary Y-Axis
// Multi-Series line chart
// Hover text, dots, line capabilities
// Axis and chart titles
// Bar chart series

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
export function BarChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 60, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 60, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xFormat,
    xType = d3.scaleBand, // the x-scale type
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // the y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    yHoverText,
    title,
    subtitle = "",
    color = "currentColor", // stroke color of line
    strokeLinecap = "round", // stroke line cap of the line
    strokeLinejoin = "round", // stroke line join of the line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeOpacity = 1, // stroke opacity of line
    mixBlendMode = "multiply",
} = {}) {

    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]); 
    const D = d3.map(data, defined);
    const I = d3.range(X.length);
    const O = d3.map(data, d => d);

    // Compute default domains.
    if (yDomain === undefined) yDomain = [d3.min(Y) - 0.05*d3.min(Y), d3.max(Y)];

    // Construct scales and axes.
    const formatMonth = d3.timeFormat('%b %Y');
    const xScale = xType(X, xRange).paddingInner(0.05);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d,i){ return (i%3 == 0)})).tickFormat(function (d) {return formatMonth(d);});;
    const yAxis = d3.axisLeft(yScale).ticks(5, yFormat);

   
    var xBandwidth = (xScale(X[1]) - xScale(X[0])) / 2 ;
    // Compute titles.
    const yFormatFunc = d3.format(yFormat);
    const xFormatFunc = d3.utcFormat(xFormat);

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("text")
        .attr("x", width/2)             
        .attr("y", (marginTop ))
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "bold")  
        .text(title); 

    svg.append("text")
        .attr("x", width/2)             
        .attr("y", marginTop + 10)
        .attr("text-anchor", "middle")  
        .style("font-size", "8px") 
        .text(subtitle);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.append("text")
            .attr("x",  -6)
            .attr("y", marginTop)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(yLabel));

    svg.append("g")
        .attr("fill", "dodgerblue")
        .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(data)
    .join("rect")
        .attr("x", function (d, i) {return (xScale(X[i]))})
        .attr("width", xScale.bandwidth())
        .attr("y", function (d, i) {return (yScale(Y[i]))})
        .attr("height", function (d, i) {return (yScale(d3.min(Y) - 0.05*d3.min(Y)) - yScale(Y[i]))});

    return svg.node();
} 