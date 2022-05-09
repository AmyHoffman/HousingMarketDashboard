// Adapted by Amy Hoffman 2022 to include:
    // Secondary Y-Axis
    // Hover text, dots, line capabilities
    // Axis and chart titles
    // Bar chart series

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
export function LineBarChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    bar = ([, bar]) => bar,
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 60, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 60, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xFormat,
    xType = d3.scaleUtc, // the x-scale type
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // the y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    yHoverText,
    y2Label,
    barDomain,
    barFormat,
    barHoverText,
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
    const BAR = d3.map(data, bar);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]); 
    const D = d3.map(data, defined);
    const I = d3.range(X.length);
    const O = d3.map(data, d => d);

    // Compute default domains.
    if (xDomain === undefined) xDomain = [d3.timeDay.offset(d3.min(X), -50), d3.timeDay.offset(d3.max(X), 50)]; 
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (barDomain == undefined) barDomain = [d3.min(BAR) - 0.005, d3.max(BAR)];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const barScale = yType(barDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(X.length - 1, xFormat);
    const yAxis = d3.axisLeft(yScale).ticks(5, yFormat);
    const barAxis = d3.axisRight(barScale).ticks(5, barFormat);

    var xBandwidth = (xScale(X[1]) - xScale(X[0])) / 2 ;
    // Compute titles.
    const yFormatFunc = d3.format(yFormat);
    const barFormatFunc = d3.format(barFormat);
    const xFormatFunc = d3.utcFormat(xFormat);

    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .on("pointerenter", pointerentered)
        .on("pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

    svg.append("text")
        .attr("x", width/2)             
        .attr("y", (marginTop/3))
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "bold")  
        .text(title); 

    svg.append("text")
        .attr("x", width/2)             
        .attr("y", marginTop-20)
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
            .attr("x",  -marginLeft)
            .attr("y", marginTop - 5)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    svg.append("g")
        .attr("transform", `translate(${width - marginRight},0)`)
        .call(barAxis)
        .call(g => g.append("text")
            .attr("x", 120)
            .attr("y", marginTop)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-size", "24px")
            .text(y2Label));

    svg.append("g")
        .attr("fill", color(3))
        .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(data)
    .join("rect")
        .attr("x", function (d, i) {return (xScale(X[i]) - xBandwidth)})
        .attr("width", (xRange[1] - xRange[0]) / (X.length + 1))
        .attr("y", function (d, i) {return (barScale(BAR[i]))})
        .attr("height", function (d, i) {return (barScale(d3.min(BAR) - 0.005) - barScale(BAR[i]))});

    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color(1))
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line(I));

    const adjustment = 3;
    const y1dot = getDot(color(1), "middle", adjustment*2);
    const bardot = getDot(color(4), "middle", -adjustment);

    function pointermoved(event) 
    {
        const [xm, ym] = d3.pointer(event);
        const i = d3.least(I, i => Math.abs(xScale(X[i]) - xm)); // closest point by date

        y1dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
        bardot.attr("transform", `translate(${xScale(X[i])},${barScale(BAR[i])})`);

        anchorAdj(y1dot, (xScale(X[i]) < xScale(X[X.length - 1]) / 4 ));
        anchorAdj(bardot, (xScale(X[i]) < xScale(X[X.length - 1]) / 4 ));

        y1dot.select("text").text(yHoverText + yFormatFunc(Y[i]));
        bardot.select("text").text(barHoverText + barFormatFunc(BAR[i]));

        svg.property("value", O[i]).dispatch("input", {bubbles: true});
    }

    function pointerentered() 
    {
        y1dot.attr("display", null);
        bardot.attr("display", null);
    }

    function pointerleft() 
    {
        svg.node().value = null;
        svg.dispatch("input", {bubbles: true});
    }

    function getDot(input_color, input_position, yadj)
    {
        if (input_position == 'end') {var xoffset = -1 * adjustment;} else {var xoffset = adjustment;}
        const return_dot = svg.append("g")
            .attr("display", "none");
        
        return_dot.append("circle")
            .attr("r", 2.5)
            .style("fill", input_color);

        return_dot.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", input_position)
            .style("fill", input_color)
            .attr("y", yadj)
            .attr("x", xoffset);

        return return_dot;
    }

    function anchorAdj(dot, bool)
    {
        
        if (bool)
        {
            dot.selectAll("text").attr("text-anchor", "start");
        }
        else
        {
            dot.selectAll("text").attr("text-anchor", "end");
        }
    }


    return svg.node();
}