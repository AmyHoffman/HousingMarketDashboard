// Adapted by Amy Hoffman 2022 to include:
    // Secondary Y-Axis
    // Multi-Series line chart
    // Hover text, dots, line capabilities
    // Axis and chart titles
    // Bar chart series

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
export function DualAxisChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    y2 = ([, y2]) => y2,
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
    y2Domain,
    y2Format,
    y2Label,
    y2HoverText,
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
    const Y2 = d3.map(data, y2);
    const BAR = d3.map(data, bar);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]) && !isNaN(Y2[i]);
    const D = d3.map(data, defined);
    const I = d3.range(X.length);
    const O = d3.map(data, d => d);

    // Compute default domains.
    if (xDomain === undefined) xDomain = [d3.min(X), d3.timeDay.offset(d3.max(X), 7)];
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (barDomain == undefined) barDomain = [0, d3.max(BAR)];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const barScale = yType(barDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 120).tickSizeOuter(0);
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
        .x(i => xScale(X[i]) + xBandwidth)
        .y(i => yScale(Y[i]));

    const line2 = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]) + xBandwidth)
        .y(i => yScale(Y2[i]));

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
            .attr("x", -7)
            .attr("y", marginTop + 5)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(yLabel));

    svg.append("g")
        .attr("transform", `translate(${width - marginRight},0)`)
        .call(barAxis)
        .call(g => g.append("text")
            .attr("x", 9)
            .attr("y", marginTop + 5)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(y2Label));

    svg.append("g")
        .attr("fill", color(3))
        .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(data)
    .join("rect")
        .attr("x", function (d, i) {return (xScale(X[i]))})
        .attr("width", (xRange[1] - xRange[0]) / (X.length))
        .attr("y", function (d, i) {return (barScale(BAR[i]))})
        .attr("height", function (d, i) {return (barScale(0) - barScale(BAR[i]))});

    const path = svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color(1))
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line(I));

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color(2))
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line2(I));

    const hoverline = svg.append("g")
        .attr("display", "none");

    hoverline.append("line")
        .attr("stroke", "black")
        .attr("y1", marginTop).attr("y2", height - marginBottom);

    hoverline.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", 3*marginTop/4);

    const adjustment = 5;
    const y1dot = getDot(color(1), "end");
    const y2dot = getDot(color(2), "end");
    const bardot = getDot(color(4), "end");

    // const Tooltip = new Tooltip();

    function pointermoved(event) 
    {
        const [xm, ym] = d3.pointer(event);
        const i = d3.least(I, i => Math.abs(xScale(X[i]) - xm)); // closest point by date
        // path.style("stroke",  "#ddd").raise();

        y1dot.attr("transform", `translate(${xScale(X[i]) + xBandwidth},${yScale(Y[i])})`);
        y2dot.attr("transform", `translate(${xScale(X[i])+ xBandwidth},${yScale(Y2[i])})`);
        bardot.selectAll("text").attr("transform", `translate(${xScale(X[i]) + xBandwidth}, ${barScale(0) - adjustment})`);
        hoverline.select("line")
            .attr("x1", xScale(X[i])+ xBandwidth)
            .attr("x2", xScale(X[i])+ xBandwidth);
        hoverline.select("text")
            .attr("x", xScale(X[i]) + xBandwidth);

        hoverline.select("text").text(xFormatFunc(X[i]));
        y1dot.select("text").text(yHoverText + yFormatFunc(Y[i]));
        y2dot.select("text").text(y2HoverText + yFormatFunc(Y2[i]));
        bardot.select("text").text(barHoverText + barFormatFunc(BAR[i]));

        var anchorBool = (xScale(X[i]) < xScale(X[X.length - 1]) / 4 )
        anchorAdj(y1dot, anchorBool);
        anchorAdj(y2dot, anchorBool);
        anchorAdj(bardot, anchorBool);
        
        svg.property("value", O[i]).dispatch("input", {bubbles: true});
    }

    function pointerentered() 
    {
        // path.style("mix-blend-mode", null).style("stroke", "#ddd");
        y1dot.attr("display", null);
        y2dot.attr("display", null);
        bardot.attr("display", null);
        hoverline.attr("display", null);
    }

    function pointerleft() 
    {
        // path.style("mix-blend-mode", "multiply").style("stroke", null);
        // y1dot.attr("display", "none");
        // y2dot.attr("display", "none");
        // bardot.attr("display", "none");
        // hoverline.attr("display", "none");
        svg.node().value = null;
        svg.dispatch("input", {bubbles: true});
    }

    function getDot(input_color, input_position)
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
            .attr("y", -1*adjustment)
            .attr("x", xoffset);

        return return_dot;
    }

    function anchorAdj(dot, bool)
    {
        if (bool) {var xoffset = adjustment;} else {var xoffset = -1*adjustment;}
        if (bool)
        {
            dot.selectAll("text")
                .attr("text-anchor", "start")
                .attr("x", xoffset);
        }
        else
        {
            dot.selectAll("text")
                .attr("text-anchor", "end")
                .attr("x", xoffset);
        }
    }


    return svg.node();
}

// class Tooltip {
//     constructor() {
//       this._date = htl.svg`<text y="-22"></text>`;
//       this._y = htl.svg`<text y="-12"></text>`;
//       this.node = htl.svg`<g pointer-events="none" display="none" font-family="sans-serif" font-size="10" text-anchor="middle">
//     <rect x="-27" width="54" y="-30" height="20" fill="white"></rect>
//     ${this._date}
//     ${this._y}
//     <circle r="2.5"></circle>
//   </g>`;
//     }
//     show(d) {
//       this.node.removeAttribute("display");
//       this.node.setAttribute("transform", `translate(${x(d.date)},${y(d.y)})`);
//       this._date.textContent = formatDate(d.date);
//       this._close.textContent = formatClose(d.close);
//     }
//     hide() {
//       this.node.setAttribute("display", "none");
//     }
//   }