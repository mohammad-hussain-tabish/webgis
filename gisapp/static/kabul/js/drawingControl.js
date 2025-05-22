// Drawing control implementation
const drawSource = new ol.source.Vector();
const drawLayer = new ol.layer.Vector({
    source: drawSource
});
map.addLayer(drawLayer);

// Toggle drawing handler
const drawToggler = document.querySelector(".drawing-control__icon--toggler");
const drawButtons = document.querySelectorAll(".drawing-control__icon:not(.drawing-control__icon--toggler)");

let drawIsOpen = false;
drawToggler.onclick = toggleDraw;

function toggleDraw() {
    drawToggler.style.backgroundColor = drawIsOpen ? '#2e6be6' : 'rgba(0,60,136,.8)';
    drawButtons.forEach(function(btn) {
        btn.style.display = drawIsOpen ? 'none' : 'block';
    });
    drawIsOpen = !drawIsOpen;
}

// Draw buttons handler
drawButtons.forEach(function(btn) {
    btn.onclick = function() {
        let type = btn.classList[1].split('--')[1];
        switch(type) {
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
        drawHandler(type);
    }
});

// Draw function
function drawHandler(type) {
    map.getInteractions().forEach(function(interaction) {
        if (interaction instanceof ol.interaction.Draw) {
            map.removeInteraction(interaction);
        }
    });

    if(type === 'clear') {
        drawSource.clear();
    } else if(type === 'finish') {
        toggleDraw();
    } else {
        const drawInteraction = new ol.interaction.Draw({
            type: type,
            source: drawSource,
        });
        map.addInteraction(drawInteraction);
    }
}