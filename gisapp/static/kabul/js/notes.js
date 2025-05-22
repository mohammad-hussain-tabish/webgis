document.addEventListener("DOMContentLoaded", function () {
  const stickyNote = document.getElementById("stickyNote");
  const stickyNoteHeader = document.getElementById("stickyNoteHeader");
  const noteContent = document.getElementById("noteContent");
  const saveNoteBtn = document.getElementById("saveNote");
  const cancelEditBtn = document.getElementById("cancelEdit");
  const deleteNoteBtn = document.getElementById("deleteNote");
  const minimizeNoteBtn = document.getElementById("minimizeNote");
  const noteToggleButton = document.getElementById("noteToggleButton");

  // بارگذاری یادداشت ذخیره شده
  if (localStorage.getItem("stickyNoteContent")) {
    noteContent.value = localStorage.getItem("stickyNoteContent");
  }

  // باز/بسته کردن پنل یادداشت با دکمه شناور
  noteToggleButton.addEventListener("click", function () {
    if (
      stickyNote.style.display === "none" ||
      stickyNote.style.display === ""
    ) {
      stickyNote.style.display = "block";
    } else {
      stickyNote.style.display = "none";
    }
  });

  // ذخیره یادداشت
  saveNoteBtn.addEventListener("click", function () {
    localStorage.setItem("stickyNoteContent", noteContent.value);
    alert("یادداشت با موفقیت ذخیره شد!");
  });

  // لغو تغییرات
  cancelEditBtn.addEventListener("click", function () {
    if (localStorage.getItem("stickyNoteContent")) {
      noteContent.value = localStorage.getItem("stickyNoteContent");
    } else {
      noteContent.value = "";
    }
  });

  // حذف یادداشت
  deleteNoteBtn.addEventListener("click", function () {
    if (confirm("آیا مطمئن هستید که می‌خواهید یادداشت را حذف کنید؟")) {
      localStorage.removeItem("stickyNoteContent");
      noteContent.value = "";
    }
  });

  // کوچک کردن/بزرگ کردن پنل یادداشت
  minimizeNoteBtn.addEventListener("click", function () {
    stickyNote.classList.toggle("minimized");
    if (stickyNote.classList.contains("minimized")) {
      minimizeNoteBtn.textContent = "□";
      minimizeNoteBtn.title = "بزرگ کردن";
    } else {
      minimizeNoteBtn.textContent = "_";
      minimizeNoteBtn.title = "کوچک کردن";
    }
  });

  // امکان جابجایی پنل یادداشت
  let isDragging = false;
  let offsetX, offsetY;

  stickyNoteHeader.addEventListener("mousedown", function (e) {
    isDragging = true;
    offsetX = e.clientX - stickyNote.getBoundingClientRect().left;
    offsetY = e.clientY - stickyNote.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      stickyNote.style.left = e.clientX - offsetX + "px";
      stickyNote.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
});
