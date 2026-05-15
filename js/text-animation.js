//#region Text Animation
/* ****************** Text Animationen (reveal) ********************** */

// ============================================================
// KONFIGURATION
// ============================================================
const config = {
  fadeIn: {
    staggerEach: 0.03, //Zeit zwischen den Animationen der einzelnen chars
    delay: 0.2, //Delay bevor die erste char animiert wird
  },
  magnet: {
    stagger: 0.08,
    // W(0)e(1)b(2)s(3)i(4)t(5)e(6)s(7) d(8)i(9)e(10) a(11)n(12)z(13)i(14)e(15)h(16)e(17)n(18)
    chars: {
      t: { index: 5, x: "24rem", y: "4rem", rotation: -10, moveOrder: 2 },
      e6: { index: 6, x: "22rem", y: "2.5rem", rotation: 14, moveOrder: 1 },
      s: { index: 7, x: "20rem", y: "3rem", rotation: -10, moveOrder: 0 },
      e10: { index: 10, x: "20rem", y: "-0.5rem", rotation: 13, moveOrder: 2 },
      e17: { index: 17, x: "28rem", y: "-1.5rem", rotation: -15, moveOrder: 2 },
      n: { index: 18, x: "24rem", y: "-2.2rem", rotation: 9, moveOrder: 1 },
    },
  },
};

function init() {
  gsap.registerPlugin(SplitText, ScrollTrigger);
  pageLoadAnimation();
  footerTextAnimation();
}

function pageLoadAnimation() {
  // Nur auf Desktop ausführen
  //if (!window.matchMedia("(min-width: 992px)").matches) return;

  //alles in einzelne Buchstaben aufsplitten
  document.querySelectorAll("[data-text-fade-in]").forEach((el) => {
    const chars = splitUpText(el); //alle chars in einem Array

    //Delay für Farbanimation setzen. Animation findet in CSS statt. Y-Move wird unten separat via GSAP animiert
    setDelayOnCharsForCSSAnimation(chars);

    if (window.matchMedia("(min-width: 992px)").matches) {
      const timeline = createMagnetAnimationTimeline(chars);
      const st = setUpScrollTriggerForMagnetAnimation(timeline); //ScrollTrigger erstellen
      st.refresh(); //ScrollTrigger manuell refreshen, damit die Animation auch beim ersten Scrollen funktioniert
    }

    if (window.scrollY === 0) {
      // Frischer Load ohne Scroll: Entrance-Animation mit Scroll-Lock
      yCharAnimation(chars);
    } else {
      // Bereits gescrollt (Reload bei gescrollter Position): Chars sofort
      // einblenden ohne Animation, damit kein Konflikt mit dem ScrollTrigger entsteht
      gsap.set(chars, { y: 0, opacity: 1 });
      chars.forEach((char) => char.classList.add("animate"));
    }
  }); //end of forEach
} //end of splitWithGSAP

// Scroll-Lock: Events abfangen statt overflow:hidden –
// Scrollbalken bleibt sichtbar, kein Layout-Shift.
const _scrollLock = {
  wheel:   (e) => e.preventDefault(),
  touchmove: (e) => e.preventDefault(),
  keydown: (e) => {
    const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (keys.includes(e.key)) e.preventDefault();
  },
};
function lockScroll() {
  window.addEventListener("wheel",    _scrollLock.wheel,    { passive: false });
  window.addEventListener("touchmove", _scrollLock.touchmove, { passive: false });
  window.addEventListener("keydown",  _scrollLock.keydown);
}
function unlockScroll() {
  window.removeEventListener("wheel",    _scrollLock.wheel);
  window.removeEventListener("touchmove", _scrollLock.touchmove);
  window.removeEventListener("keydown",  _scrollLock.keydown);
}

function yCharAnimation(chars) {
  // Scroll sperren, damit die Magnet-ScrollTrigger-Animation nicht mit der
  // Entrance-Animation kollidiert. Nur wenn die Seite noch nicht gescrollt
  // wurde (frischer Aufruf). Bei Reload-mit-Scroll wird der Lock übersprungen,
  // damit der ScrollTrigger die Buchstaben sofort korrekt positioniert.
  const shouldLockScroll = window.scrollY === 0;
  if (shouldLockScroll) lockScroll();

  gsap.from(chars, {
    y: "110%",
    opacity: 0,
    ease: "power2.out",
    delay: config.fadeIn.delay,
    stagger: {
      each: config.fadeIn.staggerEach,
    },
    onComplete: () => {
      chars.forEach((char) => {
        char.classList.add("animate");
      });
      // Scroll wieder freigeben – Buchstaben sind jetzt an ihrem Platz,
      // ScrollTrigger kann sauber übernehmen.
      if (shouldLockScroll) unlockScroll();
    },
  });
}

function setDelayOnCharsForCSSAnimation(chars) {
  chars.forEach((char, i) => {
    char.style.animationDelay = `${config.fadeIn.delay + i * config.fadeIn.staggerEach}s`;
  });
}

function splitUpText(el) {
  const split = new SplitText(el, {
    type: "chars",
    charsClass: "split-char",
    propIndex: true, //jeder Char bekommt automatisch --char als CSS Variable mit seinem Index
  });
  const chars = split.chars; //alle chars in einem Array

  // Padding/Margin nur für Chars innerhalb von .split-line.accent setzen,
  // damit kursive Buchstaben nicht abgeschnitten werden.
  // Direkt als inline style, damit SplitText-Styles nicht überschreiben.
  chars.forEach((char) => {
    if (char.closest(".split-line.accent")) {
      char.style.padding = "0.1em";
      char.style.margin = "-0.1em";
    }
  });

  return chars;
}

function createMagnetAnimationTimeline(chars) {
  const { stagger, chars: magnetConfig } = config.magnet;
  const timeline = gsap.timeline({ paused: true });

  const entries = Object.values(magnetConfig);

  entries.forEach((charConfig) => {
    timeline.to(
      chars[charConfig.index],
      {
        x: charConfig.x,
        y: charConfig.y,
        rotation: charConfig.rotation,
        ease: "none",
      },
      charConfig.moveOrder * stagger,
    );
  });
  return timeline;
}

function setUpScrollTriggerForMagnetAnimation(magnetAnimation) {
  return ScrollTrigger.create({
    trigger: ".section_hero",
    start: "top top",
    end: "bottom 25%",
    animation: magnetAnimation,
    scrub: true,
  });
}

init();

// overflow:hidden beim ersten Scroll entfernen, damit Buchstaben beim Scrollen nicht abgeschnitten werden
const removeOverflowOnScroll = () => {
  document.querySelectorAll(".split-line").forEach((line) => {
    line.style.overflow = "visible";
  });
  window.removeEventListener("scroll", removeOverflowOnScroll);
};
window.addEventListener("scroll", removeOverflowOnScroll, { passive: true });
//#endregion

function footerTextAnimation() {
  // if (!window.matchMedia("(min-width: 992px)").matches) return;

  document.querySelectorAll("[data-text-scroll-in]").forEach((container) => {
    // Direkt die footer_text-big Elemente holen, nicht die Wrapper
    const textBlocks = [...container.querySelectorAll(".text-big")];
    const allChars = [];

    textBlocks.forEach((block) => {
      const chars = splitUpText(block);
      allChars.push(...chars);
    });

    gsap.from(allChars, {
      y: "110%",
      opacity: 0,
      ease: "power2.out",
      stagger: { each: config.fadeIn.staggerEach },
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
      },
      onComplete: () => {
        allChars.forEach((char, i) => {
          char.style.animationDelay = `${i * config.fadeIn.staggerEach}s`;
          void char.offsetWidth;
          char.classList.add("animate");
        });
      },
    });
  });
}
