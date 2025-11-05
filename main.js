document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.querySelector(".user-avatar");
  const menu = document.querySelector(".navbar__user-avatar");

  if (avatarBtn && menu) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.add("active");
    });

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
      if (!avatarBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("active");
      }
    });
  }
  document.querySelectorAll(".book-section").forEach((section) => {
    const grid = section.querySelector(".book-grid");
    const prevBtn = section.querySelector(".nav-button--prev");
    const nextBtn = section.querySelector(".nav-button--next");

    if (prevBtn && nextBtn && grid) {
      prevBtn.addEventListener("click", () => {
        grid.scrollBy({ left: -250, behavior: "smooth" });
      });
      nextBtn.addEventListener("click", () => {
        grid.scrollBy({ left: 250, behavior: "smooth" });
      });
    }
  });
});
