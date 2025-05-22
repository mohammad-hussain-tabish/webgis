// Measurement control implementation
const measureSource = new ol.source.Vector();
const measureLayer = new ol.layer.Vector({
    source: measureSource
});
map.addLayer(measureLayer);

const measureToggler = document.querySelector(".measurement-control__icon--toggler");
const measureButtons = document.querySelectorAll(".measurement-control__icon:not(.measurement-control__icon--toggler)");
const measureTooltipElement = document.querySelector('.tooltip-bottom');
let measureIsOpen = false;

measureToggler.onclick = toggleMeasure;

function toggleMeasure() {
    measureToggler.style.backgroundColor = measureIsOpen ? '#2e6be6' : 'rgba(0,60,136,.8)';
    measureTooltipElement.style.display = 'none';
    measureButtons.forEach(function(btn) {
        btn.style.display = measureIsOpen ? 'none' : 'block';
    });
    map.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
            map.removeInteraction(interaction);
        }
    });
    measureSource.clear();
    measureIsOpen = !measureIsOpen;
}

measureButtons.forEach(function(btn) {
    btn.onclick = function() {
        let type = btn.classList[1].split('--')[1];
        switch(type) {
            case 'distance':
                type = 'LineString';
                break;
            case 'area':
                type = 'Polygon';
                break;
        }
        measureHandler(type);
    }
});

function measureHandler(type) {
    map.getInteractions().forEach((interaction) => {
        if (interaction instanceof ol.interaction.Draw) {
            map.removeInteraction(interaction);
        }
    });
    
    const drawInteraction = new ol.interaction.Draw({
        type: type,
        source: measureSource,
    });

    drawInteraction.on('drawstart', function(evt) {
        let sketch = evt.feature;
        sketch.getGeometry().on('change', function(evt) {
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

const formatLength = function(line) {
    const length = ol.sphere.getLength(line);
    let output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
        output = Math.round(length * 100) / 100 + ' m';
    }
    return output;
};

const formatArea = function(polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' m<sup>2</sup>';
    }
    return output;
};