// Layer switcher implementation
const layerSwitcherIcon = document.querySelector(".layer-switcher__icon");
const layerSwitcherContent = document.querySelector(".layer-switcher__content");
const layerSwitcher = document.querySelector(".layer-switcher");

// باز و بسته کردن لایه سوییچر با کلیک روی آیکون
layerSwitcherIcon.addEventListener("click", function () {
  layerSwitcher.classList.toggle("active");
});

// بستن لایه سوییچر با کلیک در خارج از آن
document.addEventListener("click", function (event) {
  if (
    !layerSwitcher.contains(event.target) &&
    layerSwitcher.classList.contains("active")
  ) {
    layerSwitcher.classList.remove("active");
  }
});

// بروزرسانی لیست لایه‌ها
function updateLayerList() {
  // پاکسازی محتوای فعلی
  layerSwitcherContent.innerHTML =
    '<div class="layer-title">لایه‌های نقشه</div>';

  // اضافه کردن لایه‌های موجود به لیست
  const layers = map.getLayers().getArray();

  // لایه پایه (OSM)
  const baseLayer = layers.find(
    (layer) =>
      layer.get("title") === "OpenStreetMap" ||
      layer.getSource() instanceof ol.source.OSM
  );
  if (baseLayer) {
    const baseItem = document.createElement("div");
    baseItem.className = "layer-item";

    const baseCheckbox = document.createElement("input");
    baseCheckbox.type = "checkbox";
    baseCheckbox.id = "base-layer-checkbox";
    baseCheckbox.checked = baseLayer.getVisible();

    baseCheckbox.addEventListener("change", function () {
      baseLayer.setVisible(this.checked);
    });

    const baseLabel = document.createElement("label");
    baseLabel.htmlFor = "base-layer-checkbox";
    baseLabel.textContent = "OpenStreetMap";

    baseItem.appendChild(baseCheckbox);
    baseItem.appendChild(baseLabel);
    layerSwitcherContent.appendChild(baseItem);
  }

  // لایه‌های WMS
  const wmsLayers = layers.filter((layer) => layer.get("type") === "wms");

  if (wmsLayers.length > 0) {
    const wmsTitle = document.createElement("div");
    wmsTitle.className = "layer-title";
    layerSwitcherContent.appendChild(wmsTitle);

    wmsLayers.forEach(function (layer, index) {
      const layerItem = document.createElement("div");
      layerItem.className = "layer-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "wms-layer-" + index;
      checkbox.checked = layer.getVisible();

      checkbox.addEventListener("change", function () {
        layer.setVisible(this.checked);
      });

      const label = document.createElement("label");
      label.htmlFor = "wms-layer-" + index;
      label.textContent = layer.get("title") || "لایه WMS " + (index + 1);

      layerItem.appendChild(checkbox);
      layerItem.appendChild(label);
      layerSwitcherContent.appendChild(layerItem);
    });
  } else {
    const noWmsLayers = document.createElement("div");
    noWmsLayers.textContent = "هیچ لایه WMS فعالی وجود ندارد";
    layerSwitcherContent.appendChild(noWmsLayers);
  }
}

// بروزرسانی اولیه لیست لایه‌ها
updateLayerList();

// بروزرسانی لیست لایه‌ها هنگام اضافه یا حذف لایه
map.getLayers().on("add", updateLayerList);
map.getLayers().on("remove", updateLayerList);
// ... [rest of the layer switcher-related JavaScript code] ...
