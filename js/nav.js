//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

const navButton = document.querySelector('.nav_button');
const navMenu = document.querySelector('.nav_menu');
const navWrapper = document.querySelector('.nav_menu-mobile-wrapper');

let isOpen = false;

const closeMenu = () => {
  if (!isOpen) return;
  isOpen = false;
  navMenu?.classList.remove('is-open');
  setTimeout(() => {
    if (navWrapper) navWrapper.style.height = '0rem';
  }, 700);
};

navButton?.addEventListener('click', () => {
  if (!isOpen) {
    // Öffnen
    isOpen = true;
    if (navWrapper) navWrapper.style.height = "26rem";
    navMenu?.classList.add('is-open');
  } else {
    closeMenu();
  }
});

// Schliessen bei Klick auf einen Navigationslink
document.querySelectorAll('.nav_link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Schliessen bei Klick ausserhalb des Menüs
document.addEventListener('click', (e) => {
  if (isOpen && !navMenu?.contains(e.target) && !navButton?.contains(e.target)) {
    closeMenu();
  }
});

//#endregion
