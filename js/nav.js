//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

const navButton = document.querySelector('.nav_button');
const navMenu = document.querySelector('.nav_menu');
const navWrapper = document.querySelector('.nav_menu-mobile-wrapper');
const navLinks = document.querySelectorAll('.nav_menu_link');

let isOpen = false;
let lottieAnim = null;
let lottieTween = null;

// Wrapper startet bei height:0 damit er keine Klicks abfängt wenn geschlossen
if (navWrapper) {
  gsap.set(navWrapper, { height: 0, overflow: 'hidden' });
}

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
  const navLottieEl = document.querySelector('.nav_lottie');
  const all = Webflow.require('lottie').lottie.getRegisteredAnimations();

  // Lottie-Instanz finden: zuerst via wrapper, dann via direkten Match, dann Fallback auf erste
  lottieAnim =
    all.find(a => navLottieEl && navLottieEl.contains(a.wrapper)) ||
    all.find(a => a.wrapper === navLottieEl) ||
    all[0] ||
    null;

  if (lottieAnim) lottieAnim.goToAndStop(0, true);
});

const playLottie = (reverse) => {
  if (!lottieAnim) return;
  const half = Math.floor(lottieAnim.totalFrames * 0.5);
  const fromFrame = reverse ? half : 0;
  const toFrame = reverse ? 0 : half;

  if (lottieTween) lottieTween.kill();

  const obj = { frame: fromFrame };
  lottieTween = gsap.to(obj, {
    frame: toFrame,
    duration: 1,
    ease: 'power1.inOut',
    onUpdate: () => lottieAnim.goToAndStop(Math.round(obj.frame), true),
  });
};

const openMenu = () => {
  isOpen = true;
  navMenu.classList.add('is-open');
  if (navWrapper) gsap.set(navWrapper, { height: '', overflow: '' }); // CSS calc übernimmt sofort
  playLottie(false);
};

const closeMenu = () => {
  isOpen = false;
  navMenu.classList.remove('is-open');
  if (navWrapper) gsap.set(navWrapper, { height: 0, overflow: 'hidden', delay: 0.5 }); // nach Nav-Animation schliessen
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
