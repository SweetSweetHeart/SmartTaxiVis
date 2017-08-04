


//The drawing of the histogram has been broken out from the data retrial 
// or computation. (In this case the 'Irwin-Hall distribution' computation above)

function drawHistogram(){

$("#histogram").empty()
  data = [];

  for (var i = 0; i < 100; i++) {
    var s = 0;
      s += Math.random();
    
    data.push(s);
  }
//The drawing code needs to reference a responsive elements dimneions
var width = $("#histogram").width();
// var width = $(reference).empty().width(); we can chain for effeicanecy as jquery returns jquery.

var height = 250;  // We don't want the height to be responsive.

var histogram = d3.layout.histogram() (data);

 
var x = d3.scale.ordinal()
    .domain(histogram.map(function(d) { return d.x; }))
    .rangeRoundBands([0, width]);
 
var y = d3.scale.linear()
    .domain([0, d3.max(histogram.map(function(d) { return d.y; }))])
    .range([0, height]);

xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(6, 0);

 
var svg = d3.select("#histogram").append("svg")
    .attr("width", width)
    .attr("height", 2 * height);
 
svg.selectAll("svg")
    .data(histogram)
  .enter().append("rect")
    .attr("width", x.rangeBand())
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) { return height - y(d.y); })
    .attr("height", function(d) { return y(d.y); });

 
svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", height)
    .attr("y2", height);
  
};

//Bind the window resize to the draw method.
//A simple bind example is

//$(window).resize(function() {
//  draw_histogram(div_name, pos_data, neg_data);
//});
