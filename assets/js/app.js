// Set up SVG
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg").attr("width", svgWidth).attr("height", svgHeight);

var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set up initial Axes
var chosenXAxis = "income"
// var chosenYaxis = "smokes"

// Function used to update x and y scale when axis label is clicked
function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

        return xLinearScale;
}

// function yScale(stateData, chosenYAxis) {
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
//         d3.max(stateData, d => d[chosenYAxis]) * 1.2
//         ])
//         .range([0, height]);

//         return yLinearScale;
// }

// function used for updating Xaxis var on click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}

// update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis){
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    
    
    return circlesGroup;
}

// update corresponding circle text with a transition to new circles
function renderCircleLabels(circleText, newXScale, chosenXaxis){
    circleText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
    

    return circleText;
}

// Update Tool Tip
function updateToolTip(chosenXAxis, circlesGroup){
    if (chosenXAxis === "income"){
        var label = "Income: $";
    }
    else{
        var label = "Obesity: ";
    }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${label}${d[chosenXAxis]} <br> Smokers: ${d.smokes}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        toolTip.show(data, this);
    })
    .on("mouseout", function(data, index){
        toolTip.hide(data, this);
    });

    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(stateData) {
    stateData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare - +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(stateData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(stateData, d => d.smokes)])
    .range([height, 0]);

    // var yLinearScale = yScale(stateData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // var yAxis = chartGroup.append("g")
    // .classed("y-axis", true)
    // .attr("transform", `translate(0, ${width})`)

    chartGroup.append("g")
    .call(leftAxis);

// Create text labels for states overlayed on circles
    var circleText = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("text")
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d.smokes))
    .attr("class", "stateText")
    .attr("alignment-baseline", "central")
    .text(d => d.abbr)




    var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5")
    .attr("class", "stateCircle");

    

    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width/2}, ${height + 20})`);

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income Level");

  var obesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity");

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Smokers");

    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    labelsGroup.selectAll("text")
    .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            chosenXAxis = value;
            xLinearScale = xScale(stateData, chosenXAxis);
            xAxis = renderAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
            circleText = renderCircleLabels(circleText, xLinearScale, chosenXAxis)
            
            if (chosenXAxis === "income") {
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
                  obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else {
                incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
                  obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }

        }
    })
});


