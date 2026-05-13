(function () {
  if (!window.matchMedia("(min-width: 992px)").matches) return;

  const config = {
    durationIn: 0.45,
    durationOut: 0.5,
    easeIn: "power3.inOut",
    easeOut: "power2.inOut",
    textFlipThreshold: 0.5,
    cursorImg: {
      followSpeed: 0.1,
      offsetX: 50,
      offsetY: -600,
      durationIn: 0.5,
      durationOut: 0.35,
      easeIn: "power3.out",
      easeOut: "power2.in",
    },
  };

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

  function checkTextFlip(item, bg, isEntering) {
    const matrix = new DOMMatrix(getComputedStyle(bg).transform);
    const translateY = matrix.m42;
    const itemHeight = item.getBoundingClientRect().height;
    const coverage = 1 - Math.abs(translateY) / itemHeight;
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

  let moveX, moveY;
  const itemState = new Map();
  // mousemove global - moveX/moveY zeigen immer auf aktuelles Item
  let currentMouseX = 0,
    currentMouseY = 0; // neu

  document.addEventListener("mousemove", (e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    if (moveX) moveX(e.clientX - window.innerWidth / 2);
    if (moveY) moveY(e.clientY - window.innerHeight / 2);
  });

  function showCursorImg(item) {
    const mask = item.querySelector(".hover-img-mask");
    const img = item.querySelector(".projects_img");
    if (!mask || !img) return;

    moveX = gsap.quickTo(img, "x", {
      duration: config.cursorImg.followSpeed,
      ease: "power1.out",
    });
    moveY = gsap.quickTo(img, "y", {
      duration: config.cursorImg.followSpeed,
      ease: "power1.out",
    });

    // Bild sofort auf aktuelle Cursorposition setzen, bevor es sichtbar wird
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

  const cursor = document.querySelector(".cursor");
  function animateCursor(isEntering) {
    if (isEntering) {
      gsap.to(cursor, {
        height: "3rem",
        width: "3rem",
        duration: 0.3,
        ease: config.cursorImg.easeIn,
      });
    } else {
      gsap.to(cursor, {
        height: "1rem",
        width: "1rem",
        duration: 0.2,
        ease: config.cursorImg.easeOut,
      });
    }
  }

  document.querySelectorAll("[animated-item]").forEach((item) => {
    itemState.set(item, {});

    item.addEventListener("mouseenter", (e) => {
      animateCursor(true);
      const dir = getEnterDirection(item, e.clientY);
      itemState.get(item).enterDir = dir;
      animateIn(item, dir);
      showCursorImg(item);
    });

    item.addEventListener("mouseleave", (e) => {
      animateCursor(false);
      const exitDir = getExitDirection(item, e.clientY);
      animateOut(item, exitDir);
      hideCursorImg(item);
    });
  });
})();

// Link-Handling: Öffnet URL aus data-href in neuem Tab
const TAP_THRESHOLD = 10; // px Bewegung bis es als Scroll gilt

document.querySelectorAll("[animated-item]").forEach((item) => {
  item.addEventListener("click", () => {
    const url = item.dataset.href;
    if (url) window.open(url, "_blank");
  });

  // Mobile: nur öffnen wenn es ein Tap war (kein Scroll)
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
