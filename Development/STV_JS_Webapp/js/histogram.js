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
  const m_histogramData = [];
  for (let i = 0; i < TRIPMATRIX.length; i++) {
    const m_data = $.extend(true, [], TRIPMATRIX[i]);
    spliceMatrix(m_data);
    spliceSubTripMatrix(m_data);
    var m_dataCount = 0;
    jQuery.each(m_data, (i, val) => {
      m_dataCount += getIndividualDataCount(val);
    });
    if (i === TIME1) {
      m_histogramData.push([i.toString(), m_dataCount, '#e74c3c']);
    } else {
      m_histogramData.push([i.toString(), m_dataCount]);
    }
  }
  renderHistogram(m_histogramData, 'hour');
}

/**
 * Generate data for Zone Histogram.
 * 
 */
function generateZoneHistogramData() {
  const m_histogramData = [];
  const m_zoneData = $.extend(true, [], zoneT[TIME1]);
  spliceMatrix(m_zoneData);
  var m_counts = getTotalDataCount(data);
  generateColorForZone(m_zoneData, m_counts[1], m_counts[2]);
  jQuery.each(m_zoneData, (i, val) => {
    m_histogramData.push([val.ZoneName, val.Data, val.color]);
  });
  renderHistogram(m_histogramData, 'zone');
}

/**
 * Render the Histogram with input data and type.
 * 
 * @param {Array.<any[]>} input - The input data for histogram.
 * @param {string} type - Type of the histogram to be rendered, either Zone or Hour.
 */
function renderHistogram(input, type) {
  $('#histogram').empty();
  const m_inputData = anychart.data.set(input);
  // create a chart
  m_histogramChart = anychart.column();

  const m_credits = m_histogramChart.credits();
  m_credits.enabled(false);

  // create a column series and set the data
  const m_dataMap = m_inputData.mapAs({
    x: [0],
    value: [1],
    fill: [2],
    stroke: [2],
  });

  const m_series = m_histogramChart.column(m_dataMap);
  var m_label;
  var m_dimension = getDataDimension();
  if (m_dimension === 'trip') {
    m_label = "Trips: ";
  } else if (m_dimension === 'price') {
    m_label = "Price: ";
  } else if (m_dimension === 'distance') {
    m_label = "Distance: ";
  }

  m_series.tooltip()
    .useHtml(true)
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      if (type === 'hour') {
        return `<span>Hour: ${this.getData('x')} to ${parseInt(this.getData('x')) + 1} <br/>` + m_label + `${this.getData('value')}</span>`;
      }
      return `<span>Taxizone: ${this.getData('x')} <br/>` + m_label + `${this.getData('value')}</span>`;
    });

  if (type === 'hour') {
    var m_xAxis = m_histogramChart.xAxis().title('Hour');
    m_histogramChart.listen('pointClick', (e) => {
      TIME1 = e.pointIndex;
      animationSetData();
      toggleAnimation(true);
    });
  } else {
    var m_xAxis = m_histogramChart.xAxis().title('Zone');
    m_histogramChart.listen('pointClick', (e) => {
      highlightZone(ZONES[e.pointIndex].ZoneId);
      toggleAnimation(true);
    });
  }
  const m_yAxis = m_histogramChart.yAxis().title('Trips').orientation('right');

  m_histogramChart.contextMenu(false);
  m_histogramChart.barGroupsPadding(0);
  m_histogramChart.container('histogram').draw();
}