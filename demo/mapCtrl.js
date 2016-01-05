var mapCtrl = {};
mapCtrl.mode = "3D";

mapCtrl.availableLocations = {
    "Littleton": [39.61, -105.02],
    "Denver": [39.74, -104.99],
    "Aurora": [39.73, -104.8],
    "Golden": [39.77, -105.23]
}
mapCtrl.initMap = function() {
    var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ';

    var grayscale = L.tileLayer(mbUrl, {
            id: 'mapbox.light',
            attribution: mbAttr
        }),
        streets = L.tileLayer(mbUrl, {
            id: 'mapbox.streets',
            attribution: mbAttr
        }),
        satellite = L.tileLayer(mbUrl, {
            id: 'mapbox.streets-satellite',
            attribution: mbAttr
        }),
        Google = L.tileLayer('https://mts{s}.google.com/vt/lyrs=s@186112443&hl=x-local&src=app&x={x}&y={y}&z={z}&s=Galile', {
            subdomains: '0123',
            attribution: '&copy; Google Maps'
        }),
        temperature = L.tileLayer.wms('http://gis.srh.noaa.gov/arcgis/services/NDFDTemps/MapServer/WMSServer', {
            format: 'img/png',
            transparent: true,
            layers: 16
        }),
        precipitation = L.tileLayer.wms('http://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/WmsServer', {
            format: 'image/png',
            transparent: true,
            layers: '5'
        })

    mapCtrl.map2D = L.map('map', {
        center: [39.73, -104.99],
        zoom: 10,
        layers: [grayscale]
    });

    var marker = L.marker([0, 0])
    marker.addTo(mapCtrl.map2D);
    mapCtrl.marker = marker;

    var basemaps = {
        "Grayscale": grayscale,
        "Google": Google
    };

    var others = {
        "streets": L.layerGroup([streets]),
        "satellite": L.layerGroup([satellite]),
        "temperature": L.layerGroup([temperature]),
        "precipitation": L.layerGroup([precipitation])
    };

    mapCtrl.availableLayers = others;

    L.control.layers(basemaps, others).addTo(mapCtrl.map2D);


    // Init cesium
    var viewer = new Cesium.Viewer('cesiumContainer', {
        timeline: false,
        navigationHelpButton: false,
        selectionIndicator: false,
        sceneModePicker: false,
        infoBox: false,
        homeButton: false
    });
    var layers = viewer.scene.imageryLayers;
    var streets3D = layers.addImageryProvider(new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ'
    }));
    var satellite3D = layers.addImageryProvider(new Cesium.MapboxImageryProvider({
        mapId: 'mapbox.streets-satellite',
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ'
    }));
    var temperature3D = layers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
        url: "http://gis.srh.noaa.gov/arcgis/services/NDFDTemps/MapServer/WMSServer",
        parameters: {
            SRS: "EPSG=A3857"
        }
    }));

    streets3D.alpha = 0.5;
    satellite3D.alpha = 0.5;
    temperature3D.alpha = 0.5;

    mapCtrl.map3D = viewer;

    this.switchMode(mapCtrl.mode)
}

mapCtrl.switchMode = function(mode) {
    if (mode === "3D") {
        document.getElementById("map").style.display = "none";
        document.getElementById("cesiumContainer").style.display = "block";
    } else {
        document.getElementById("map").style.display = "block";
        document.getElementById("cesiumContainer").style.display = "none";

    }
}

mapCtrl.showLayer = function(layerName) {
    var layer = mapCtrl.availableLayers[layerName];
    if (!layer) {
        console.log("Unable to find layer:", layerName);
        return;
    }
    mapCtrl.map2D.addLayer(layer);
}

mapCtrl.hideLayer = function(layerName) {
    var layer = mapCtrl.availableLayers[layerName];
    if (!layer) {
        console.log("Unable to find layer:", layerName);
        return;
    }
    mapCtrl.map2D.removeLayer(layer);
}

mapCtrl.hideAllLayers = function() {
    var keys = Object.keys(mapCtrl.availableLayers);
    for (var i = 0; i < keys.length; i++) {
        mapCtrl.map2D.removeLayer(mapCtrl.availableLayers[keys[i]]);
    }
}
mapCtrl.balanceLayerOpacities = function() {
    // Balance all active layer opacities
    var keys = Object.keys(mapCtrl.availableLayers);
    var targetOpacity = (1 / keys.length) !== Infinity ? 1 / keys.length : 1;
    for (var i = 0; i < keys.length; i++) {
        mapCtrl.availableLayers[keys[i]].getLayers()[0].setOpacity(targetOpacity);
    }
}
mapCtrl.zoomIn = function() {
    mapCtrl.map2D.zoomIn();
    mapCtrl.map3D.camera.zoomIn();
}
mapCtrl.zoomOut = function() {
    mapCtrl.map2D.zoomOut();
    mapCtrl.map3D.camera.zoomOut();

}
mapCtrl.flyTo = function(location) {
    var coords = mapCtrl.availableLocations[location];
    if (!coords) {
        console.log("Unable to find location: ", location);
        return;
    }
    mapCtrl.marker.setLatLng(coords);
    mapCtrl.map2D.panTo(new L.LatLng(coords[0], coords[1]));

    mapCtrl.map3D.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            coords[1],
            coords[0],
            Cesium.Ellipsoid.WGS84.cartesianToCartographic(mapCtrl.map3D.camera.position).height
        )
    });
}
