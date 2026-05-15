gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// stepPairs: Array mit je { step, trigger } pro Prozessschritt.
// Wird später im load-Listener befüllt, hier nur deklariert damit
// getScrollDistance() darauf zugreifen kann (hoisting).
let stepPairs = [];

// Der erste Step dient als Referenz für alle Höhenberechnungen.
// Da alle Steps gleich aufgebaut sind, reicht es einen zu messen.
const referenceStep = document.querySelector("[step='reference']");

// Den row-gap des Grid-Containers einlesen, damit er bei der
// Höhenberechnung des geöffneten Steps mitberücksichtigt wird.
const gridRowGap =
  parseInt(getComputedStyle(referenceStep.parentElement).rowGap) || 0;


// ============================================================
// Hilfsfunktion: DOM-Elemente eines Steps strukturiert zurückgeben
// ============================================================
const getStepElements = (step) => {
  const cols = step.children;
  const textCol = cols[1];  // mittlere Spalte: Heading + Text
  const rightCol = cols[2]; // rechte Spalte: Keywords

  return {
    number: cols[0],              // linke Spalte: grosse Zahl
    heading: textCol.children[0], // Überschrift (für fontSize-Messung)
    textWrapper: textCol.children[1], // Textblock (wird ein-/ausgeklappt)
    text: textCol,                // gesamte mittlere Spalte (für Border-Animation)
    processKeywords: rightCol.children[1], // Keywords (werden ein-/ausgeklappt)
  };
};


// ============================================================
// Kernmechanismus: Höhen messen für die stickyContainer-Bewegung
// ============================================================
// Das ist das Herzstück der Animation. Da CSS height: auto nicht
// animierbar ist, wird der geöffnete Zustand kurz unsichtbar
// gesetzt um die echte Höhe zu messen — dann sofort zurückgesetzt.
//
// Ergebnis:
//   openHeight:     Höhe des Steps im geöffneten Zustand (+ row-gap)
//   scrollDistance: Differenz zwischen offen und geschlossen —
//                   genau so weit muss der stickyContainer nach oben,
//                   wenn ein Step aufgeht.
const getStepMetrics = () => {
  const el = getStepElements(referenceStep);
  const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

  // Geschlossene Höhe messen (Ausgangszustand)
  const closedHeight = referenceStep.offsetHeight;

  // Geöffneten Zustand unsichtbar simulieren um die Höhe zu messen
  gsap.set(el.number, { fontSize: headingFontSize * 3 });
  gsap.set([el.textWrapper, el.processKeywords], {
    visibility: "hidden", // unsichtbar, aber nimmt Platz ein
    height: "auto",
    opacity: 1,
    y: 0,
  });

  // Geöffnete Höhe messen (+ row-gap des Grids)
  const openHeight = referenceStep.offsetHeight + gridRowGap;

  // Zustand wieder zurücksetzen auf geschlossen
  gsap.set(el.number, { fontSize: "" });
  gsap.set([el.textWrapper, el.processKeywords], {
    visibility: "",
    height: 0,
    opacity: 0,
    y: "2.5rem",
  });

  return {
    openHeight,
    scrollDistance: openHeight - closedHeight, // wie weit der Container sich bewegen muss
  };
};

// Metriken beim Laden berechnen und bei Resize aktualisieren
let metrics = getStepMetrics();

window.addEventListener("resize", () => {
  metrics = getStepMetrics();
});


// ============================================================
// Zustand merken: welche Steps waren beim Verlassen der Seite offen?
// ============================================================
// Beim Zurücknavigieren (browser back) kann so der Stand wiederhergestellt werden.
window.addEventListener("beforeunload", () => {
  const openIndices = [];
  stepPairs.forEach((pair, i) => {
    const wrapper = pair.step.querySelector(".row_text-wrapper");
    if (wrapper.offsetHeight > 0) openIndices.push(i);
  });
  sessionStorage.setItem("openSteps", JSON.stringify(openIndices));
});


// ============================================================
// Wie weit bewegt sich der stickyContainer pro Step?
// ============================================================
// Erster und letzter Step: nur scrollDistance (Höhendifferenz offen/zu).
// Mittlere Steps: volle openHeight — sie "verdrängen" den Container
// komplett, damit der neue Step oben sichtbar bleibt.
function getScrollDistance(i) {
  const isFirst = i === 0;
  const isLast = i === stepPairs.length - 1;
  const scroll =
    isFirst || isLast ? metrics.scrollDistance : metrics.openHeight;
  return scroll;
}


// ============================================================
// Hauptlogik (nach vollständigem DOM-Laden)
// ============================================================
window.addEventListener("load", () => {
  const stickyContainer = document.querySelector("[sticky-container]");
  const triggerContainer = document.querySelector("[trigger-container]");
  const steps = gsap.utils.toArray(stickyContainer.querySelectorAll("[step]"));
  const triggers = gsap.utils.toArray(triggerContainer.children);

  // currentTop verfolgt die aktuelle CSS-top Position des stickyContainers.
  // Startwert aus dem CSS lesen (z.B. 100px vom oberen Rand).
  // Jedes Mal wenn ein Step öffnet, wird currentTop reduziert
  // (Container geht nach oben) — wenn er schliesst, wieder erhöht.
  let currentTop = parseInt(getComputedStyle(stickyContainer).top) || 0;


  // ---- GSAP Animationen: Öffnen ----
  const openStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

    return gsap
      .timeline()
      // Zahl wird 3x grösser (visuelle Betonung des aktiven Steps)
      .to(el.number, {
        fontSize: headingFontSize * 3,
        duration: 0.5,
        ease: "power2.out",
      })
      // Textblock und Keywords gleichzeitig einblenden (<  = mit vorherigem parallel)
      .to(
        [el.textWrapper, el.processKeywords],
        { height: "auto", opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "<",
      )
      // Border der mittleren Spalte einblenden (visueller Trenner)
      .to(
        el.text,
        { borderColor: "currentColor", duration: 0.5, ease: "power2.out" },
        "<",
      );
  };


  // ---- GSAP Animationen: Schliessen ----
  const closeStep = (step) => {
    const el = getStepElements(step);
    const headingFontSize = parseFloat(getComputedStyle(el.heading).fontSize);

    return gsap
      .timeline()
      // Zahl wieder auf normale Grösse
      .to(el.number, {
        fontSize: headingFontSize,
        duration: 0.3,
        ease: "power2.in",
      })
      // Textblock und Keywords ausblenden
      .to(
        [el.textWrapper, el.processKeywords],
        { height: 0, opacity: 0, y: "2.5rem", duration: 0.3, ease: "power2.in" },
        "<",
      )
      // Border ausblenden
      .to(
        el.text,
        { borderColor: "transparent", duration: 0.3, ease: "power2.in" },
        "<",
      );
  };


  // stepPairs verbindet jeden Step mit seinem zugehörigen Trigger-Element
  stepPairs = steps.map((step, i) => {
    return { step, trigger: triggers[i] };
  });

  // Gespeicherte offene Steps aus sessionStorage laden (für browser back)
  const openSteps = JSON.parse(sessionStorage.getItem("openSteps") || "[]");

  // ---- ScrollTrigger pro Step ----
  stepPairs.forEach((pair, i) => {
    ScrollTrigger.create({
      trigger: pair.trigger,  // das unsichtbare Trigger-Element im trigger-container
      start: "top 70%",       // feuert wenn Trigger-Oberkante 70% vom Viewport-Top erreicht
      // markers: true,       // Debug-Hilfe: Trigger-Positionen visualisieren
      scrub: true,            // verhindert doppeltes Feuern bei schnellem Scrollen
      onEnter: () => {
        // Step öffnen und stickyContainer nach oben verschieben
        const wasOpen = openSteps.includes(i);
        const scroll = getScrollDistance(i);
        currentTop -= scroll; // Container bewegt sich nach oben
        const tl = gsap.timeline();
        tl.add(openStep(pair.step));
        tl.to(
          stickyContainer,
          { top: currentTop, duration: 0.5, ease: "power2.out" },
          "<", // parallel zur Step-Animation
        );
      },
      onLeaveBack: () => {
        // Step schliessen und stickyContainer wieder nach unten
        const scroll = getScrollDistance(i);
        currentTop += scroll; // Container bewegt sich zurück nach unten
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
