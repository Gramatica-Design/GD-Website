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

    yCharAnimation(chars); //läuft auf allen Geräten
  }); //end of forEach
} //end of splitWithGSAP

function yCharAnimation(chars) {
  gsap.from(chars, {
    y: "110%",
    opacity: 0,
    ease: "power2.out",
    delay: config.fadeIn.delay, //Delay bevor die erste char animiert wird
    stagger: {
      each: config.fadeIn.staggerEach,
    }, //Stagger zwischen den chars ({each: 0.03} ist die Objektschreibweise)
    onComplete: () => {
      chars.forEach((char) => {
        char.classList.add("animate");
      });
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
