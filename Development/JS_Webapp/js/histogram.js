/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/Histogram
 * @requires Helper
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
  let dataMatrix = PU_MATRIX;
  if ($('#chordTripPU').is(':checked')) {
    dataMatrix = PU_MATRIX;
  } else if ($('#chordTripDO').is(':checked')) {
    dataMatrix = DO_MATRIX;
  }

  for (let i = 0; i < dataMatrix.length; i++) {
    const data = $.extend(true, [], dataMatrix[i]);
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
  const counts = getTotalDataCount(DATA_HOLDER);
  generateColorForZone(zoneData, counts[1], counts[2]);
  jQuery.each(zoneData, (i, val) => {
    histogramData.push([val.ZoneName, val.Data, val.color]);
  });
  renderHistogram(histogramData, 'zone');
}

/**
 * Render the Histogram with input data and type.
 * 
 * @param {Array.<any[]>} input - The input data for histogram.
 * @param {string} type - Type of the histogram to be rendered, either Zone or Hour.
 */
function renderHistogram(input, type) {
  $('#histogram').empty();
  const inputData = anychart.data.set(input);
  // create a chart
  histogramChart = anychart.column();

  const credits = histogramChart.credits();
  credits.enabled(false);

  // create a column series and set the data
  const dataMap = inputData.mapAs({
    x: [0],
    value: [1],
    fill: [2],
    stroke: [2],
  });

  const series = histogramChart.column(dataMap);
  let label;
  const dimension = getDataDimension();
  if (dimension === 'trip') {
    label = 'Trips: ';
  } else if (dimension === 'price') {
    label = 'Price: ';
  } else if (dimension === 'distance') {
    label = 'Distance: ';
  }

  series.tooltip()
    .useHtml(true)
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      if (type === 'hour') {
        return `<span>Hour: ${this.getData('x')} to ${parseInt(this.getData('x')) + 1} <br/>${label}${this.getData('value')}</span>`;
      }
      return `<span>Taxizone: ${this.getData('x')} <br/>${label}${this.getData('value')}</span>`;
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
      highlightZone(ZONE_HOLDER[e.pointIndex].ZoneId);
      toggleAnimation(true);
    });
  }
  const yAxis = histogramChart.yAxis().title('Trips').orientation('left');

  histogramChart.contextMenu(false);
  histogramChart.barGroupsPadding(0);
  histogramChart.container('histogram').draw();
}