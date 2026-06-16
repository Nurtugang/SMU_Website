function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const iconMenu = document.getElementById("iconMenu");
  const iconClose = document.getElementById("iconClose");
  const isHidden = menu.classList.toggle("hidden");
  iconMenu.classList.toggle("hidden", !isHidden);
  iconClose.classList.toggle("hidden", isHidden);
}
