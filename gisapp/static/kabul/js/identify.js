// Identify functionality implementation
const identifyElement = document.querySelector(".identify");
const identifyIcon = document.querySelector(".identify__icon");
const mapElement = document.getElementById("map");
const toolsElement = document.querySelector(".tools");
// const layerSwitcherElement = document.querySelector(".layer-switcher");
const bodyElement = document.body;
const headerElement = document.querySelector(".header");

// متغیر برای فعال/غیرفعال‌سازی حالت شناسایی
let identifyActive = false;

// تابع برای باز کردن پنل
function openIdentifyPanel() {
  identifyElement.classList.add("active");
  bodyElement.classList.add("body-shifted");
  identifyActive = true;
}

// تابع برای بستن پنل
function closeIdentifyPanel() {
  identifyElement.classList.remove("active");
  bodyElement.classList.remove("body-shifted");
  identifyActive = false;
}

// باز و بسته کردن پنل با کلیک روی آیکون
identifyIcon.addEventListener("click", function () {
  if (identifyElement.classList.contains("active")) {
    closeIdentifyPanel();
  } else {
    openIdentifyPanel();
  }
});

// رویداد کلیک روی نقشه برای شناسایی عوارض
map.on("singleclick", function (evt) {
  if (!identifyActive) return;

  // پاکسازی نتایج قبلی
  const resultElement = document.querySelector(".identify__result");
  if (resultElement) {
    resultElement.innerHTML =
      '<div class="loading">در حال دریافت اطلاعات...</div>';
  }

  // پیدا کردن تمام لایه‌های WMS فعال در نقشه
  const wmsLayers = [];
  map.getLayers().forEach(function (layer) {
    if (layer.getVisible() && layer.get("type") === "wms") {
      wmsLayers.push(layer);
    }
  });

  // اگر لایه WMS وجود ندارد
  if (wmsLayers.length === 0) {
    if (resultElement) {
      resultElement.innerHTML =
        '<div class="no-results">هیچ لایه WMS فعالی وجود ندارد</div>';
    }
    return;
  }

  const viewResolution = map.getView().getResolution();
  const projection = map.getView().getProjection();

  // انجام درخواست GetFeatureInfo برای هر لایه WMS
  let pendingRequests = wmsLayers.length;
  let hasResults = false;

  wmsLayers.forEach(function (wmsLayer) {
    const source = wmsLayer.getSource();
    // اطمینان از استفاده از پارامترهای صحیح برای درخواست GetFeatureInfo
    const url = source.getFeatureInfoUrl(
      evt.coordinate,
      viewResolution,
      projection,
      {
        INFO_FORMAT: "application/json",
        FEATURE_COUNT: 10,
        QUERY_LAYERS: wmsLayer.get("name"),
        STYLES: "",
        WIDTH: map.getSize()[0],
        HEIGHT: map.getSize()[1],
        X: Math.round(evt.pixel[0]),
        Y: Math.round(evt.pixel[1]),
      }
    );

    console.log("WMS GetFeatureInfo URL:", url); // برای دیباگ

    if (url) {
      fetch(url)
        .then(function (response) {
          console.log("GetFeatureInfo response status:", response.status);
          return response.json().catch(function (error) {
            console.error("Error parsing JSON:", error);
            return { features: [] };
          });
        })
        .then(function (data) {
          console.log("GetFeatureInfo data:", data); // برای دیباگ
          pendingRequests--;

          if (data.features && data.features.length > 0) {
            hasResults = true;

            // نمایش ویژگی‌های عارضه در پنل شناسایی
            const layerName = wmsLayer.get("title") || "لایه بدون نام";
            let featuresHtml = `<div class="identify__layer-title">${layerName}</div>`;

            data.features.forEach(function (feature) {
              featuresHtml += '<div class="identify__feature">';

              if (feature.properties) {
                featuresHtml += '<table class="identify__attributes">';
                featuresHtml +=
                  "<thead><tr><th>ویژگی</th><th>مقدار</th></tr></thead>";
                featuresHtml += "<tbody>";

                for (const prop in feature.properties) {
                  if (
                    Object.prototype.hasOwnProperty.call(
                      feature.properties,
                      prop
                    )
                  ) {
                    featuresHtml += `<tr><td>${prop}</td><td>${
                      feature.properties[prop] || "-"
                    }</td></tr>`;
                  }
                }

                featuresHtml += "</tbody></table>";
              } else {
                featuresHtml += '<div class="no-attributes">بدون ویژگی</div>';
              }

              featuresHtml += "</div>";
            });

            if (resultElement) {
              resultElement.innerHTML = featuresHtml;
            }
          }

          // اگر همه درخواست‌ها تمام شده و نتیجه‌ای نداشته
          if (pendingRequests === 0 && !hasResults) {
            if (resultElement) {
              resultElement.innerHTML =
                '<div class="no-results">هیچ عارضه‌ای پیدا نشد</div>';
            }
          }
        })
        .catch(function (error) {
          console.error("خطا در دریافت اطلاعات:", error);
          pendingRequests--;

          if (pendingRequests === 0 && !hasResults) {
            if (resultElement) {
              resultElement.innerHTML =
                '<div class="error">خطا در دریافت اطلاعات</div>';
            }
          }
        });
    } else {
      console.error("نمی‌توان URL درخواست GetFeatureInfo را ایجاد کرد");
      pendingRequests--;
    }
  });
});
// ... [rest of the identify-related JavaScript code] ...
