/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Initialiser
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
  ZONE2 = 20;

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

  zones = null;
  data = $.extend(true, [], tripT[TIME1]);
  zoneT = zonePUT;

  lowerColor = 100;
  higherColor = 0;

  /**
   * The point that represents a taxizone, corresponding to the clicked path on Chord Diagram.
   * @type {anychart.core.SeriesPoint}
   * @see {@link https://api.anychart.com/7.14.3/anychart.core.SeriesPoint}
   */
  pointClickedViaPath = null;

  lastLayout = null;

  // chordLegendColor = [];
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
    ZONE1 = parseInt(values[0]) - 1;
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