//#region Feldlinien
/* *********************** Feldlinien Animation ************************* */

const feldlinien = [...document.querySelectorAll('#Feldlinien_Final path')];
const DRAW_DURATION = 800;

const opacityMap = {
  'cls-1': 0.3,
  'cls-2': 0.6,
  'cls-3': 0.7,
  'cls-6': 0.1,
  'cls-8': 0.5,
  'cls-10': 0.4,
  'cls-11': 0.1,
  'cls-12': 0.2,
};

function getTargetOpacity(el) {
  for (const cls of el.classList) {
    if (opacityMap[cls] !== undefined) return opacityMap[cls];
  }
  return 0.7;
}

feldlinien.forEach(el => {
  const targetOpacity = getTargetOpacity(el);
  const length = el.getTotalLength();
  el.style.strokeDasharray = `0, ${length}`;
  el.style.opacity = '0';
  drawLine(el, length, targetOpacity);
});

setTimeout(() => {
  fadeIn(document.getElementById('Magnet_Glow'), 700);
}, DRAW_DURATION);

function drawLine(el, length, targetOpacity) {
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / DRAW_DURATION, 1);
    el.style.strokeDasharray = `${progress * length}, ${length}`;
    el.style.opacity = progress * targetOpacity;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.style.strokeDasharray = `${length}, 0`;
      el.style.opacity = targetOpacity;
    }
  }
  requestAnimationFrame(tick);
}

function fadeIn(el, duration) {
  if (!el) return;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.style.opacity = easeOutCubic(progress);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
//#endregion
