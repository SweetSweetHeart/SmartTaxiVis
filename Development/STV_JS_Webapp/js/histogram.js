/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/Histogram
 * @requires Initialiser
 */


/**
 * Start generating histogram.
 * 
 */
function generateHistogram() {
  if ($('#histogramZone').is(':checked')) {
    generateZoneHistogramData();
  }
  if ($('#histogramHour').is(':checked')) {
    generateHourHistogramData();
  }
}


/**
 * Generate data for Hour Histogram.
 * 
 */
function generateHourHistogramData() {
  const histogramData = [];
  for (let i = 0; i < tripT.length; i++) {
    const data = $.extend(true, [], tripT[i]);
    spliceMatrix(data);
    spliceSubTripMatrix(data);
    var dataCount = 0;
    jQuery.each(data, (i, val) => {
      dataCount += getIndividualDataCount(val);
    });
    if (i === TIME1) {
      histogramData.push([i.toString(), dataCount, '#e74c3c']);
    } else {
      histogramData.push([i.toString(), dataCount]);
    }
  }
  renderHistogram(histogramData, 'hour');
}

/**
 * Generate data for Zone Histogram.
 * 
 */
function generateZoneHistogramData() {
  const histogramData = [];
  const zoneData = $.extend(true, [], zoneT[TIME1]);
  spliceMatrix(zoneData);
  var counts = getTotalDataCount(data);
  generateColorForZone(zoneData, counts[1], counts[2]);
  jQuery.each(zoneData, (i, val) => {
    histogramData.push([val.ZoneName, val.Data, val.color]);
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
      TIME1 = e.pointIndex;
      animationSetData();
      toggleAnimation(true);
    });
  } else {
    var xAxis = histogramChart.xAxis().title('Zone');
    histogramChart.listen('pointClick', (e) => {
      highlightZone(zones[e.pointIndex].ZoneId);
      toggleAnimation(true);
    });
  }
  const yAxis = histogramChart.yAxis().title('Trips').orientation('right');

  histogramChart.contextMenu(false);
  histogramChart.barGroupsPadding(0);
  histogramChart.container('histogram').draw();
}