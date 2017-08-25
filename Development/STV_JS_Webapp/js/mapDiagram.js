/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/MapView
 * @requires Helper
 */

$(window).resize(() => {
  $('#anymap').css('height', $('#anymap').css('width'));
});

anychart.licenseKey('689404@swansea.ac.uk-52d848b-7c97169e');

/**
 * Render a Choropleth MAP as base series, add Marker series on top of the base series.
 */
function generateMap() {
  $('#anymap').empty();
  MAP = anychart.map();

  const m_credits = MAP.credits();
  m_credits.enabled(false);

  /** Create a AnyMap base MAP */
  MAP.unboundRegions()
    .enabled(true)
    .fill('#E1E1E1')
    .stroke('#D2D2D2');

  /** Map geojson data for drawing taxizone contours */
  MAP.geoData('anychart.maps.taxizone');

  /** IMPORTANT!!! MAP ID field to geojson ID field */
  MAP.geoIdField('LocationID');

  const m_choroplethSeries = MAP.choropleth(connectorBase);
  m_choroplethSeries.id('choropleth');
  m_choroplethSeries.enabled(false);
  m_choroplethSeries.legendItem().enabled(false);

  jQuery.each(ZONES, (i, val) => {
    const m_dataLoop = anychart.data.set([val]);
    /** Map data attributes. 
     * @type {anychart.data.Mapping}
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set#mapAs}
     */
    const m_loopSeries = m_dataLoop.mapAs(null, {
      name: 'ZoneName',
      id: 'ZoneId',
      size: 'Data',
      color: 'color',
    });
    createDotSeries(val.ZoneName, m_loopSeries, val.color);
  });

  /** Disable MAP legend */
  MAP.legend().enabled(false);

  /**
   * Create zoom controllers for the MAP.
   * @type {anychart.ui.Zoom}
   * @see {@link https://api.anychart.com/7.14.3/anychart.ui#zoom}
   */
  const m_zoomController = anychart.ui.zoom();
  m_zoomController.render(MAP);

  /** Disable context menu */
  MAP.contextMenu(false);

  /** Set MAP inteactions */
  // var interactivity = MAP.interactivity();
  // interactivity.zoomOnMouseWheel(false);
  // interactivity.zoomOnDoubleClick(false);

  /** Initiates the drawing into the div with id anymap */
  MAP.container('anymap').draw();

  $('#anymap').css('height', $('#anymap').css('width'));
}


/** 
 * Create a marker series.
 * 
 * @param {string} name - Name of the marker series.
 * @param {any} input - Data of the marker series.
 * @param {string} color - Color of the marker series.
 * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map#marker}
 */
function createDotSeries(name, input, color) {
  /** Set marker series.
   * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map#marker}
   * @type {anychart.core.MAP.series.Marker}
   */
  const m_series = MAP.marker(input).name(name);
  m_series.legendItem({
    iconType: 'circle',
    iconFill: color,
    iconStroke: '2 #E1E1E1',
  });
  var m_label;

  var m_dimension = getDataDimension();
  if (m_dimension === 'trip') {
    m_label = "Trips: ";
  } else if (m_dimension === 'price') {
    m_label = "Price: ";
  } else if (m_dimension === 'distance') {
    m_label = "Distance: ";
  }

  /** Set Tooltip for series */
  m_series.tooltip()
    .useHtml(true)
    .padding([8, 13, 10, 13])
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      return `<span>${this.getData('name')}</span><br />` +
        `<span style="font-size: 12px; color: #E1E1E1">${m_label} ${
        parseInt(this.getData('size')).toLocaleString()}</span>`;
    });
  /** Set styles for marker */
  m_series.selectionMode('none')
    .stroke('2 #757575')
    .hoverStroke('3 #616161')
    .fill(color)
    .size(5)
    .labels(false)
    .hoverFill('#e74c3c')
    .hoverSize(8)
    .selectType('star7')
    .selectFill('#e74c3c')
    .selectSize(10)
    .type('circle');
  m_series.id(name);
  m_series.listen('pointClick', (e) => {
    if (POINTCLICKED != null) {
      POINTCLICKED.selected(false);
    }

    POINTCLICKED = e.point;
    POINTCLICKED.selected(true);
    removeMapSeries('connector');
    MAP.zoomToFeature(POINTCLICKED.get('id'));
    toggleAnimation(true);
  });
}

/**
 * Filter function to bind data to variables only within the range.
 * @param {number} start - The start range value.
 * @param {number} end - The end range value.
 * @returns {number} - The filtered result.
 */
function filterMarkerRange(start, end) {
  if (end) {
    return function (val) {
      return start <= val && val < end;
    };
  }
  return function (val) {
    return start <= val;
  };
}

/**
 * Generate a Connector coordinate from point A to point B
 * @param {anychart.core.SeriesPoint} pointA - Point A.
 * @param {anychart.core.SeriesPoint} pointB - Point B.
 * @see {@link https://api.anychart.com/7.14.3/anychart.core.SeriesPoint}
 * @returns {string} - A Connector coordinate in JSON.
 */
function getConnector(pointA, pointB) {
  /** get the choropleth series */
  const m_series = MAP.getSeries('choropleth');
  /** find regions with proper ids */
  const m_pointIndex1 = m_series.data().find('id', pointA);
  const m_pointIndex2 = m_series.data().find('id', pointB);
  /** get the bounds of the first region */
  const m_point1 = m_series.getPoint(m_pointIndex1);
  const m_bounds1 = m_point1.getFeatureBounds();
  /** get the bounds of the second region */
  const m_point2 = m_series.getPoint(m_pointIndex2);
  const m_bounds2 = m_point2.getFeatureBounds();

  /** transformers pixel coordinates to latitude and longitude */
  const m_latLong1 = MAP.inverseTransform(m_bounds1.left + m_bounds1.width / 2, m_bounds1.top + m_bounds1.height / 2);
  const m_latLong2 = MAP.inverseTransform(m_bounds2.left + m_bounds2.width / 2, m_bounds2.top + m_bounds2.height / 2);

  /** return an array to be used in connector series */
  return [parseFloat((m_latLong1.lat).toFixed(7)),
    parseFloat((m_latLong1.long).toFixed(7)),
    parseFloat((m_latLong2.lat).toFixed(7)),
    parseFloat((m_latLong2.long).toFixed(7))
  ];
}


/**
 * Remove a MAP series with its ID.
 * 
 * @param {string} seriesId - The ID of targeted series.
 */
function removeMapSeries(seriesId) {
  if (MAP.getSeries(seriesId) != null) {
    MAP.removeSeries(seriesId);
  }
}


/**
 * Highlight the corresponding marker of the selected zone on the MAP.
 * 
 * @param {string} zone - The marker that should be highlighted.
 */
function highlightPoint(zone) {
  if (POINTCLICKED != null) {
    if (POINTCLICKED.get('id') != zone.ZoneId) {
      POINTCLICKED.selected(false);
    }
  }
  const m_seriesId = zone.ZoneName;
  const m_targetSeries = MAP.getSeries(m_seriesId);
  const m_pointIndex = m_targetSeries.data().find('id', zone.ZoneId);

  if (POINTCLICKED != null) {
    if (POINTCLICKED.get('id') != zone.ZoneId) {
      POINTCLICKED = m_targetSeries.getPoint(m_pointIndex);
      POINTCLICKED.selected(true);
      MAP.zoomToFeature(zone.ZoneId);
    }
  } else {
    POINTCLICKED = m_targetSeries.getPoint(m_pointIndex);
    POINTCLICKED.selected(true);
    MAP.zoomToFeature(zone.ZoneId);
  }
}

/**
 * Highlight the the selected zone on the MAP.
 * 
 * @param {string} zoneId - The ID of the zone that should be highlighted.
 */
function highlightZone(zoneId) {
  removeMapSeries('highlightZone');
  const m_highlightZone = MAP.choropleth([{
    id: zoneId,
  }]);
  m_highlightZone.id('highlightZone');
  m_highlightZone.enabled(true);
  m_highlightZone.legendItem().enabled(false);
  MAP.zoomToFeature(zoneId);
}

/**
 * Add a Connector series to the base MAP.
 * 
 * @param {string} connectorData - The JSON data to be added to the base MAP as a Connector series.
 */
function addConnectorSeries(connectorData) {
  /** add connector series */
  removeMapSeries('connector');
  const m_connectorSeries = MAP.connector(connectorData);
  m_connectorSeries.id('connector');
  m_connectorSeries.tooltip().format('{%from} - {%to}');
  m_connectorSeries.legendItem().enabled(false);
  m_connectorSeries.listen('pointClick', (e) => {
    toggleAnimation(true);
  });
}