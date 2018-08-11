function init(){
    winning_times = {
        "men" : null,
        "women" : null
    }
    chart = {}

    //Used to parse the CSV data
    var rowConverter = function(d) {
        var time = d.Time.split(":").map(x => parseInt(x))
        var minutes = 60*time[0]+time[1]+time[2]/60
        return {
            year: parseInt(d.Year),
            athlete: d.Athlete,
            country: d.Country,
            time: minutes,
            time_h: d.Time
        };
    }

    d3.csv("men.csv", rowConverter, function(data) {
        // format the data
        winning_times["men"] = data

        d3.csv("women.csv", rowConverter, function(data){
            console.log("Hey?")
            winning_times["women"] = data
            console.table(data)
            setup_chart()
        });
    });


}

function setup_chart(){

    //Width and height
    var w = 600;
    var h = 400;

    var margin = {
        top: 10,
        right: 50,
        bottom: 30,
        left: 50
    }

    var width = 600 - margin.left - margin.right
        height = 400 - margin.top - margin.bottom

    svg = d3.select("#chart")
                .append("svg")
                .attr("width", 600 + margin.left + margin.right)
                .attr("height", 400 + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                "translate(" + margin.left*2 + "," + 20 + ")");
                // Define the div for the tooltip
                var mantooltip= d3.select("body").append("div")
               .attr("class", "tooltipmen")
               .style("opacity", 0);

               // Define the div for the tooltip
               var womantooltip = d3.select("body").append("div")
               .attr("class", "tooltipwomen")
               .style("opacity", 0);

        chart.xScale = d3.scaleLinear()
                  .range([0, width])
                  .domain([1897,2018])

        chart.yScale = d3.scaleLinear()
                  .range([height, 0])
                  .domain([120,220])


        chart.xAxis = d3.axisBottom().scale(chart.xScale)
        chart.yAxis = d3.axisLeft().scale(chart.yScale)

    //Define line generator
  chart.line = d3.line()
  .x(function(d) { return chart.xScale(d.year); })
  .y(function(d) { return chart.yScale(d.time); });


    // append the bar rectangles to the svg element
   chart.men = svg.selectAll("rect").data(winning_times.men)
   chart.women = svg.selectAll("rect").data(winning_times.women)

   chart.menline = svg.append("path")
                     .datum(winning_times.men)
                     .attr("class", "line men")
                     .attr("d", chart.line);

  chart.womenline = svg.append("path")
                   .datum(winning_times.women)
                   .attr("class", "line women")
                   .attr("d", chart.line);


   xmen = winning_times.men.map(d => d.year-winning_times.men[0].year)
   ymen = winning_times.men.map(d => d.time)
   xwomen = winning_times.women.map(d => d.year-winning_times.women[0].year)
   ywomen = winning_times.women.map(d => d.time)

   var lsmen = leastSquares(xmen,ymen);
   var lswomen = leastSquares(xwomen,ywomen);
   // apply the reults of the least squares regression
    var x1 = winning_times.men[0].year
    var y1 = lsmen[0] + lsmen[1];
    var x2 = winning_times.men[winning_times.men.length-1].year
    var y2 = lsmen[0] * winning_times.men.length + lsmen[1];


    var trendData = [[x1,y1,x2,y2]];

    var trendline = svg.selectAll(".trendline").data(trendData);
        trendline.enter()
        .append("line")
        .attr("class", "men trendline")
        .attr("x1", function(d) { return chart.xScale(d[0]); })
        .attr("y1", function(d) { return chart.yScale(d[1]); })
        .attr("x2", function(d) { return chart.xScale(d[2]); })
        .attr("y2", function(d) { return chart.yScale(d[3]); })
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    // apply the reults of the least squares regression
     var x1 = winning_times.women[0].year
     var y1 = lswomen[0] + lswomen[1];
     var x2 = winning_times.women[winning_times.women.length-1].year
     var y2 = lswomen[0] * winning_times.women.length + lswomen[1];
     var trendData = [[x1,y1,x2,y2]];


     trendline.enter()
         .data(trendData)
         .append("line")
         .attr("class", "women trendline")
         .attr("x1", function(d) { return chart.xScale(d[0]); })
         .attr("y1", function(d) { return chart.yScale(d[1]); })
         .attr("x2", function(d) { return chart.xScale(d[2]); })
         .attr("y2", function(d) { return chart.yScale(d[3]); })
         .attr("stroke", "black")
         .attr("stroke-width", 1);
         var size = 6

         chart.men.enter().append("rect")
             .attr("class", "rect men")
             .attr("x", function(d){return chart.xScale(d.year);})
             .attr("y", function(d){return chart.yScale(d.time);})
             .attr("width", size)
             .attr("height", size)
             .attr("transform",function(d){
                 var x = chart.xScale(d.year);
                 var y = chart.yScale(d.time);
                 return "rotate(45,"+x+","+y+")"
             }).on("mouseover", function(d) {
                  mantooltip.transition()
                      .duration(200)
                      .style("opacity", .9);
                  mantooltip    .html("Year: " + d.year + "<br/>"  + " Time: " +d.time_h + "<br/><br/>" + "Athlete: " + d.athlete)
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
                  })
              .on("mouseout", function(d) {
                  mantooltip.transition()
                      .duration(500)
                      .style("opacity", 0);
              })
             .style("fill", "white")
             .style("stroke","rgba(22,22,122,0.5)")
             .style("stroke-width",1);

         chart.women.enter().append("rect")
             .attr("class", "rect women")
             .attr("x", function(d){return chart.xScale(d.year);})
             .attr("y", function(d){return chart.yScale(d.time);})
             .attr("width", size)
             .attr("height", size)
             .on("mouseover", function(d) {
                   womantooltip.transition()
                       .duration(200)
                       .style("opacity", .9);
                   womantooltip .html("Year: " + d.year + "<br/>"  + " Time: " + d.time_h + "<br/><br/>" + "Athlete: " + d.athlete)
                       .style("left", (d3.event.pageX) + "px")
                       .style("top", (d3.event.pageY - 28) + "px");
                   })
               .on("mouseout", function(d) {
                   womantooltip.transition()
                       .duration(500)
                       .style("opacity", 0);
               })
              .style("fill", "white")
              .style("stroke","rgba(122,22,22,0.5)")
              .style("stroke-width",1);
   // add the x Axis
   svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(chart.xAxis.tickFormat(d3.format("d")));
   // text label for the x axis
  svg.append("text")
     .attr("transform",
           "translate(" + (width/2) + " ," +
                          (height + margin.top + 20) + ")")
     .style("text-anchor", "end")
     .text("Year");

   // add the y Axis
   svg.append("g")
       .attr("class", "y axis")
       .call(chart.yAxis);

       // text label for the y axis
   svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x", 0 - (height / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("Winning Time in minutes");


}





function plot_men(hide,change_domain){

    /*Hide stuff*/
    if(hide){
        svg.selectAll(".rect.women")
        .transition().duration(500)
        .style("stroke", "transparent")
        .style("fill", "transparent")


        svg.selectAll(".trendline.women")
        .transition().duration(500)
        .style("stroke", "transparent")
        .style("fill", "transparent")

        svg.selectAll(".line.women")
        .transition().duration(500)
        .style("stroke", "transparent")
        .style("fill", "transparent")
    }

    if(change_domain){
        chart.xScale.domain([1897,2017]);
    }


    svg.selectAll(".rect.men")
        .transition().duration(500)
        .attr("x", function(d){return chart.xScale(d.year);})
        .attr("y", function(d){return chart.yScale(d.time);})
        .style("stroke","rgba(22,22,122,0.5)")

    svg.selectAll(".trendline.men")
        .transition().duration(500)
        .attr("x1", function(d) { return chart.xScale(d[0]); })
        .attr("y1", function(d) { return chart.yScale(d[1]); })
        .attr("x2", function(d) { return chart.xScale(d[2]); })
        .attr("y2", function(d) { return chart.yScale(d[3]); })
        .style("stroke", "black")
        .style("fill", "white")

    svg.selectAll(".line.men")
        .transition().duration(500)
        .style("stroke", "rgba(22,22,122,0.5)")
        .attr("d", chart.line);

   svg.select(".x.axis")
   .transition()
   .duration(1000)
       .call(chart.xAxis);

   //Update Y axis
   svg.select(".y.axis")
       .call(chart.yAxis);

}

function plot_women(hide,change_domain){
    /*Hide stuff*/
    if(hide){
        svg.selectAll(".rect.men")
        .transition().duration(500)
        .style("stroke", "transparent")
        .style("fill", "transparent")


        svg.selectAll(".trendline.men")
        .transition().duration(500)
        .style("stroke", "transparent")

        svg.selectAll(".line.men")
        .transition().duration(500)
        .style("stroke", "transparent")
    }

    if(change_domain){
        chart.xScale.domain([1966,2017]);

                svg.select(".x.axis")
                .transition()
                .duration(1000)
                    .call(chart.xAxis);
                //Update Y axis
                svg.select(".y.axis")
                     .transition()
                     .duration(1000)
                     .call(chart.yAxis);
    }


    svg.selectAll(".rect.women")
        .transition().duration(500)
        .attr("x", function(d){return chart.xScale(d.year);})
        .attr("y", function(d){return chart.yScale(d.time);})
        .style("fill", "white")
        .style("stroke","rgba(122,22,22,0.5)")
        .style("stroke-width",1);

    svg.selectAll(".trendline.women")
        .transition().duration(500)
        .attr("x1", function(d) { return chart.xScale(d[0]); })
        .attr("y1", function(d) { return chart.yScale(d[1]); })
        .attr("x2", function(d) { return chart.xScale(d[2]); })
        .attr("y2", function(d) { return chart.yScale(d[3]); })
        .style("stroke", "rgba(22,22,22,0.8)")
        .style("stroke-width", 1);

    svg.selectAll(".line.women")
    .transition().duration(500)
    .style("stroke", "rgba(122,22,22,0.8)")
    .attr("d", chart.line);




}

function plot_all(){

    plot_men(false,true)
    plot_women(false,false)

}



// returns slope, intercept and r-square of the line
function leastSquares(xSeries, ySeries) {

        var reduceSumFunc = function(prev, cur) { return prev + cur; };

        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        var slope = ssXY / ssXX;
        var intercept = yBar - (xBar * slope);
        var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return [slope, intercept, rSquare];
}
