var data = [
    ["Engine RPM", [28.441486, 49.234070, 100,
        28.439415, 49.234266, 150, 28.438932, 49.234343, 100,
        28.436808, 49.234434, 80,
        28.435585, 49.234441, 30
    ]],
    ["Engine Temperature", [28.441486, 49.234070, 200,
        28.439415, 49.234266, 400, 28.438932, 49.234343, 150,
        28.436808, 49.234434, 300,
        28.435585, 49.234441, 180
    ]],
    ["Speed", [28.441486, 49.234070, 100,
        28.439415, 49.234266, 180, 28.438932, 49.234343, 120,
        28.436808, 49.234434, 180,
        28.435585, 49.234441, 80
    ]],
    ["Trottle", [28.441486, 49.234070, 90,
        28.439415, 49.234266, 50, 28.438932, 49.234343, 100,
        28.436808, 49.234434, 80,
        28.435585, 49.234441, 70
    ]]
]

function Chart(name, coords) {
    this._name = name;
    this._coords = coords;
}
Object.defineProperties(Chart.prototype, {
    name: {
        get: function() { return this._name }
    },
    coords: {
        get: function() { return this._coords }
    }
});

function Value(lat, lon, alt) {
    this._lat = lat;
    this._lon = lon;
    this._alt = alt;
}
Object.defineProperties(ChartBuilder.prototype, {
    lat: {
        get: function() { return this._lat }
    },
    lon: {
        get: function() { return this._lon }
    },
    alt: {
        get: function() { return this._alt }
    }
});

function ChartBuilder(data) {
    this._data = data;
    this._viewer = new Cesium.Viewer('cesiumContainer');;
    this._colors = [Cesium.Color.CADETBLUE, Cesium.Color.BLUEVIOLET, Cesium.Color.DARKGREEN, Cesium.Color.DARKSALMON];
    this._entitties = new Cesium.EntityCollection();

    this.getCoordinates(data);
    this.drawInfoBox();
}
Object.defineProperties(ChartBuilder.prototype, {
    data: {
        get: function() { return this._data }
    },
    viewer: {
        get: function() { return this._viewer }
    },
    colors: {
        get: function() { return this._colors }
    },
    entities: {
        get: function() { return this._entitties }
    },

});
ChartBuilder.prototype.getCoordinates = function() {
    this.data.forEach(function(element, index, array) {

        var chart = new Chart(element[0], element[1]);
        this.entities.add({
            name: chart.name,
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(chart.coords),
                material: new Cesium.ColorMaterialProperty(this.colors[index]),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                show: true
            }
        })
        this.createButton(index, chart.name)

    }, this);
    this.drawChart(0);
    this.coordPicker();
}
Object.prototype.createButton = function(index, text) {
    var but = document.createElement("button");
    but.className = "switcher";
    but.innerText = text;
    but.id = index;

    var top = 0;
    if (index != 0) {
        var buttons = document.getElementsByClassName("switcher");
        top = parseInt(buttons[buttons.length - 1].style.top) + 50;
    }
    but.style.top = top + "px"
    but.addEventListener("click", this.toggleEntity.bind(this));
    var body = document.getElementsByTagName("body");
    body[0].appendChild(but)
}
Object.prototype.toggleEntity = function(index) {
    var self = this;
    self.drawChart(index.target.id);
}
Object.prototype.drawChart = function(index) {
    var self = this;
    if (this.viewer.entities.contains(this.entities.values[index])) {

        this.viewer.entities.values.forEach(function(element, i, arr) {

            self.viewer.entities.values[i].show = false;


        })
        this.viewer.entities.values[index].show = true;
    } else {

        this.viewer.entities.values.forEach(function(element, i, arr) {
            self.viewer.entities.values[i].show = false;
        })
        this.viewer.entities.add(this.entities.values[index]);
    }
    this.coordPicker();
    this.viewer.zoomTo(this.viewer.entities);
}
Object.prototype.drawInfoBox = function() {
    var box = document.createElement("div");
    box.className = "box";
    box.id = "box";
    var body = document.getElementsByTagName("body");
    body[0].appendChild(box)
}
Object.prototype.coordPicker = function() {

    var scene = this.viewer.scene;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var self = this;
    handler.setInputAction(function(movement) {
        var foundPosition = false;

        var modelEntity = null;
        if (scene.mode !== Cesium.SceneMode.MORPHING) {
            var pickedObject = scene.pick(movement.endPosition);
            if (Cesium.defined(pickedObject)) {
                var buf = self.viewer.entities.values;
                buf.forEach(function(element) {
                    if (pickedObject.id === element) {
                        modelEntity = element;
                    }
                });
            }
            if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                var cartesian = self.viewer.scene.pickPosition(movement.endPosition);

                if (Cesium.defined(cartesian)) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    var heightString = cartographic.height.toFixed(0);
                    var box = document.getElementById('box');

                    box.innerText = pickedObject.id.name + '\n' +
                        'Lon: ' + ('   ' + longitudeString) + '\u00B0' +
                        '\nLat: ' + ('   ' + latitudeString) + '\u00B0' +
                        '\nValue: ' + ('   ' + heightString).slice(-7);


                    foundPosition = true;
                }
            }
        }

        if (!foundPosition) {
            // labelEntity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}





var builder = new ChartBuilder(data);