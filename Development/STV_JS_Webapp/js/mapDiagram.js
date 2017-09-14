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

  const credits = MAP.credits();
  credits.enabled(false);

  /** Create a AnyMap base MAP */
  MAP.unboundRegions()
    .enabled(true)
    .fill('#E1E1E1')
    .stroke('#D2D2D2');

  /** Map geojson data for drawing taxizone contours */
  MAP.geoData('anychart.maps.taxizone');

  /** IMPORTANT!!! MAP ID field to geojson ID field */
  MAP.geoIdField('LocationID');

  const choroplethSeries = MAP.choropleth(connectorBase);
  choroplethSeries.id('choropleth');
  choroplethSeries.enabled(false);
  choroplethSeries.legendItem().enabled(false);

  jQuery.each(ZONE_HOLDER, (i, val) => {
    const seriesData = anychart.data.set([val]);

    /** Map data attributes. 
     * @type {anychart.data.Mapping}
     * @see {@link https://api.anychart.com/7.14.3/anychart.data.Set#mapAs}
     */
    const newSeries = seriesData.mapAs(null, {
      name: 'ZoneName',
      id: 'ZoneId',
      size: 'Data',
      color: 'color',
    });
    createMarkerSeries(val.ZoneName, newSeries, val.color);
  });

  /** Disable MAP legend */
  MAP.legend().enabled(false);

  /**
   * Create zoom controllers for the MAP.
   * @type {anychart.ui.Zoom}
   * @see {@link https://api.anychart.com/7.14.3/anychart.ui#zoom}
   */
  const zoomController = anychart.ui.zoom();
  zoomController.render(MAP);

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
function createMarkerSeries(name, input, color) {
  /** Set marker series.
   * @see {@link https://api.anychart.com/7.14.3/anychart.charts.Map#marker}
   * @type {anychart.core.MAP.series.Marker}
   */
  const series = MAP.marker(input).name(name);
  series.legendItem({
    iconType: 'circle',
    iconFill: color,
    iconStroke: '2 #E1E1E1',
  });

  const dimension = getDataDimension();

  /** Set Tooltip for series */
  series.tooltip()
    .useHtml(true)
    .padding([8, 13, 10, 13])
    .title(false)
    .separator(false)
    .fontSize(14)
    .format(function () {
      if (dimension === 'trip') {
        return `<span>${this.getData('name')}</span><br>` +
          `<span style="font-size: 12px; color: #E1E1E1">Total trips: ${
            parseInt(this.getData('size')).toLocaleString()}</span>`;
      }
      return `<span>${this.getData('name')}</span>`;
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
    if (POINTCLICKED != null) {
      POINTCLICKED.selected(false);
    }

    POINTCLICKED = e.point;
    POINTCLICKED.selected(true);
    removeMapSeries('connector');
    // MAP.zoomToFeature(POINTCLICKED.get('id'));
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
  const series = MAP.getSeries('choropleth');
  /** find regions with proper ids */
  const pointIndex1 = series.data().find('id', pointA);
  const pointIndex2 = series.data().find('id', pointB);
  /** get the bounds of the first region */
  const point1 = series.getPoint(pointIndex1);
  const bounds1 = point1.getFeatureBounds();
  /** get the bounds of the second region */
  const point2 = series.getPoint(pointIndex2);
  const bounds2 = point2.getFeatureBounds();

  const half = 2;

  /** transformers pixel coordinates to latitude and longitude */
  const latLong1 = MAP.inverseTransform(bounds1.left + bounds1.width / half, bounds1.top + bounds1.height / half);
  const latLong2 = MAP.inverseTransform(bounds2.left + bounds2.width / half, bounds2.top + bounds2.height / half);

  const floatPrecision = 7;
  /** return an array to be used in connector series */
  return [parseFloat((latLong1.lat).toFixed(floatPrecision)),
    parseFloat((latLong1.long).toFixed(floatPrecision)),
    parseFloat((latLong2.lat).toFixed(floatPrecision)),
    parseFloat((latLong2.long).toFixed(floatPrecision)),
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
 * @param {boolean} zoom - Decide whether should zoom in onto the zone.
 */
function highlightPoint(zone, zoom) {
  if (POINTCLICKED != null) {
    if (POINTCLICKED.get('id') != zone.ZoneId) {
      POINTCLICKED.selected(false);
    }
  }
  const seriesId = zone.ZoneName;
  const targetSeries = MAP.getSeries(seriesId);
  const pointIndex = targetSeries.data().find('id', zone.ZoneId);

  if (POINTCLICKED != null) {
    if (POINTCLICKED.get('id') != zone.ZoneId) {
      POINTCLICKED = targetSeries.getPoint(pointIndex);
      POINTCLICKED.selected(true);
      if (zoom) {
        MAP.zoomToFeature(zone.ZoneId);
      } else {
        $('.anychart-zoom-zoomFitAll').click();
      }
    }
  } else {
    POINTCLICKED = targetSeries.getPoint(pointIndex);
    POINTCLICKED.selected(true);
    if (zoom) {
      MAP.zoomToFeature(zone.ZoneId);
    } else {
      $('.anychart-zoom-zoomFitAll').click();
    }
  }
}

/**
 * Highlight the the selected zone on the MAP.
 * 
 * @param {string} zoneId - The ID of the zone that should be highlighted.
 */
function highlightZone(zoneId) {
  removeMapSeries('highlightZone');
  const highlightZone = MAP.choropleth([{
    id: zoneId,
  }]);
  highlightZone.id('highlightZone');
  highlightZone.enabled(true);
  highlightZone.legendItem().enabled(false);
  MAP.zoomToFeature(zoneId);
  highlightZone.tooltip().enabled(false);
}

/**
 * Add a Connector series to the base MAP.
 * 
 * @param {string} connectorData - The JSON data to be added to the base MAP as a Connector series.
 */
function addConnectorSeries(connectorData) {
  for (let index = 0; index < ZONE2; index++) {
    removeMapSeries(`connector${index}`);
  }

  jQuery.each(connectorData, (i, val) => {
    const connectorSeries = MAP.connector([val]);
    connectorSeries.id(`connector${i}`);
    connectorSeries.fill(val.color).hoverFill(val.color).stroke(val.color).hoverStroke(val.color);

    const weightMultiplier = 50;
    if (val.weight !== 0) {
      connectorSeries.endSize(val.weight * weightMultiplier + 1);
    }

    const markerSize = 20;
    const markerHoverSize = 25;

    connectorSeries.markers().position('95%').size(markerSize);
    connectorSeries.hoverMarkers().size(markerHoverSize);

    connectorSeries.tooltip().format(`${val.data} trips from ${val.from} to ${val.to}`);
    connectorSeries.legendItem().enabled(false);
    connectorSeries.listen('pointClick', (e) => {
      toggleAnimation(true);
    });
  });
}
