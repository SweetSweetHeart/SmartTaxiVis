histogramData = [];

function generateHistogramData() {
    for (var i = 0; i < countT.length; i++) {
        var trips = $.extend(true, [], countT[i]);
        spliceMatrix(trips);
        spliceSubMatrix(trips);
        tripCount = getTripCount(trips);
        if (i == time1) {
            histogramData.push([i.toString(), tripCount, "#e74c3c"]);
        }
        else
            histogramData.push([i.toString(), tripCount]);
    }
    drawHistogram();
}

function drawHistogram() {
    // create a data set
    $('#histogram').html("");
    var data = anychart.data.set(histogramData);

    // create a chart
    histogramChart = anychart.column();
    // create a column series and set the data

    var dataMap = data.mapAs({ x: [0], value: [1], fill: [2] });

    var series = histogramChart.column(dataMap);

    // set the chart title
    // chart.title("Histogram");

    // set the padding between column groups
    histogramChart.barGroupsPadding(0);

    // set the titles of the axes
    var xAxis = histogramChart.xAxis().title("Hour")
    var yAxis = histogramChart.yAxis().title("Trips").orientation('right');

    histogramChart.contextMenu(false);

    histogramChart.listen("pointClick", function (e) {
        time1 = e.pointIndex;
        animationSetData();
        toggleAnimation(true);
    });
    // set the container id
    histogramChart.container("histogram").draw();
};
