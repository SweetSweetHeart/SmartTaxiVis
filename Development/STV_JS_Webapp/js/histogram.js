/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/Histogram
 * @requires Initialiser
 */

/**
 * Generate data for Hour Histogram.
 * 
 */
function generateHistogramDataHour() {
  const histogramData = [];
  for (let i = 0; i < tripT.length; i++) {
    const trips = $.extend(true, [], tripT[i]);
    spliceMatrix(trips);
    spliceSubTripMatrix(trips);
    var tripCount = 0;
    jQuery.each(trips, (i, val) => {
      tripCount += getTripCount(val);
    });
    if (i === time1) {
      histogramData.push([i.toString(), tripCount, '#e74c3c']);
    } else {
      histogramData.push([i.toString(), tripCount]);
    }
  }
  renderHistogram(histogramData, 'hour');
}

/**
 * Generate data for Zone Histogram.
 * 
 */
function generateHistogramDataZone() {
  const histogramData = [];
  const trips = $.extend(true, [], zoneT[time1]);
  spliceMatrix(trips);
  jQuery.each(trips, (i, val) => {
    histogramData.push([val.ZoneName, val.PickUpCount]);
  });
  renderHistogram(histogramData, 'zone');
}

/**
 * 
 * 
 * @param {Array.<any[]>} input - The input data for histogram.
 * @param {string} type - Type of the histogram generate, either Zone or Hour.
 */
function renderHistogram(input, type) {
  $('#histogram').empty();
  const data = anychart.data.set(input);

  // create a chart
  histogramChart = anychart.column();

  const credits = histogramChart.credits();
  credits.enabled(false);

  // create a column series and set the data
  const dataMap = data.mapAs({
    x: [0],
    value: [1],
    fill: [2],
  });

  const series = histogramChart.column(dataMap);

  series.tooltip()
    .useHtml(true)
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      if (type === 'hour') {
        return `<span>Hour: ${this.getData('x')} to ${parseInt(this.getData('x')) + 1} <br/>` + `Trips: ${this.getData('value')}</span>`;
      }
      return `<span>Taxizone: ${this.getData('x')} <br/>` + `Trips: ${this.getData('value')}</span>`;
    });

  if (type === 'hour') {
    var xAxis = histogramChart.xAxis().title('Hour');
    histogramChart.listen('pointClick', (e) => {
      time1 = e.pointIndex;
      animationSetData();
      toggleAnimation(true);
    });
  } else {
    var xAxis = histogramChart.xAxis().title('Zone');
    histogramChart.listen('pointClick', (e) => {
      highlightZone(zones[e.pointIndex].id);
      toggleAnimation(true);
    });
  }
  const yAxis = histogramChart.yAxis().title('Trips').orientation('right');

  histogramChart.contextMenu(false);
  histogramChart.barGroupsPadding(0);
  histogramChart.container('histogram').draw();
}

/**
 * Start generating histogram.
 * 
 */
function generateHistogram() {
  if ($('#histogramZone').is(':checked')) {
    generateHistogramDataZone();
  }
  if ($('#histogramHour').is(':checked')) {
    generateHistogramDataHour();
  }
}
