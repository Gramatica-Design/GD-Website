if (window.matchMedia("(min-width: 992px)").matches) {

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
let stepPairs = [];
const referenceStep = document.querySelector("[step='reference']");
const gridRowGap =
  parseInt(getComputedStyle(referenceStep.parentElement).rowGap) || 0;

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
const getStepMetrics = () => {
  const el = getStepElements(referenceStep);
  const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

  const closedHeight = referenceStep.offsetHeight;

  gsap.set(el.number, { fontSize: headingFontSize * 3 });
  gsap.set([el.textWrapper, el.processKeywords], {
    visibility: "hidden",
    height: "auto",
    opacity: 1,
    y: 0,
  });

  const openHeight = referenceStep.offsetHeight + gridRowGap;

  gsap.set(el.number, { fontSize: "" });
  gsap.set([el.textWrapper, el.processKeywords], {
    visibility: "",
    height: 0,
    opacity: 0,
    y: "2.5rem",
  });

  return {
    openHeight,
    scrollDistance: openHeight - closedHeight,
  };
};

let metrics = getStepMetrics();

window.addEventListener("resize", () => {
  metrics = getStepMetrics();
});

window.addEventListener("beforeunload", () => {
  const openIndices = [];

  stepPairs.forEach((pair, i) => {
    const wrapper = pair.step.querySelector(".row_text-wrapper");
    if (wrapper.offsetHeight > 0) openIndices.push(i);
  });
  sessionStorage.setItem("openSteps", JSON.stringify(openIndices));
});

function getScrollDistance(i) {
  const isFirst = i === 0;
  const isLast = i === stepPairs.length - 1;
  const scroll =
    isFirst || isLast ? metrics.scrollDistance : metrics.openHeight;
  return scroll;
}

window.addEventListener("load", () => {
  const stickyContainer = document.querySelector("[sticky-container]");
  const triggerContainer = document.querySelector("[trigger-container]");
  const steps = gsap.utils.toArray(stickyContainer.querySelectorAll("[step]"));
  const triggers = gsap.utils.toArray(triggerContainer.children);

  let currentTop = parseInt(getComputedStyle(stickyContainer).top) || 0;

  // ---- Animationsfunktionen ----

  const openStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

    return gsap
      .timeline()
      // .to(step, { minHeight: metrics.openHeight, duration: 0.5, ease: "power2.out" })
      .to(el.number, {
        fontSize: headingFontSize * 3,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(
        [el.textWrapper, el.processKeywords],
        { height: "auto", opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "<",
      )
      .to(
        el.text,
        { borderColor: "currentColor", duration: 0.5, ease: "power2.out" },
        "<",
      );
  };

  const closeStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

    return gsap
      .timeline()
      .to(el.number, {
        fontSize: headingFontSize,
        duration: 0.3,
        ease: "power2.in",
      })
      .to(
        [el.textWrapper, el.processKeywords],
        {
          height: 0,
          opacity: 0,
          y: "2.5rem",
          duration: 0.3,
          ease: "power2.in",
        },
        "<",
      )
      .to(
        el.text,
        { borderColor: "transparent", duration: 0.3, ease: "power2.in" },
        "<",
      );
  };

  // ---- Höhen messen ----
  stepPairs = steps.map((step, i) => {
    return { step, trigger: triggers[i] };
  });

  // ---- ScrollTrigger ----
  const openSteps = JSON.parse(sessionStorage.getItem("openSteps") || "[]");

  stepPairs.forEach((pair, i) => {
    ScrollTrigger.create({
      trigger: pair.trigger,
      start: "top 70%",
      // markers: true,
      scrub: true,
      onEnter: () => {
        const wasOpen = openSteps.includes(i);
        const scroll = getScrollDistance(i);
        currentTop -= scroll;
        const tl = gsap.timeline();
        tl.add(openStep(pair.step));
        // if (!wasOpen) {
        //   tl.to(
        //     window,
        //     {
        //       scrollTo: `+=${scroll}`,
        //       duration: 0.5,
        //       ease: "power2.out",
        //     },
        //     "<",
        //   );
        // }
        tl.to(
          stickyContainer,
          { top: currentTop, duration: 0.5, ease: "power2.out" },
          "<",
        );
      },
      onLeaveBack: () => {
        const scroll = getScrollDistance(i);
        currentTop += scroll;
        const tl = gsap.timeline();
        tl.add(closeStep(pair.step));
        tl.to(
          stickyContainer,
          { top: currentTop, duration: 0.3, ease: "power2.in" },
          "<",
        );
      },
    });
  });
});

} // end desktop check
