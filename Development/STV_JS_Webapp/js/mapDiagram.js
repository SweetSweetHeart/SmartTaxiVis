/**
 * @author Qiru Wang 689404@swansea.ac.uk
 * 
 * @module Vis/MapView
 * @requires Initialiser
 */

$(window).resize(() => {
  $('#anymap').css('height', $('#anymap').css('width'));
});

anychart.licenseKey('689404@swansea.ac.uk-52d848b-7c97169e');
/**
 * Render a Choropleth map as base series, add Marker series on top of the base series.
 */
function renderMap() {
  $('#anymap').empty();
  map = anychart.map();

  const credits = map.credits();
  credits.enabled(false);

  /** Create a AnyMap base map */
  map.unboundRegions()
    .enabled(true)
    .fill('#E1E1E1')
    .stroke('#D2D2D2');

  /** Map geojson data for drawing taxizone contours */
  map.geoData('anychart.maps.taxizone');

  /** IMPORTANT!!! map ID field to geojson ID field */
  map.geoIdField('LocationID');

  const choroplethSeries = map.choropleth(connectorBase);
  choroplethSeries.id('choropleth');
  choroplethSeries.enabled(false);
  choroplethSeries.legendItem().enabled(false);

  jQuery.each(zones, (i, val) => {
    const dataLoop = anychart.data.set([val]);
    /** Map data attributes. 
     * @type {anychart.data.Mapping}
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set#mapAs}
     */
    const loopSeries = dataLoop.mapAs(null, {
      name: 'ZoneName',
      id: 'ZoneId',
      size: 'PickUpCount',
      color: 'color',
    });
    createDotSeries(val.ZoneName, loopSeries, val.color);
  });

  /** Disable map legend */
  map.legend().enabled(false);

  /**
   * Create zoom controllers for the map.
   * @type {anychart.ui.Zoom}
   * @see {@link https://api.anychart.com/7.14.3/anychart.ui#zoom}
   */
  const zoomController = anychart.ui.zoom();
  zoomController.render(map);

  /** Disable context menu */
  map.contextMenu(false);

  /** Set map inteactions */
  // var interactivity = map.interactivity();
  // interactivity.zoomOnMouseWheel(false);
  // interactivity.zoomOnDoubleClick(false);

  /** Initiates the drawing into the div with id anymap */
  map.container('anymap').draw();

  $('#anymap').css('height', $('#anymap').css('width'));
}


/** 
 * Create a marker series.
 * 
 * @param {string} name - Name of the marker series.
 * @param {any} data - Data of the marker series.
 * @param {string} color - Color of the marker series.
 * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map#marker}
 */
function createDotSeries(name, data, color) {
  /** Set marker series.
   * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map#marker}
   * @type {anychart.core.map.series.Marker}
   */
  const series = map.marker(data).name(name);
  series.legendItem({
    iconType: 'circle',
    iconFill: color,
    iconStroke: '2 #E1E1E1',
  });

  /** Set Tooltip for series */
  series.tooltip()
    .useHtml(true)
    .padding([8, 13, 10, 13])
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      return `<span>${this.getData('name')}</span><br />` +
        `<span style="font-size: 12px; color: #E1E1E1">Trips: ${
        parseInt(this.getData('size')).toLocaleString()}</span>`;
    });
  /** Set styles for marker */
  series.selectionMode('none')
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

  series.id(name);
  series.listen('pointClick', (e) => {
    if (pointClickedViaPath != null) {
      pointClickedViaPath.selected(false);
    }

    pointClickedViaPath = e.point;
    pointClickedViaPath.selected(true);
    removeMapSeries('connector');
    map.zoomToFeature(pointClickedViaPath.get('id'));
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
    return function (fieldVal) {
      return start <= fieldVal && fieldVal < end;
    };
  }
  return function (fieldVal) {
    return start <= fieldVal;
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
  const series = map.getSeries('choropleth');
  /** find regions with proper ids */
  const pointIndex1 = series.data().find('id', pointA);
  const pointIndex2 = series.data().find('id', pointB);
  /** get the bounds of the first region */
  const point1 = series.getPoint(pointIndex1);
  const bounds1 = point1.getFeatureBounds();
  /** get the bounds of the second region */
  const point2 = series.getPoint(pointIndex2);
  const bounds2 = point2.getFeatureBounds();

  /** transformers pixel coordinates to latitude and longitude */
  const latLong1 = map.inverseTransform(bounds1.left + bounds1.width / 2, bounds1.top + bounds1.height / 2);
  const latLong2 = map.inverseTransform(bounds2.left + bounds2.width / 2, bounds2.top + bounds2.height / 2);

  /** return an array to be used in connector series */
  return [parseFloat((latLong1.lat).toFixed(7)), parseFloat((latLong1.long).toFixed(7)), parseFloat((latLong2.lat).toFixed(7)), parseFloat((latLong2.long).toFixed(7))];
}


/**
 * Remove a map series with its ID.
 * 
 * @param {string} seriesId - The ID of targeted series.
 */
function removeMapSeries(seriesId) {
  if (map.getSeries(seriesId) != null) {
    map.removeSeries(seriesId);
  }
}


/**
 * Highlight the corresponding marker of the selected zone on the map.
 * 
 * @param {string} zone - The marker that should be highlighted.
 */
function highlightPoint(zone) {
  if (pointClickedViaPath != null) {
    if (pointClickedViaPath.get('id') != zone.ZoneId) {
      pointClickedViaPath.selected(false);
    }
  }
  const seriesId = zone.ZoneName;
  const targetSeries = map.getSeries(seriesId);
  const pointIndex = targetSeries.data().find('id', zone.ZoneId);

  if (pointClickedViaPath != null) {
    if (pointClickedViaPath.get('id') != zone.ZoneId) {
      pointClickedViaPath = targetSeries.getPoint(pointIndex);
      pointClickedViaPath.selected(true);
      map.zoomToFeature(zone.ZoneId);
    }
  } else {
    pointClickedViaPath = targetSeries.getPoint(pointIndex);
    pointClickedViaPath.selected(true);
    map.zoomToFeature(zone.ZoneId);
  }
}

/**
 * Highlight the the selected zone on the map.
 * 
 * @param {string} zoneId - The ID of the zone that should be highlighted.
 */
function highlightZone(zoneId) {
  removeMapSeries('highlightZone');
  const highlightZone = map.choropleth([{
    id: zoneId,
  }]);
  highlightZone.id('highlightZone');
  highlightZone.enabled(true);
  highlightZone.legendItem().enabled(false);
  map.zoomToFeature(zoneId);
}

/**
 * Add a Connector series to the base map.
 * 
 * @param {string} connectorData - The JSON data to be added to the base map as a Connector series.
 */
function addConnectorSeries(connectorData) {
  /** add connector series */
  removeMapSeries('connector');
  const connectorSeries = map.connector(connectorData);
  connectorSeries.id('connector');
  connectorSeries.tooltip().format('{%from} - {%to}');
  connectorSeries.legendItem().enabled(false);
  connectorSeries.listen('pointClick', (e) => {
    toggleAnimation(true);
  });
}