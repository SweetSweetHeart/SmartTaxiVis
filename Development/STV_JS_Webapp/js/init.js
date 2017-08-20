/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Initialiser
 */

/**
 * Initialise a noUiSlider for zones and hours.
 * @see {@link https://refreshless.com/nouislider/}
 */
function initSliders() {
  noUiSlider.create(zoneSlider, {
    tooltips: true,
    format: wNumb({
      decimals: 0,
    }),
    start: [1, zone2],
    step: 1,
    behaviour: 'drag-tap',
    connect: true,
    range: {
      min: 1,
      max: totalZoneNum,
    },
  });

  zoneSlider.noUiSlider.on('change', (values) => {
    zone1 = parseInt(values[0]);
    zone2 = parseInt(values[1]);
    toggleAnimation(true);
    formatJSON();
  });

  noUiSlider.create(hourSlider, {
    tooltips: true,
    animate: true,
    format: wNumb({
      decimals: 0,
    }),
    start: time1,
    step: 1,
    range: {
      min: [0],
      max: [23],
    },
  });

  hourSlider.noUiSlider.on('change', (values) => {
    time1 = parseInt(values[0]);
    animationSetData();
    toggleAnimation(true);
    formatJSON();
  });
}

/**
 * Initialise global variables needed for the application.
 * 
 */
function initGlobalVariables() {
  // Some global variables needed.

  /**
   * Total number of taxizones.
   * @type {number}
   */
  totalZoneNum = 263;

  /**
   * Starting index of taxizones selected.
   * @type {number}
   */
  zone1 = 1;

  /**
   * Ending index of taxizones selected.
   * @type {number}
   */
  zone2 = 20;

  /**
   * Starting index of hours selected.
   * @type {number}
   */
  time1 = 9;

  /**
   * Starting index of hours selected.
   * @type {number}
   */
  time2 = 15;

  /**
   * A noUiSlider for taxizones.
   * @type {noUiSlider}
   * @see {@link https://refreshless.com/nouislider/}
   */
  zoneSlider = document.getElementById('zoneSlider');

  /**
   * A noUiSlider for hours of the day.
   * @type {noUiSlider}
   * @see {@link https://refreshless.com/nouislider/}
   */
  hourSlider = document.getElementById('hourSlider');

  // Some default values to play with, before the server returns actual data

  zones = null;
  trips = null;

  /**
   * The point that represents a taxizone, corresponding to the clicked path on Chord Diagram.
   * @type {anychart.core.SeriesPoint}
   * @see {@link https://api.anychart.com/7.14.3/anychart.core.SeriesPoint}
   */
  pointClickedViaPath = null;

  lastLayout = null;

  // chordLegendColor = [];
}

$(() => {
  initGlobalVariables();
  initChordDiagram();
  renderMap();
  formatJSON();
  initSliders();
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
  chordAnimation();
});