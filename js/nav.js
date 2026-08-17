//#region Navigation Menu
/* ************************* Nav Menu ******************************** */

let lottieAnim = null;

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
  const navLottieEl = document.querySelector('.nav_lottie');
  const all = Webflow.require('lottie').lottie.getRegisteredAnimations();
  lottieAnim =
    all.find(a => navLottieEl && navLottieEl.contains(a.wrapper)) ||
    all.find(a => a.wrapper === navLottieEl) ||
    all[0] || null;
  if (lottieAnim) {
    lottieAnim.autoplay = false;
    lottieAnim.goToAndStop(0, true);
  }
});

const animateLottie = (from, to, duration, ease) => {
  if (!lottieAnim) return;
  const obj = { frame: from };
  gsap.to(obj, {
    frame: to, duration, ease, overwrite: 'auto',
    onUpdate: () => lottieAnim.goToAndStop(Math.round(obj.frame), true),
  });
};

const navButton = document.querySelector('.nav_button');
const navMenu   = document.querySelector('.nav_menu');

const openMenu = () => {
  const styles = getComputedStyle(document.body);
  gsap.to(document.body, {
    '--nav_height':      styles.getPropertyValue('--nav_end-height').trim(),
    duration: 0.7, ease: 'power3.out', overwrite: 'auto',
  });
  gsap.to(document.body, {
    '--nav_menu-height': styles.getPropertyValue('--nav_menu-end-height').trim(),
    duration: 0.82, ease: 'power1.out', overwrite: 'auto',
  });
  animateLottie(0, 57, 0.82, 'power1.out');
  navMenu?.classList.add('is-open');
};

const closeMenu = () => {
  const styles = getComputedStyle(document.body);
  gsap.to(document.body, {
    '--nav_menu-height': '0rem',
    duration: 0.7, ease: 'power3.in', overwrite: 'auto',
  });
  gsap.to(document.body, {
    '--nav_height': styles.getPropertyValue('--nav_closed-height').trim(),
    duration: 0.82, ease: 'power1.in', overwrite: 'auto',
  });
  animateLottie(57, 0, 0.82, 'power1.in');
  navMenu?.classList.remove('is-open');
};

navButton?.addEventListener('click', () => {
  navMenu?.classList.contains('is-open') ? closeMenu() : openMenu();
});

document.addEventListener('click', (e) => {
  if (!navMenu?.classList.contains('is-open')) return;
  if (e.target.closest('.nav_menu') || e.target.closest('.nav_button')) return;
  closeMenu();
});

document.querySelectorAll('.nav_link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

//#endregion
