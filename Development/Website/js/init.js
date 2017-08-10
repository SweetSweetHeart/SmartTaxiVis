/**
 * @author Qiru Wang <689404@swansea.ac.uk>
 * 
 */

/**
 * @module Initialisation
 */

/**
 * Initialise a noUiSlider for zones and hours.
 * @see {@link https://refreshless.com/nouislider/}
 */
function initSliders() {
    noUiSlider.create(zoneSlider, {
        tooltips: true,
        format: wNumb({
            decimals: 0
        }),
        start: [1, zone2],
        step: 1,
        behaviour: 'drag-tap',
        connect: true,
        range: {
            'min': 1,
            'max': totalZoneNum
        }
    });

    zoneSlider.noUiSlider.on('change', function (values) {
        zone1 = values[0];
        zone2 = values[1];
        toggleAnimation(true);
        formatJSON();
    });

    noUiSlider.create(hourSlider, {
        tooltips: true,
        animate: true,
        format: wNumb({
            decimals: 0
        }),
        start: time1,
        step: 1,
        range: {
            'min': [0],
            'max': [23]
        }
    });

    hourSlider.noUiSlider.on('change', function (values) {
        time1 = values[0];
        animationSetData();
        toggleAnimation(true);
        formatJSON();
    });
};

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
     */
    zoneSlider = document.getElementById('zoneSlider');

    /**
     * A noUiSlider for hours of the day.
     * @type {noUiSlider}
     */
    hourSlider = document.getElementById('hourSlider');

    // Some default values to play with, before the server returns actual data

    /**
     * Trip count matrix of the selected hour.
     * @type {Array.<number[]>}
     */
    tripMatrix = countT[time1];
    
    /**
     * Taxizone matrix of the selected hour.
     * @type {Array.<number[]>}
     */
    zoneMatrix = zoneT[time1];

    zones = $.extend(true, [], zoneMatrix);

    /**
     * The total trip count.
     * @type {number}
     */
    tripCount = getTripCount(tripMatrix);

    // Assign random colors to chords
    jQuery.each(zones, function (i, val) {
        val.color = generateRainBowColorMap(val.Pickup, tripCount);
    });

    /** 
     * Connector dataset for AnyMap.
     * @see {@link https://docs.anychart.com/7.14.3/Maps/Connector_Maps}
     * @type {anychart.data.Set} 
     */
    connectorData = null;

    /** 
     * Dataset for AnyMap. 
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set} 
     * @type {anychart.data.Set} 
     */
    dataSet = anychart.data.set(zones);

    /**
     * The point that represents a taxizone, corresponding to the clicked path on Chord Diagram.
     * @type {anychart.core.SeriesPoint}
     * @see {@link https://api.anychart.com/7.14.3/anychart.core.SeriesPoint}
     */
    pointClickedViaPath = null;
}

$(function () {
    initGlobalVariables();
    initChordDiagram();
    renderMap();
    formatJSON();
    initSliders();
    $('[data-toggle="popover"]').popover({
        trigger: 'manual'
    });
    $('#hourSlider').popover('show');
    $('#zoneSlider').popover('show');

    $('#btn_pause').click(function (e) {
        e.preventDefault();
        toggleAnimation(false);
    });
    chordAnimation();      
});