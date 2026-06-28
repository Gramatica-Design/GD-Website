//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

const navButton = document.querySelector('.nav_button');
const navMenu = document.querySelector('.nav_menu');
const navWrapper = document.querySelector('.nav_menu-mobile-wrapper');

let isOpen = false;
let lottieAnim = null;
let lottieTween = null;

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
  const navLottieEl = document.querySelector('.nav_lottie');
  const all = Webflow.require('lottie').lottie.getRegisteredAnimations();

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

const closeMenu = () => {
  if (!isOpen) return;
  isOpen = false;
  navMenu?.classList.remove('is-open');
  setTimeout(() => {
    navWrapper?.classList.remove('is-open');
  }, 600);
  playLottie(true);
};

navButton?.addEventListener('click', () => {
  if (!isOpen) {
    // Öffnen
    isOpen = true;
    navWrapper?.classList.add('is-open');
    navMenu?.classList.add('is-open');
    playLottie(false);
  } else {
    closeMenu();
  }
});

// Schliessen bei Klick auf einen Navigationslink
document.querySelectorAll('.nav_menu_link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Schliessen bei Klick ausserhalb des Menüs
document.addEventListener('click', (e) => {
  if (isOpen && !navMenu?.contains(e.target) && !navButton?.contains(e.target)) {
    closeMenu();
  }
});

//#endregion
