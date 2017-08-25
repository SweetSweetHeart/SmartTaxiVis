/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Helper
 */

$(() => {
  initGlobalVariables();
  initSliders();
  initChordDiagram();
  formatJSON();
  $('[data-toggle="popover"]').popover({
    trigger: 'manual',
  });
  $('#hourSlider').popover('show');
  $('#zoneSlider').popover('show');

  $('#btn_pause').click(() => {
    toggleAnimation(false);
  });

  $('#histogramZone, #histogramHour').change(() => {
    generateHistogram();
    toggleAnimation(true);
  });

  $('#chordTrip, #chordPrice,#chordDistance').change(() => {
    formatJSON();
    toggleAnimation(true);
  });

  chordAnimation();
});


/**
 * Initialise global variables needed for the application.
 * 
 */
function initGlobalVariables() {
  // Some global variables needed.

  /**
   * Total number of taxi zones.
   * @type {number}
   */
  TOTALZONENUM = 263;

  /**
   * Starting index of taxi zones selected.
   * @type {number}
   */
  ZONE1 = 1;

  /**
   * Ending index of taxi zones selected.
   * @type {number}
   */
  ZONE2 = 40;

  /**
   * Starting index of hours selected.
   * @type {number}
   */
  TIME1 = 9;

  $('#hour').html(TIME1);
  /**
   * Starting index of hours selected.
   * @type {number}
   */
  TIME2 = 15;

  /**
   * A noUiSlider for taxi zones.
   * @type {noUiSlider}
   * @see {@link https://refreshless.com/nouislider/}
   */
  ZONESLIDER = document.getElementById('zoneSlider');

  /**
   * A noUiSlider for hours of the day.
   * @type {noUiSlider}
   * @see {@link https://refreshless.com/nouislider/}
   */
  HOURSLIDER = document.getElementById('hourSlider');

  // Some default values to play with, before the server returns actual data



  /**
   * The point that represents a taxizone, corresponding to the clicked path on Chord Diagram.
   * @type {anychart.core.SeriesPoint}
   * @see {@link https://api.anychart.com/7.14.3/anychart.core.SeriesPoint}
   */
  POINTCLICKED = null;

  /**
   * Store the last Chord layout for next update.
   * @see {@link https://github.com/d3/d3-3.x-api-reference/blob/master/Chord-Layout.md#chord}
   * @returns {d3.layout} - The sorted D3 Chord Diagram layout.
   */
  LASTLAYOUT = null;

  /**
   * Store an anymap instance.
   * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map}
   */
  MAP = null;

}


/**
 * Initialise a noUiSlider for zones and hours.
 * @see {@link https://refreshless.com/nouislider/}
 */
function initSliders() {
  noUiSlider.create(ZONESLIDER, {
    tooltips: true,
    format: wNumb({
      decimals: 0,
    }),
    start: [1, ZONE2],
    step: 1,
    behaviour: 'drag-tap',
    connect: true,
    range: {
      min: 1,
      max: TOTALZONENUM,
    },
  });

  ZONESLIDER.noUiSlider.on('change', (values) => {
    ZONE1 = parseInt(values[0]);
    ZONE2 = parseInt(values[1]);
    toggleAnimation(true);
    formatJSON();
  });

  noUiSlider.create(HOURSLIDER, {
    tooltips: true,
    animate: true,
    format: wNumb({
      decimals: 0,
    }),
    start: TIME1,
    step: 1,
    range: {
      min: [0],
      max: [23],
    },
  });

  HOURSLIDER.noUiSlider.on('change', (values) => {
    TIME1 = parseInt(values[0]);
    animationSetData();
    toggleAnimation(true);
    formatJSON();
  });
}


/**
 * Return the current data dimension being visualised.
 * 
 * @returns {string} - The current data dimension being visualised.
 */
function getDataDimension() {
  if ($('#chordTrip').is(':checked')) {
    return 'trip';
  } else if ($('#chordPrice').is(':checked')) {
    return 'price';
  } else if ($('#chordDistance').is(':checked')) {
    return 'distance';
  }
}


/**
 * Splice the input array based on the ZONES selected.
 * 
 * @param {number[]|string[]} matrix - A matrix that contains the input data.
 * @returns {number[]|string[]} - The spliced array with the selected ZONES only.
 */
function spliceMatrix(matrix) {
  matrix.splice(0, ZONE1 - 1);
  matrix.splice(ZONE2 - (ZONE1 - 1), matrix.length);
  return matrix;
}


/**
 * Splice the input nested array based on the ZONES selected, for data count matrix.
 * 
 * @param {number[]} matrix - A matrix that contains the input data.
 * @returns  {number[]} - The spliced array with the selected ZONES only.
 */

function spliceSubTripMatrix(matrix) {
  jQuery.each(matrix, (i, val) => {
    spliceMatrix(val);
  });
  return matrix;
}



/**
 * Toggle the display of 'No Match' message, visulisations and controls.
 * @deprecated since issue #12 Dynamic ranged colormap.
 * @param {boolean} toggle - If True: displays the message.
 */
function toggleNoMatchMessage(toggle) {
  if (!toggle) {
    $('.visualisationRow:hidden').show();
    $('.controlRow:hidden').show();
    $('#nomatch:visible').hide();
  } else {
    $('.visualisationRow:visible').hide();
    $('.controlRow:visible').hide();
    $('#nomatch:hidden').show();
  }
}

/**
 * Iterate the input matrix and sum up all count. Also calcualte the largest and the smallest values in the input data.
 * 
 * @param {Array.<number[]>} data - A matrix that contains the input data
 * @returns {number[]} - An array with total data count, the largest and the smallest values in the input data.
 */
function getTotalDataCount(data) {
  let m_dataCount = 0;
  let m_maxCount = 0;
  let m_minCount = 0;

  jQuery.each(data, (i, val) => {
    var m_count = getIndividualDataCount(val);
    m_dataCount += m_count;

    if (m_count > m_maxCount)
      m_maxCount = m_count;

    if (m_count < m_minCount)
      m_minCount = m_count;
  });

  return [m_dataCount, m_maxCount, m_minCount];
}


/**
 * Calculate the given data count.
 * 
 * @param {string} data - The input data count data in JSON.
 * @returns {number[]} - The total data count.
 */
function getIndividualDataCount(data) {
  let m_count = 0;
  jQuery.each(data, (i, val) => {
    m_count += parseInt(val);
  });
  return m_count;
}



/**
 * Based on the largest and the smallest data count for all ZONES, generate a set of colors for ZONES on the Chord Diagram.
 * 
 * @param {string[]} zone - A matrix that contains input taxi ZONES.
 * @param {number} maxCount - The largest data count for all ZONES.
 * @param {number} minCount - The smallest data count for all ZONES.
 */
function generateColorForZone(zone, maxCount, minCount) {
  jQuery.each(zone, (i, val) => {
    val.color = generateRainBowColorMap(getIndividualDataCount(data[i]), maxCount, minCount);
  });
}



/**
 * Generate a rainbow color map based on the ratio of data count and the min/max data count.
 * 
 * @param {number} data  - Data count of one zone as the dividend.
 * @param {number} max - Max data count in the selected dataset.
 * @param {number} min - Min data count in the selected dataset.
 * @returns {string} - A HSL color. 
 */
function generateRainBowColorMap(data, maxCount, minCount) {
  const i = Math.abs(((data - minCount) / (maxCount - minCount)) * 100 - 100);

  // if (lowerColor > i)
  //   lowerColor = i;

  // if (higherColor < i)
  //   higherColor = i;

  return `hsl(${i},83%,50%)`;
}