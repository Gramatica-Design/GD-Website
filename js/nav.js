//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

const navButton = document.querySelector('.nav_button');
const navMenu = document.querySelector('.nav_menu');

// Schliessen bei Klick ausserhalb — Zustand via is-open Klasse (gesetzt durch Webflow Interaction)
document.addEventListener('click', (e) => {
  if (!navMenu?.classList.contains('is-open')) return;
  if (navMenu?.contains(e.target) || navButton?.contains(e.target)) return;
  navButton?.click();
});

//#endregion
