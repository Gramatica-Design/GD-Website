gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============================================================
// Hilfsfunktionen
// ============================================================

const getStepElements = (step) => {
  const cols = step.children;
  const textCol = cols[1];
  const rightCol = cols[2];
  return {
    number: cols[0],
    heading: textCol.children[0],
    textWrapper: textCol.children[1],
    text: textCol,
    processKeywords: rightCol.children[1],
  };
};

// ============================================================
// DESKTOP (≥992px): ScrollTrigger + GSAP Animationen
// ============================================================

const initDesktop = (steps, stickyContainer, triggerContainer, referenceStep, gridRowGap) => {

  // Inline-Styles vom Mobile-Code zurücksetzen
  steps.forEach((step) => {
    const el = getStepElements(step);
    gsap.set([el.textWrapper, el.processKeywords], { clearProps: 'all' });
    gsap.set(el.number, { clearProps: 'fontSize' });
    gsap.set(el.text, { clearProps: 'borderColor' });
    step.style.cursor = '';
  });

  // Höhen messen: geöffneten Zustand unsichtbar simulieren
  const getStepMetrics = () => {
    const el = getStepElements(referenceStep);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);
    const closedHeight = referenceStep.offsetHeight;

    gsap.set(el.number, { fontSize: headingFontSize * 3 });
    gsap.set([el.textWrapper, el.processKeywords], {
      visibility: 'hidden', height: 'auto', opacity: 1, y: 0,
    });
    const openHeight = referenceStep.offsetHeight + gridRowGap;
    gsap.set(el.number, { fontSize: '' });
    gsap.set([el.textWrapper, el.processKeywords], {
      visibility: '', height: 0, opacity: 0, y: '2.5rem',
    });

    return { openHeight, scrollDistance: openHeight - closedHeight };
  };

  let metrics = getStepMetrics();
  const resizeHandler = () => { metrics = getStepMetrics(); };
  window.addEventListener('resize', resizeHandler);

  const getScrollDistance = (i) => {
    const isFirst = i === 0;
    const isLast = i === steps.length - 1;
    return isFirst || isLast ? metrics.scrollDistance : metrics.openHeight;
  };

  const openStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);
    return gsap.timeline()
      .to(el.number, { fontSize: headingFontSize * 3, duration: 0.5, ease: 'power2.out' })
      .to([el.textWrapper, el.processKeywords], { height: 'auto', opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '<')
      .to(el.text, { borderColor: 'currentColor', duration: 0.5, ease: 'power2.out' }, '<');
  };

  const closeStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);
    return gsap.timeline()
      .to(el.number, { fontSize: headingFontSize, duration: 0.3, ease: 'power2.in' })
      .to([el.textWrapper, el.processKeywords], { height: 0, opacity: 0, y: '2.5rem', duration: 0.3, ease: 'power2.in' }, '<')
      .to(el.text, { borderColor: 'transparent', duration: 0.3, ease: 'power2.in' }, '<');
  };

  const triggers = gsap.utils.toArray(triggerContainer.children);
  let currentTop = parseInt(getComputedStyle(stickyContainer).top) || 0;

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: triggers[i],
      start: 'top 20%',
      scrub: true,
      onEnter: () => {
        const scroll = getScrollDistance(i);
        currentTop -= scroll;
        const tl = gsap.timeline();
        tl.add(openStep(step));
        tl.to(stickyContainer, { top: currentTop, duration: 0.5, ease: 'power2.out' }, '<');
      },
      onLeaveBack: () => {
        const scroll = getScrollDistance(i);
        currentTop += scroll;
        const tl = gsap.timeline();
        tl.add(closeStep(step));
        tl.to(stickyContainer, { top: currentTop, duration: 0.3, ease: 'power2.in' }, '<');
      },
    });
  });

  return () => {
    window.removeEventListener('resize', resizeHandler);
    ScrollTrigger.getAll().forEach(st => st.kill());
  };
};

// ============================================================
// MOBILE/TABLET (<992px): Click-Toggle
// ============================================================

const initMobile = (steps) => {
  steps.forEach((step) => {
    const el = getStepElements(step);
    let isOpen = false;

    gsap.set([el.textWrapper, el.processKeywords], {
      height: 0, opacity: 0, y: '2.5rem', overflow: 'hidden',
    });
    step.style.cursor = 'pointer';

    const clickHandler = () => {
      isOpen = !isOpen;
      if (isOpen) {
        gsap.to([el.textWrapper, el.processKeywords], { height: 'auto', opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to([el.textWrapper, el.processKeywords], { height: 0, opacity: 0, y: '2.5rem', duration: 0.3, ease: 'power2.in' });
      }
    };

    step.addEventListener('click', clickHandler);
    step._clickHandler = clickHandler;
  });

  return () => {
    steps.forEach((step) => {
      if (step._clickHandler) {
        step.removeEventListener('click', step._clickHandler);
        delete step._clickHandler;
      }
    });
  };
};

// ============================================================
// Init & Breakpoint-Wechsel
// ============================================================

window.addEventListener('load', () => {
  const stickyContainer = document.querySelector('[sticky-container]');
  if (!stickyContainer) return;

  const triggerContainer = document.querySelector('[trigger-container]');
  const steps = gsap.utils.toArray(stickyContainer.querySelectorAll('[step]'));
  const referenceStep = document.querySelector("[step='reference']");
  const gridRowGap = parseInt(getComputedStyle(referenceStep.parentElement).rowGap) || 0;

  let cleanup = null;

  const init = () => {
    if (cleanup) cleanup();
    const mq = window.matchMedia('(min-width: 992px)');
    cleanup = mq.matches
      ? initDesktop(steps, stickyContainer, triggerContainer, referenceStep, gridRowGap)
      : initMobile(steps);
  };

  init();
  window.matchMedia('(min-width: 992px)').addEventListener('change', init);
});
