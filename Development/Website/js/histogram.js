/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Histogram
 */

/**
 * Start generating histogram.
 * 
 */
function generateHistogram() {
    if ($("#histogramZone").is(":checked"))
        generateHistogramDataZone()
    else if ($("#histogramHour").is(":checked"))
        generateHistogramDataHour();
}


/**
 * Generate data for Hour Histogram.
 * 
 */
function generateHistogramDataHour() {
    var histogramData = [];
    for (var i = 0; i < countT.length; i++) {
        var trips = $.extend(true, [], countT[i]);
        spliceMatrix(trips);
        spliceSubTripMatrix(trips);
        var tripCount = 0;
        jQuery.each(trips, function (i, val) {
            tripCount += getTripCount(val);
        });
        if (i == time1) {
            histogramData.push([i.toString(), tripCount, "#e74c3c"]);
        } else
            histogramData.push([i.toString(), tripCount]);
    }
    renderHistogram(histogramData, "hour");
}

/**
 * Generate data for Zone Histogram.
 * 
 */
function generateHistogramDataZone() {
    var histogramData = [];
    var trips = $.extend(true, [], zoneT[time1]);
    spliceMatrix(trips);
    jQuery.each(trips, function (i, val) {
        histogramData.push([val.name, val.Pickup]);
    });
    renderHistogram(histogramData, "zone");
}

/**
 * 
 * 
 * @param {Array.<any[]>} input - The input data for histogram.
 * @param {string} type - Type of the histogram generate, either Zone or Hour.
 */
function renderHistogram(input, type) {
    $('#histogram').empty();
    var data = anychart.data.set(input);

    // create a chart
    histogramChart = anychart.column();
    // create a column series and set the data
    var dataMap = data.mapAs({
        x: [0],
        value: [1],
        fill: [2]
    });

    var series = histogramChart.column(dataMap);

    series.tooltip()
        .useHtml(true)
        .title(false)
        .separator(false)
        .fontSize(14)
        .format(function () {
            if (type == "hour")
                return "<span>Hour: " + this.getData('x') + " to " + (parseInt(this.getData('x')) + 1) + " <br/>" + "Trips: " + this.getData('value') + '</span>';
            else
                return "<span>Taxizone: " + this.getData('x') + " <br/>" + "Trips: " + this.getData('value') + '</span>';
        });

    if (type == "hour") {
        var xAxis = histogramChart.xAxis().title("Hour");
        histogramChart.listen("pointClick", function (e) {
            time1 = e.pointIndex;
            animationSetData();
            toggleAnimation(true);
        });
    } else {
        var xAxis = histogramChart.xAxis().title("Zone");
        histogramChart.listen("pointClick", function (e) {
            highlightZone(zones[e.pointIndex].id);
            toggleAnimation(true);
        });
    }
    var yAxis = histogramChart.yAxis().title("Trips").orientation('right');

    histogramChart.contextMenu(false);
    histogramChart.barGroupsPadding(0);
    histogramChart.container("histogram").draw();
};