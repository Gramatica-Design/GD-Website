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

const lottieProxy = { frame: 0 };

const animateLottie = (to, duration, ease) => {
  if (!lottieAnim) { console.warn('[nav] animateLottie: lottieAnim ist null'); return; }
  console.log('[nav] animateLottie → to:', to, '| current frame:', lottieProxy.frame);
  gsap.to(lottieProxy, {
    frame: to, duration, ease, overwrite: true,
    onUpdate: () => lottieAnim.goToAndStop(Math.round(lottieProxy.frame), true),
  });
};

const navButton = document.querySelector('.nav_button');
const navMenu   = document.querySelector('.nav_menu');

const openMenu = () => {
  console.log('[nav] openMenu');
  const styles = getComputedStyle(document.body);
  gsap.to(document.body, {
    '--nav_height':      styles.getPropertyValue('--nav_end-height').trim(),
    duration: 0.5, ease: 'power3.out', overwrite: 'auto',
  });
  gsap.to(document.body, {
    '--nav_menu-height': styles.getPropertyValue('--nav_menu-end-height').trim(),
    duration: 0.55, ease: 'power1.out', overwrite: 'auto',
  });
  animateLottie(57, 0.55, 'none');
  navMenu?.classList.add('is-open');
};

const closeMenu = () => {
  console.log('[nav] closeMenu');
  const styles = getComputedStyle(document.body);
  gsap.to(document.body, {
    '--nav_menu-height': '0rem',
    duration: 0.5, ease: 'power3.in', overwrite: 'auto',
  });
  gsap.to(document.body, {
    '--nav_height': styles.getPropertyValue('--nav_closed-height').trim(),
    duration: 0.55, ease: 'power1.in', overwrite: 'auto',
  });
  animateLottie(0, 0.55, 'none');
  navMenu?.classList.remove('is-open');
};

navButton?.addEventListener('click', (e) => {
  console.log('[nav] button click | is-open:', navMenu?.classList.contains('is-open'), '| target:', e.target.className);
  navMenu?.classList.contains('is-open') ? closeMenu() : openMenu();
});

document.addEventListener('click', (e) => {
  if (!navMenu?.classList.contains('is-open')) return;
  const inMenu   = !!e.target.closest('.nav_menu');
  const inButton = !!e.target.closest('.nav_button');
  console.log('[nav] doc click | inMenu:', inMenu, '| inButton:', inButton, '| target:', e.target.className);
  if (inMenu || inButton) return;
  closeMenu();
});

document.querySelectorAll('.nav_link').forEach(link => {
  link.addEventListener('click', () => {
    console.log('[nav] nav_link click');
    closeMenu();
  });
});

//#endregion
