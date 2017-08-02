function renderMap() {
    $('#anymap').html("");

    // Create AnyMap chart
    map = anychart.map();

    map.unboundRegions()
        .enabled(true)
        .fill('#E1E1E1')
        .stroke('#D2D2D2');

    // Map geojson data for drawing taxizone contours
    map.geoData('anychart.maps.taxizone');

    // IMPORTANT!!! map ID field to geojson ID field
    map.geoIdField("LocationID");

    var tempSeries = map.choropleth(connectorBase);
    tempSeries.id('helper');
    tempSeries.enabled(false);
    tempSeries.legendItem().enabled(false);



    // Helper function to create several series
    var createSeries = function (name, data, color) {
        // Set marker series
        var series = map.marker(data).name(name);
        series.legendItem({
            iconType: "circle",
            iconFill: color,
            iconStroke: '2 #E1E1E1'
        });

        // Set Tooltip for series
        series.tooltip()
            .useHtml(true)
            .padding([8, 13, 10, 13])
            .title(false)
            .separator(false)
            .fontSize(14)
            .format(function () {
                return '<span>' + this.getData('name') + '</span><br />' +
                    '<span style="font-size: 12px; color: #E1E1E1">Trips: ' +
                    parseInt(this.getData('size')).toLocaleString() + '</span>';
            });

        // Set styles for marker
        series.selectionMode("none")
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

        series.id(color);

        series.listen("pointClick", function (e) {
            if (pointClickedViaPath != null)
                pointClickedViaPath.selected(false);

            pointClickedViaPath = e.point;
            pointClickedViaPath.selected(true);
            removeMapSeries('connector');
            map.zoomToFeature(pointClickedViaPath.get("id"));
            toggleAnimation(true);
        });
    };

    // Map data attributes
    var markerSeries = dataSet.mapAs(null, {
        name: 'name',
        id: 'id',
        size: 'Pickup'
    });

    createSeries('0 - 200', markerSeries.filter('size', filter_function(0, 200)), '#80deea');
    createSeries('200 - 400', markerSeries.filter('size', filter_function(200, 400)), '#26c6da');
    createSeries('400 - 600', markerSeries.filter('size', filter_function(400, 600)), '#00acc1');
    createSeries('600 - 800', markerSeries.filter('size', filter_function(600, 800)), '#0097a7');
    createSeries('800 - 1,000', markerSeries.filter('size', filter_function(800, 1000)), '#00838f');
    createSeries('More than 1,000', markerSeries.filter('size', filter_function(1000)), '#006064');

    // Enable map legend
    map.legend().enabled(false);

    // Create zoom controls
    var zoomController = anychart.ui.zoom();
    zoomController.render(map);

    // Disable context menu
    map.contextMenu(false);

    // Set map inteactions
    //var interactivity = map.interactivity();
    //interactivity.zoomOnMouseWheel(false);
    //interactivity.zoomOnDoubleClick(false);

    // Initiates chart drawing in to the div with id anymap
    map.container('anymap').draw();
};

// Helper function to bind data field to the local var.
function filter_function(val1, val2) {
    if (val2)
        return function (fieldVal) {
            return val1 <= fieldVal && fieldVal < val2;
        };
    else
        return function (fieldVal) {
            return val1 <= fieldVal;
        };
}

function getConnector(id1, id2) {
    // get the helper series
    var series = map.getSeries('helper');

    // find regions with proper ids
    var pointIndex1 = series.data().find("id", id1);
    var pointIndex2 = series.data().find("id", id2);
    // get the bounds of the first region
    var point1 = series.getPoint(pointIndex1);
    var bounds1 = point1.getFeatureBounds();
    // get the bounds of the second region
    var point2 = series.getPoint(pointIndex2);
    var bounds2 = point2.getFeatureBounds();

    // transformers pixel coordinates to latitude and longitude
    var latLong1 = map.inverseTransform(bounds1.left + bounds1.width / 2, bounds1.top + bounds1.height / 2);
    var latLong2 = map.inverseTransform(bounds2.left + bounds2.width / 2, bounds2.top + bounds2.height / 2);

    // return an array to be used in connector data set
    return [parseFloat((latLong1.lat).toFixed(7)), parseFloat((latLong1.long).toFixed(7)), parseFloat((latLong2.lat).toFixed(7)), parseFloat((latLong2.long).toFixed(7))];
}

function highlightPoint(data) {
    if (pointClickedViaPath != null)
        if (pointClickedViaPath.get('id') != data.id)
            pointClickedViaPath.selected(false);

    var pickup = data.Pickup;
    var seriesId;
    if (pickup < 200)
        seriesId = '#80deea';
    else if (pickup < 400)
        seriesId = '#26c6da';
    else if (pickup < 600)
        seriesId = '#00acc1';
    else if (pickup < 800)
        seriesId = '#0097a7';
    else if (pickup < 1000)
        seriesId = '#00838f';
    else
        seriesId = '#006064';

    var targetSeries = map.getSeries(seriesId);

    var pointIndex = targetSeries.data().find("id", data.id);

    if (pointClickedViaPath != null) {
        if (pointClickedViaPath.get('id') != data.id) {
            pointClickedViaPath = targetSeries.getPoint(pointIndex);
            pointClickedViaPath.selected(true);
            map.zoomToFeature(data.id);
        }
    }
    else {
        pointClickedViaPath = targetSeries.getPoint(pointIndex);
        pointClickedViaPath.selected(true);
        map.zoomToFeature(data.id);
    }

}

function addConnectorSeries(connectorData) {
    // add connector series
    removeMapSeries('connector');
    var connectorSeries = map.connector(connectorData);
    connectorSeries.id('connector');
    connectorSeries.tooltip().format("{%from} - {%to}");
    connectorSeries.legendItem().enabled(false);

    connectorSeries.listen("pointClick", function (e) {
        toggleAnimation(true);
    });
}

function removeMapSeries(seriesId) {
    if (map.getSeries(seriesId) != null)
        map.removeSeries(seriesId);
}