const layer  = [
   

 new ol.layer.Tile({
     name:'Area_name',
     source: new ol.source.TileWMS({
         url: 'http://localhost:8080/geoserver/cite/wms',
         params: { 'LAYERS': 'cite:Kabul_Area_name ', 'TILED': true },
         serverType: 'geoserver',
     }),
 }),

 new ol.layer.Tile({
     name:'Hospital',
     source: new ol.source.TileWMS({
         url: 'http://localhost:8080/geoserver/cite/wms',
         params: { 'LAYERS': 'cite:Hospital ', 'TILED': true },
         serverType: 'geoserver',
     }),
 }),
   new ol.layer.Tile({
   name:'22_Distrect',
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/cite/wms',
        params: { 'LAYERS': 'cite:Kabul_22District', 'TILED': true },
        serverType: 'geoserver',
    }),
}),
];

// add Tile WMS Layers another way
layer.forEach(
function(layer){
map.addLayer(layer);
}
);

// //add Layer Switcher
 const layerSwitcherIcon = document.getElementsByClassName('layer-switcher__icon')[0];
 const layerSwitcherContent = document.getElementsByClassName('layer-switcher__content')[0];
 let layerSwitcherIsOpen = false;
 layerSwitcherIcon.onclick = function(){
     if(layerSwitcherIsOpen){
         layerSwitcherContent.style.display= 'none';
         layerSwitcherContent.innerHTML = '';
     }else{
         layerSwitcherContent.style.display= 'block';
        layerSwitcherIcon.onclick = function(){
    if(layerSwitcherIsOpen){
        layerSwitcherContent.style.display= 'none';
        layerSwitcherContent.innerHTML = '';
    }else{
        layerSwitcherContent.style.display= 'block';
        layer.forEach(function(lyr){
            const lyrName = lyr.get('name').trim(); // فاصله اضافی حذف شود
            const input = document.createElement("input");
            input.setAttribute('type', 'checkbox');
            input.setAttribute('id', lyrName);
            input.checked = lyr.getVisible();
            input.onchange = function(e){
                // نام لایه را با trim مقایسه کنید
                const layerObj = map.getLayers().getArray().find(l=>l.get('name') && l.get('name').trim()===lyrName);
                if(layerObj) layerObj.setVisible(e.target.checked);
            }
            const label = document.createElement("label");
            label.setAttribute('for', lyrName);
            label.innerText = lyrName;
            const br = document.createElement("br");
            layerSwitcherContent.appendChild(input);
            layerSwitcherContent.appendChild(label);
            layerSwitcherContent.appendChild(br);
        });
    }
    layerSwitcherIsOpen = !layerSwitcherIsOpen;
}


// // //add vector layer
// // const geojsonObject = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[49.8779296875,35.460669951495305],[50.3173828125,34.45221847282654],[51.240234375,34.161818161230386],[52.03125,34.813803317113155],[51.4599609375,35.460669951495305],[50.6689453125,35.67514743608467],[49.8779296875,35.460669951495305]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[52.20703125,34.415973384481866],[49.9658203125,33.211116472416855],[51.0205078125,32.21280106801518],[52.91015625,31.840232667909365],[52.8662109375,30.90222470517144],[54.31640625,31.015278981711266],[54.931640625,32.731840896865684],[55.810546875,33.7243396617476],[55.283203125,34.488447837809304],[52.20703125,34.415973384481866]]]}},{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[55.37109374999999,37.579412513438385],[52.8662109375,35.496456056584165],[57.0849609375,35.567980458012094],[58.62304687499999,38.34165619279595],[56.3818359375,38.30718056188316],[55.37109374999999,37.579412513438385]]]}}]}
// // const vectorSourcePoly = new ol.source.Vector({
// //     features:new ol.format.GeoJSON().readFeatures(geojsonObject,{dataProjection:'EPSG:4326',featureProjection:'EPSG:3857'})
// // });

// // const stylePoly = new ol.style.Style({
// //     stroke: new ol.style.Stroke({
// //         color: 'blue',
// //         width: 2,
// //     }),
// //     fill: new ol.style.Fill({
// //         color: 'rgba(0, 0, 255, 0.1)',
// //     })
// // });

// // const vectorLayer = new ol.layer.Vector({
// //     style:stylePoly,
// //     source:vectorSourcePoly
// // });

// // map.addLayer(vectorLayer);




// add Drawing interaction
// toggle drawing handler
const drawToggler = document.querySelector(".drawing-control__icon--toggler");
const drawButtons = document.querySelectorAll(".drawing-control__icon:not(.drawing-control__icon--toggler)");

let drawIsOpen = false;
drawToggler.onclick = toggleDraw;

function toggleDraw(){
    drawToggler.style.backgroundColor = drawIsOpen?'#2e6be6':'rgba(0,60,136,.8)';
    drawButtons.forEach(function(btn){
        btn.style.display = drawIsOpen?'none':'block';
    });
    drawIsOpen = !drawIsOpen;
}




// draw buttons handler
drawButtons.forEach(function(btn){
    btn.onclick = function(){
        let type = btn.classList[1].split('--')[1];
        switch(type){
            case 'point':
                type = 'Point';
            break;
            case 'line':
                type = 'LineString';
            break;
            case 'polygon':
                type = 'Polygon';
            break;
        }
        drawHandler(type)
    }
});


// add source for drawing
var drawSource = new ol.source.Vector();
var drawLayer = new ol.layer.Vector({
    source: drawSource
});
map.addLayer(drawLayer);


// draw function
function drawHandler(type){
    map.getInteractions().forEach(function(interaction){
        if (interaction instanceof ol.interaction.Draw) {
          map.removeInteraction(interaction);
        }
    });

    if(type==='clear'){
        drawSource.clear();
    }else if(type==='finish'){
        toggleDraw();
        //save on the server;
    }else{
        const drawInteraction = new ol.interaction.Draw({
            type:type,
            source:drawSource,
        });
        map.addInteraction(drawInteraction);
    }
}





// add identify for wms layers
// add wms layers to select element
const selectIdentifyContainer = document.querySelector('.identify__select');
const selectIdentfyElement = document.createElement('select');
layer.forEach(function(lyr){
    const layerName = lyr.get('name');
    const opt = document.createElement('option');
    opt.innerText = layerName;
    selectIdentfyElement.appendChild(opt);
});

selectIdentifyContainer.appendChild(selectIdentfyElement);

// toggle identify
const identifyToggler = document.querySelector('.identify__icon');
const identifyContent = document.querySelector('.identify__content');
let identifyIsActive = false;
identifyToggler.onclick = toggleIndentify;

function toggleIndentify(){
    identifyIsActive?map.un('click',identify):map.on('click',identify);
    identifyToggler.style.backgroundColor = identifyIsActive?'#2e6be6':'rgba(0,60,136,.8)';
    identifyContent.style.display = identifyIsActive?'none':'block';
    identifyIsActive = !identifyIsActive;
}


function identify(evt) {
    const viewResolution = map.getView().getResolution();
    const lyrName = document.querySelector('.identify__select>select').value;
    const layer = map.getLayers().getArray().find(l => l.get('name') === lyrName);
    const coordinate = ol.proj.transform(evt.coordinate, 'EPSG:4326', 'EPSG:32642');
    
    // بررسی اینکه لایه و URL به درستی وجود دارند
    if (!layer) {
        console.error('Layer not found');
        return;
    }

    const originalUrl = layer.getSource().getFeatureInfoUrl(
        coordinate, // استفاده از مختصات تبدیل‌شده
        viewResolution,
        'EPSG:32642', // سیستم مختصات لایه‌ها
        { 'INFO_FORMAT': 'text/html' }
    );

    // اگر URL به درستی ساخته نشده باشد
    if (!originalUrl) {
        console.error('FeatureInfo URL could not be created');
        return;
    }

    // استخراج پارامترها از URL اصلی
    const urlObj = new URL(originalUrl);
    const searchParams = urlObj.searchParams;
    
    // ساخت URL جدید با استفاده از پروکسی Django
    const proxyUrl = `/geoserver_proxy/?${searchParams.toString()}`;

    // انجام درخواست Fetch از طریق پروکسی
    fetch(proxyUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then((html) => {
            document.querySelector('.identify__result').innerHTML = html;
        })
        .catch((error) => {
            console.error('Fetch error:', error);
        });
}




// measurment 

const measureToggler = document.querySelector(".measurement-control__icon--toggler");
const measureButtons = document.querySelectorAll(".measurement-control__icon:not(.measurement-control__icon--toggler)");
const measureTooltipElement = document.querySelector('.tooltip-bottom');
let measureIsOpen = false;
measureToggler.onclick = toggleMeasure;


var measureSource = new ol.source.Vector();
var measureLayer = new ol.layer.Vector({
    source: measureSource
});
map.addLayer(measureLayer);




function toggleMeasure(){
    measureToggler.style.backgroundColor = measureIsOpen?'#2e6be6':'rgba(0,60,136,.8)';
    measureTooltipElement.style.display = 'none';
    measureButtons.forEach(function(btn){
        btn.style.display = measureIsOpen?'none':'block';
    });
    map.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
          map.removeInteraction(interaction);
        }
    });

    measureSource.clear();

    measureIsOpen = !measureIsOpen;
}



measureButtons.forEach(function(btn){
    btn.onclick = function(){
        let type = btn.classList[1].split('--')[1];
        switch(type){
            case 'distance':
                type = 'LineString';
            break;
            case 'area':
                type = 'Polygon';
            break;
        }
        measureHandler(type)
    }
});



function measureHandler(type){
    map.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
          map.removeInteraction(interaction);
        }
    });
    const drawInteraction = new ol.interaction.Draw({
        type:type,
        source:measureSource,
    });

    drawInteraction.on('drawstart', function (evt) {
        let sketch = evt.feature;
        sketch.getGeometry().on('change', function (evt) {
          const geom = evt.target;
          let output;
          if (geom instanceof ol.geom.Polygon) {
            output = formatArea(geom);
          } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(geom);
          }
          measureTooltipElement.innerHTML = output;
          measureTooltipElement.style.display = 'block';
        });
      });
    
    map.addInteraction(drawInteraction);
}



const formatLength = function (line) {
    const length = ol.sphere.getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
      output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};
  
const formatArea = function (polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
      output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};





//add search box

const searchResultSource = new ol.source.Vector();

const styleSearchResult = new ol.style.Style({  
    image: new ol.style.Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: './kabul/imgs/location.png'
    })
});

const searchResultLayer = new ol.layer.Vector({
    style:styleSearchResult,
    source:searchResultSource
});

map.addLayer(searchResultLayer);


const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-button")
searchBtn.onclick = search;


function search(){
    const text = searchInput.value;
    fetch(`https://nominatim.openstreetmap.org/search?q=${text}&format=geojson&limit=1`)
    .then(
        function(resp){
            return resp.json()
        }
    ).then(function(geojson){
        searchResultSource.clear();
        const resultFeatures = new ol.format.GeoJSON().readFeatures(geojson,{dataProjection:'EPSG:4326',featureProjection:'EPSG:3857'});
        const feature = resultFeatures[0];    
        var ext=feature.getGeometry().getExtent();
        var center= ol.extent.getCenter(ext);
        map.setView(
            new ol.View({
                projection: map.getView().getProjection(),
                center: [center[0] , center[1]],
                zoom: 12
            })
        );
        searchResultSource.addFeatures(resultFeatures);
    });
}













































