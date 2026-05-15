(function () {

  // ─── Konfiguration ────────────────────────────────────────────────────────
  // Alle Animationswerte zentral hier anpassen.
  const config = {
    durationIn: 0.45,           // Dauer der Hintergrund-Einblend-Animation (s)
    durationOut: 0.5,           // Dauer der Hintergrund-Ausblend-Animation (s)
    easeIn: "power3.inOut",
    easeOut: "power2.inOut",
    textFlipThreshold: 0.5,     // Ab 50% Abdeckung wird der Text invertiert
    cursorImg: {
      followSpeed: 0.1,         // Wie schnell das Bild dem Cursor folgt (s)
      durationIn: 0.5,          // Einblend-Dauer des Vorschaubilds
      durationOut: 0.35,        // Ausblend-Dauer des Vorschaubilds
      easeIn: "power3.out",
      easeOut: "power2.in",
    },
  };

  // ─── Richtungserkennung ───────────────────────────────────────────────────
  // Ermittelt, von welcher Seite die Maus in ein Element eintritt bzw. es verlässt.
  // Vergleicht die Y-Position der Maus mit der Mitte des Elements.

  function getEnterDirection(item, mouseY) {
    const rect = item.getBoundingClientRect();
    const relY = mouseY - rect.top;
    return relY < rect.height / 2 ? "top" : "bottom";
  }

  function getExitDirection(item, mouseY) {
    const rect = item.getBoundingClientRect();
    const relY = mouseY - rect.top;
    return relY < rect.height / 2 ? "top" : "bottom";
  }

  // ─── Text-Invertierung ────────────────────────────────────────────────────
  // Prüft während der Animation, wie weit der farbige Hintergrund das Element
  // bereits überdeckt. Ab dem textFlipThreshold (50%) wird die Klasse
  // "text-inverted" gesetzt, damit der Text auf dem Hintergrund lesbar bleibt.

  function checkTextFlip(item, bg, isEntering) {
    const matrix = new DOMMatrix(getComputedStyle(bg).transform);
    const translateY = matrix.m42;                             // aktueller Y-Versatz in px
    const itemHeight = item.getBoundingClientRect().height;
    const coverage = 1 - Math.abs(translateY) / itemHeight;   // 0 = nicht überdeckt, 1 = voll überdeckt
    if (isEntering) {
      coverage >= config.textFlipThreshold
        ? item.classList.add("text-inverted")
        : item.classList.remove("text-inverted");
    } else {
      coverage < config.textFlipThreshold
        ? item.classList.remove("text-inverted")
        : item.classList.add("text-inverted");
    }
  }

  // ─── Hintergrund-Animation ────────────────────────────────────────────────
  // animateIn: Schiebt den farbigen Hintergrund ([animated-bg]) von oben oder
  //            unten ins Element hinein.
  // animateOut: Schiebt ihn in die Austrittsrichtung wieder heraus.
  // killTweensOf verhindert, dass eine laufende Animation mit einer neuen
  // kollidiert (z.B. bei schnellem Hover).

  function animateIn(item, fromDirection) {
    const bg = item.querySelector("[animated-bg]");
    gsap.killTweensOf(bg);
    gsap.set(bg, { y: fromDirection === "top" ? "-100%" : "100%" });
    gsap.to(bg, {
      y: "0%",
      duration: config.durationIn,
      ease: config.easeIn,
      onUpdate() {
        checkTextFlip(item, bg, true);
      },
      onComplete() {
        item.classList.add("text-inverted");
      },
    });
  }

  function animateOut(item, toDirection) {
    const bg = item.querySelector("[animated-bg]");
    gsap.killTweensOf(bg);
    gsap.to(bg, {
      y: toDirection === "top" ? "-100%" : "100%",
      duration: config.durationOut,
      ease: config.easeOut,
      onUpdate() {
        checkTextFlip(item, bg, false);
      },
      onComplete() {
        item.classList.remove("text-inverted");
      },
    });
  }

  // ─── Cursor-Bild (Vorschau) ───────────────────────────────────────────────
  // Das Vorschaubild (.hover-img-mask) folgt auf Desktop dem Cursor.
  // moveX / moveY sind GSAP quickTo-Funktionen: Sie interpolieren die Position
  // flüssig, ohne bei jedem mousemove einen neuen Tween zu starten.
  // currentMouseX/Y wird im globalen mousemove-Listener aktualisiert und beim
  // showCursorImg verwendet, damit das Bild sofort an der richtigen Position
  // erscheint (kein "Sprung" vom Mittelpunkt zur Cursorposition).

  let moveX, moveY;
  let currentMouseX = 0, currentMouseY = 0;
  const itemState = new Map(); // Speichert den Zustand (z.B. Eintrittsrichtung) pro Item

  document.addEventListener("mousemove", (e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    // Versatz relativ zur Bildschirmmitte (GSAP bewegt das Bild von der CSS-Mitte aus)
    if (moveX) moveX(e.clientX - window.innerWidth / 2);
    if (moveY) moveY(e.clientY - window.innerHeight / 2);
  });

  function showCursorImg(item) {
    const mask = item.querySelector(".hover-img-mask");
    const img = item.querySelector(".projects_img");
    if (!mask || !img) return;

    // quickTo: erzeugt eine wiederverwendbare Funktion, die bei jedem
    // mousemove-Aufruf einen flüssigen Tween zur neuen Position startet.
    moveX = gsap.quickTo(img, "x", { duration: config.cursorImg.followSpeed, ease: "power1.out" });
    moveY = gsap.quickTo(img, "y", { duration: config.cursorImg.followSpeed, ease: "power1.out" });

    // Bild sofort auf Cursorposition setzen, bevor es eingeblendet wird
    gsap.set(img, {
      x: currentMouseX - window.innerWidth / 2,
      y: currentMouseY - window.innerHeight / 2,
    });

    gsap.killTweensOf(mask);
    mask.style.display = "flex";
    gsap.to(mask, {
      opacity: 1,
      scale: 1,
      duration: config.cursorImg.durationIn,
      ease: config.cursorImg.easeIn,
    });
  }

  function hideCursorImg(item) {
    const mask = item.querySelector(".hover-img-mask");
    if (!mask) return;
    gsap.killTweensOf(mask);
    gsap.to(mask, {
      opacity: 0,
      scale: 0.85,
      duration: config.cursorImg.durationOut,
      ease: config.cursorImg.easeOut,
      onComplete() {
        mask.style.display = "none";
      },
    });
  }

  // ─── Breakpoint-Handling ──────────────────────────────────────────────────
  // Auf Desktop (≥992px): Vorschaubilder per Hover sichtbar (Cursor-folgendes Bild).
  //   → Masken ausblenden; sie erscheinen erst beim mouseenter via showCursorImg.
  // Auf Mobile (<992px): Vorschaubilder statisch sichtbar, keine Hover-Animation.
  //   → Masken sofort einblenden, alle GSAP-Transforms zurücksetzen.
  //   → moveX/moveY nullen, damit der globale mousemove-Listener kein Bild mehr
  //     bewegt (sonst würde das zuletzt gehover-te Bild dem Cursor weiterfolgen,
  //     auch nach einem Resize auf Mobile).
  // applyBreakpoint wird beim Laden und bei jedem Breakpoint-Wechsel aufgerufen.

  const allItems = gsap.utils.toArray("[animated-item]");

  function applyBreakpoint() {
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;

    allItems.forEach((item) => {
      const mask = item.querySelector(".hover-img-mask");
      const img = item.querySelector(".projects_img");
      if (!mask) return;

      if (isDesktop) {
        // Desktop: Maske ausblenden – wird per Hover via showCursorImg gezeigt
        gsap.killTweensOf(mask);
        gsap.set(mask, { opacity: 0, scale: 0.85 });
        mask.style.display = "none";
        if (img) gsap.set(img, { x: 0, y: 0 });
      } else {
        // Mobile: Maske statisch sichtbar, kein Cursor-Follow
        gsap.killTweensOf(mask);
        mask.style.display = "flex";
        gsap.set(mask, { opacity: 1, scale: 1 });
        if (img) {
          gsap.killTweensOf(img);
          gsap.set(img, { x: 0, y: 0 });
        }
      }
    });

    if (!isDesktop) {
      // quickTo-Funktionen nullen: mousemove-Listener prüft "if (moveX)" –
      // ohne Nullung würde das zuletzt gehover-te Bild dem Cursor folgen.
      moveX = null;
      moveY = null;
    }
  }

  // Breakpoint beim Laden anwenden und bei Resize-Wechsel reaktivieren
  applyBreakpoint();
  window.matchMedia("(min-width: 992px)").addEventListener("change", applyBreakpoint);

  // ─── Event Listener ───────────────────────────────────────────────────────
  // Hover-Animationen nur auf Desktop (≥992px).
  // Die Prüfung erfolgt beim Event selbst (nicht einmalig beim Init),
  // damit ein Resize während der Session korrekt berücksichtigt wird.

  allItems.forEach((item) => {
    itemState.set(item, {});

    item.addEventListener("mouseenter", (e) => {
      if (!window.matchMedia("(min-width: 992px)").matches) return;
      const dir = getEnterDirection(item, e.clientY);
      itemState.get(item).enterDir = dir;
      animateIn(item, dir);
      showCursorImg(item);
    });

    item.addEventListener("mouseleave", (e) => {
      if (!window.matchMedia("(min-width: 992px)").matches) return;
      const exitDir = getExitDirection(item, e.clientY);
      animateOut(item, exitDir);
      hideCursorImg(item);
    });
  });

})();

// ─── Link-Handling ────────────────────────────────────────────────────────────
// Klick auf ein [animated-item] öffnet die URL aus data-href in einem neuen Tab.
// Auf Mobile wird zusätzlich geprüft, ob es ein echter Tap war (keine Scroll-Geste):
// Wenn die Finger-Bewegung unter TAP_THRESHOLD liegt, gilt es als Tap → Link öffnen.

const TAP_THRESHOLD = 10; // px – maximale Bewegung, damit es als Tap gilt

document.querySelectorAll("[animated-item]").forEach((item) => {
  item.addEventListener("click", () => {
    const url = item.dataset.href;
    if (url) window.open(url, "_blank");
  });

  let touchStartX = 0;
  let touchStartY = 0;

  item.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  item.addEventListener("touchend", (e) => {
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (deltaX < TAP_THRESHOLD && deltaY < TAP_THRESHOLD) {
      const url = item.dataset.href;
      if (url) {
        e.preventDefault();
        window.open(url, "_blank");
      }
    }
  });
});
