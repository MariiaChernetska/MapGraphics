var data = [
["Engine RPM", [28.441486,49.234070,100,
            28.439415,49.234266,150
            , 28.438932, 49.234343, 100,
            28.436808, 49.234434, 80,
            28.435585, 49.234441, 30]
],
["Engine Temperature", [28.441486,49.234070,200,
            28.439415,49.234266,400
            , 28.438932, 49.234343, 150,
            28.436808, 49.234434, 300,
            28.435585, 49.234441, 180]
],
["Speed", [28.441486,49.234070,100,
            28.439415,49.234266,180
            , 28.438932, 49.234343, 120,
            28.436808, 49.234434, 180,
            28.435585, 49.234441, 80]
],
["Trottle", [28.441486,49.234070,90,
            28.439415,49.234266,50
            , 28.438932, 49.234343, 100,
            28.436808, 49.234434, 80,
            28.435585, 49.234441, 70]
]]
function ShowObj(name, coords){
    this._name = name;
    this._coords = coords;
    this._isCreated = false;
}
//first longtutide, second latitude
function GraphBuilder(data, viewer){
    var showObjects = [];
    var sourceName = '';
    var coords = [];

    var colors = [Cesium.Color.CADETBLUE, Cesium.Color.BLUEVIOLET, Cesium.Color.DARKGREEN, Cesium.Color.DARKSALMON]
    var color = "";
    var show = true;
    var top = 0;
    var scene = viewer.scene;
    var handler; 
    coordPicker();
    getCoordsFromArray(data);
 
    
    
    function getCoordsFromArray(data){
       for (var x = 0; x < data.length; x++) {
        var series = data[x];
        var showObj = new ShowObj(series[0], series[1])
        showObjects.push(showObj);
       /* 
        coords = series[1];
        sourceName = series[0];
        color = colors[x];
       
        createGraph(x);
        */
        createButton(x, showObj._name);
       
    } 
       createGraph(0)
}
    function createGraph(x)
    {
        
        var dest = showObjects[x];
        if(!dest._isCreated){
            for(var i = 1; i<viewer.entities.values.length; i++){
                 var entity = viewer.entities.values[i];
                entity.show = false;
            }
            viewer.entities.add({
            name : dest._name,
            wall : {
                positions : Cesium.Cartesian3.fromDegreesArrayHeights(dest._coords),
                material : new Cesium.ColorMaterialProperty(colors[x]),
                outline : true,
                outlineColor : Cesium.Color.BLACK,
                show: true
            }
        });
            dest._isCreated = true;
        }
        else{
            for(var i = 1; i<viewer.entities.values.length; i++){
                 var entity = viewer.entities.values[i]
                if(i===x) {entity.show = true; continue;}
               
                var val = !entity.show;
                entity.show = val;
            }
             
        }
}
function coordPicker(){
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
     handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
     handler.setInputAction(function(movement) {
        var foundPosition = false;
        var scene = viewer.scene;
        var modelEntity = null;
        if (scene.mode !== Cesium.SceneMode.MORPHING) {
            var pickedObject = scene.pick(movement.endPosition);
            if(Cesium.defined(pickedObject)){
                var buf = viewer.entities.values;
                buf.forEach(function(element) {
                    if(pickedObject.id === element){
                        modelEntity = element;
                    }
                }, this);
            }
            if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
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
   }
 function toggleEntity(e){
        var switcher = e.target;
        
        createGraph(switcher.id);
        /*
        var entity = viewer.entities.values[switcher.id]
        var val = !entity.show;
        entity.show = val;
        */
    }
function createButton(index, text){
        var but = document.createElement("button");
        but.className = "switcher";
        but.innerText = text; 
        but.id = index;
        but.style.top = top+"px";
        top += 50;
        but.addEventListener("click", toggleEntity);
        var body = document.getElementsByTagName("body")
        body[0].appendChild(but)
}



}

var viewer = new Cesium.Viewer('cesiumContainer');

var builder = new GraphBuilder(data, viewer);
viewer.zoomTo(viewer.entities);

