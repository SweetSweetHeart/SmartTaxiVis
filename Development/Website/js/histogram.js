histogramData = [];

function generateHistogramData() {
    for (var i = 0; i < countT.length; i++) {
        var trips = $.extend(true, [], countT[i]);
        spliceMatrix(trips);
        spliceSubMatrix(trips);
        var tripCount = 0;
        jQuery.each(trips, function (i, val) {
            tripCount += getTripCount(val);
        });
        if (i == time1) {
            histogramData.push([i.toString(), tripCount, "#e74c3c"]);
        }
        else
            histogramData.push([i.toString(), tripCount]);
    }
    generateHistogram();
}

function generateHistogram() {
    // create a data set
    $('#histogram').html("");
    var data = anychart.data.set(histogramData);

    // create a chart
    histogramChart = anychart.column();
    // create a column series and set the data

    var dataMap = data.mapAs({ x: [0], value: [1], fill: [2] });

    var series = histogramChart.column(dataMap);

    series.tooltip()
        .useHtml(true)
        .title(false)
        .separator(false)
        .fontSize(14)
        .format(function () {
            return '<span>Hour: ' + this.getData('x') + " to " + (parseInt(this.getData('x')) + 1) + " <br/>" + "Trips: " + this.getData('value') + '</span>';
        });

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
