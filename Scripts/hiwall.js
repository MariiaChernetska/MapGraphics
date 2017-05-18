var viewer = new Cesium.Viewer('cesiumContainer', {
    selectionIndicator : false,
    infoBox : false
});

var scene = viewer.scene;
var handler; 
    var coords = [28.441486,49.234070,100,
            28.439415,49.234266,180, 28.438932, 49.234343, 120,
            28.436808, 49.234434, 180,
            28.435585, 49.234441, 80];
    var modelEntity = viewer.entities.add({
        name : "test wall",
        wall : {
            positions : Cesium.Cartesian3.fromDegreesArrayHeights(coords),
            material : Cesium.Color.BLUEVIOLET,
            outline : true,
            outlineColor : Cesium.Color.BLACK,
            show: true
        }
});

    viewer.zoomTo(modelEntity);

    var labelEntity = viewer.entities.add({
        label : {
            show : false,
            showBackground : true,
            font : '14px monospace',
            horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(15, 0)
        }
    }); 

    // Mouse over the globe to see the cartographic position
    handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(movement) {

        var foundPosition = false;

        var scene = viewer.scene;
      
        if (scene.mode !== Cesium.SceneMode.MORPHING) {
            var pickedObject = scene.pick(movement.endPosition);
            if (scene.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.id === modelEntity) {
                var cartesian = viewer.scene.pickPosition(movement.endPosition);

                if (Cesium.defined(cartesian)) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                    var heightString = cartographic.height.toFixed(0);

                    labelEntity.position = cartesian;
                    labelEntity.label.show = true;
                    labelEntity.label.text = pickedObject.id.name+'\n'+
                        'Lon: ' + ('   ' + longitudeString) + '\u00B0' +
                        '\nLat: ' + ('   ' + latitudeString) + '\u00B0' +
                        '\nValue: ' + ('   ' + heightString).slice(-7);

                    labelEntity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, -cartographic.height * (scene.mode === Cesium.SceneMode.SCENE2D ? 1.5 : 1.0));

                    foundPosition = true;
                }
            }
        }

        if (!foundPosition) {
            labelEntity.label.show = false;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

         
    
