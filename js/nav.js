//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

const navButton = document.querySelector('.nav_button');
const navMenu = document.querySelector('.nav_menu');
const navWrapper = document.querySelector('.nav_menu-mobile-wrapper');
const navLinks = document.querySelectorAll('.nav_menu_link');

let isOpen = false;
let lottieAnim = null;

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
  const navLottieEl = document.querySelector('.nav_lottie');
  const all = Webflow.require('lottie').lottie.getRegisteredAnimations();
  lottieAnim = all.find(a => navLottieEl.contains(a.wrapper));
});

const playLottie = (reverse) => {
  if (!lottieAnim) return;
  const half = lottieAnim.totalFrames * 0.5;
  lottieAnim.setSpeed(half / lottieAnim.frameRate);
  lottieAnim.playSegments(reverse ? [half, 0] : [0, half], true);
};

const openMenu = () => {
  isOpen = true;
  navMenu.classList.add('is-open');
  playLottie(false);
};

const closeMenu = () => {
  isOpen = false;
  navMenu.classList.remove('is-open');
  playLottie(true);
};

navButton?.addEventListener('click', () => {
  isOpen ? closeMenu() : openMenu();
});

navWrapper?.addEventListener('click', (e) => {
  if (isOpen && !navMenu.contains(e.target) && !navButton.contains(e.target)) {
    closeMenu();
  }
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (isOpen) closeMenu();
  });
});
//#endregion
