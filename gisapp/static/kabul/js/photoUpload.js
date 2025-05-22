// Photo upload modal implementation
// مدیریت مودال آپلود عکس
const photoModal = document.getElementById("photoModal");
const addPhotoBtn = document.getElementById("addPhotoBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const photoUploadForm = document.getElementById("photoUploadForm");
const photoFile = document.getElementById("photoFile");
const photoPreview = document.getElementById("photoPreview");
const photoContainer = document.getElementById("photoContainer");

// نمایش مودال با کلیک روی دکمه افزودن عکس
addPhotoBtn.addEventListener("click", function () {
  photoModal.classList.add("active");
});

// بستن مودال
closeModalBtn.addEventListener("click", function () {
  photoModal.classList.remove("active");
});

// بستن مودال با کلیک بیرون از آن
photoModal.addEventListener("click", function (e) {
  if (e.target === photoModal) {
    photoModal.classList.remove("active");
  }
});

// نمایش پیش‌نمایش عکس انتخاب شده
photoFile.addEventListener("change", function () {
  if (this.files && this.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      photoPreview.src = e.target.result;
      photoPreview.style.display = "block";
    };

    reader.readAsDataURL(this.files[0]);
  }
});

// ارسال فرم آپلود عکس
photoUploadForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // در اینجا می‌توان از AJAX برای ارسال عکس به سرور استفاده کرد
  // اما برای نمونه، ما فقط عکس را در صفحه نمایش می‌دهیم

  if (photoFile.files && photoFile.files[0]) {
    const reader = new FileReader();
    const description = document.getElementById("photoDescription").value;

    reader.onload = function (e) {
      // حذف پیام "هیچ عکسی وجود ندارد" اگر وجود داشته باشد
      const noPhotoMsg = photoContainer.querySelector(".identify__no-photo");
      if (noPhotoMsg) {
        noPhotoMsg.remove();
      }

      // ایجاد عناصر برای نمایش عکس و اطلاعات آن
      const photoWrapper = document.createElement("div");
      photoWrapper.style.marginBottom = "20px";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "identify__photo";

      const info = document.createElement("div");
      info.className = "identify__photo-info";
      info.textContent = description || "بدون توضیحات";

      // افزودن به صفحه
      photoWrapper.appendChild(img);
      photoWrapper.appendChild(info);
      photoContainer.appendChild(photoWrapper);

      // بستن مودال و پاک کردن فرم
      photoModal.classList.remove("active");
      photoUploadForm.reset();
      photoPreview.style.display = "none";
    };

    reader.readAsDataURL(photoFile.files[0]);
  }
});
// ... [rest of the photo upload-related JavaScript code] ...
