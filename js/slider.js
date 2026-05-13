// ============================================================
// reviews_slider
// ============================================================

const reviewsSlider = () => {
  const config = {
    duration: 0.6,
    ease: "power2.inOut",
    fadeDuration: 0.3,
    fadeEase: "power2.out",
    swipeThreshold: 50,

    // Positionen als % des quadratischen Containers
    // gross (aktiv): 60% breit, 100% hoch, rechts (left: 40%)
    // klein-1 (naechste): 20% breit, 20% hoch, links unten (left: 0, bottom: 20%)
    // klein-2 (uebernachste): 20% breit, 20% hoch, links unten (left: 0, bottom: 0)
    positions: [
      // Position 0: aktiv, gross, rechts
      {
        left: "42%",
        bottom: "0%",
        width: "58%",
        height: "100%",
        filter: "grayscale(0)",
        zIndex: 3,
        opacity: 1,
        borderRadius: "0.75rem",
      },
      // Position 1: thumbnail rechts (naechste)
      {
        left: "21%",
        bottom: "0%",
        width: "19%",
        height: "19%",
        filter: "grayscale(1)",
        zIndex: 2,
        opacity: 1,
        borderRadius: "0.5rem",
      },
      // Position 2: thumbnail links (uebernachste)
      {
        left: "0%",
        bottom: "0%",
        width: "19%",
        height: "19%",
        filter: "grayscale(1)",
        zIndex: 1,
        opacity: 1,
        borderRadius: "0.5rem",
      },
      // Position 3: ausserhalb links (wartet auf Einzug)
      {
        left: "-25%",
        bottom: "0%",
        width: "19%",
        height: "19%",
        filter: "grayscale(1)",
        zIndex: 0,
        opacity: 0,
        borderRadius: "0.5rem",
      },
    ],
  };

  // --- DOM ---
  const mask = document.querySelector(".reviews_carousel-mask");
  const slides = gsap.utils.toArray(".reviews_slide");
  const contents = gsap.utils.toArray(".reviews_content");
  const btnNext = document.querySelector(".reviews_btn-next");
  const btnPrev = document.querySelector(".reviews_btn-prev");

  // Dots dynamisch generieren
  const dotsContainer = document.querySelector(".reviews_dots");
  dotsContainer.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("reviews_dot");
    if (i === 0) dot.classList.add("is-active");
    dotsContainer.appendChild(dot);
  });
  const dots = gsap.utils.toArray(".reviews_dot");

  if (!slides.length || !contents.length) return;

  const total = slides.length;
  let current = 0;
  let animating = false;

  // const getOffset = (i) => (current - i + total) % total;
  const getOffset = (i) => (i - current + total) % total;

  // es gibt 4 Positionen: 0=aktiv, 1=naechste, 2=uebernachste, 3=wartet auf Einzug von links
  // sollte es mehr als 4 slides geben, werden die weiteren wie die 3. position behandelt (ausserhalb links)
  const getPos = (offset) =>
    config.positions[offset] ?? {
      left: "-25%",
      bottom: "0%",
      width: "19%",
      height: "19%",
      filter: "grayscale(1)",
      zIndex: 0,
      opacity: 0,
      borderRadius: "0.5rem",
    };

  // --- Init ---
  const initSlides = () => {
    slides.forEach((slide, i) => {
      const pos = getPos(getOffset(i));
      gsap.set(slide, {
        position: "absolute",
        left: pos.left,
        bottom: pos.bottom,
        top: "auto",
        width: pos.width,
        height: pos.height,
        filter: pos.filter,
        zIndex: pos.zIndex,
        opacity: pos.opacity,
        borderRadius: pos.borderRadius,
        x: 0,
        y: 0,
        scale: 1,
      });
    });

    // Thumbnails klickbar machen
    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        const offset = getOffset(i);
        if (offset === 0) return; // bereits aktiv, nichts tun
        const direction = offset > total / 2 ? -1 : 1;
        goTo(i, direction);
      });
    });

    contents.forEach((content, i) => {
      gsap.set(content, {
        display: i === 0 ? "flex" : "none",
        opacity: i === 0 ? 1 : 0,
      });
    });

    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === 0));
    updatePointerEvents();
  };

  // Helper: pointer-events nach current aktualisieren
  const updatePointerEvents = () => {
    slides.forEach((slide, i) => {
      const offset = getOffset(i);
      gsap.set(slide, { pointerEvents: offset === 0 ? "none" : "auto" });
    });
  };

  const initReadMore = () => {
    const checkTruncation = (btn, wrapper) => {
      // kurz auf auto setzen um echte scrollHeight zu messen
      const currentHeight = wrapper.style.height;
      wrapper.style.height = "auto";
      const isTruncated = wrapper.scrollHeight > wrapper.clientHeight;
      wrapper.style.height = currentHeight;
      gsap.set(btn, { display: isTruncated ? "inline-block" : "none" });
    };

    const setupBtn = (btn) => {
      const wrapper = btn
        .closest(".reviews_content-wrapper")
        .querySelector(".reviews_text-wrapper");

      // overflow hidden damit der expanding Text nicht in Buttons faehrt
      gsap.set(wrapper, { overflow: "hidden" });

      checkTruncation(btn, wrapper);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const isExpanded = wrapper.classList.contains("is-expanded");

        if (!isExpanded) {
          // Aufklappen
          const fromHeight = wrapper.offsetHeight;
          wrapper.classList.add("is-expanded");
          const toHeight = wrapper.scrollHeight;
          wrapper.classList.remove("is-expanded");

          gsap.fromTo(
            wrapper,
            { height: fromHeight },
            {
              height: toHeight,
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: () => {
                wrapper.classList.add("is-expanded");
                gsap.set(wrapper, { height: "auto" });
              },
            },
          );
          btn.textContent = "weniger";
        } else {
          // Zuklappen
          const fromHeight = wrapper.offsetHeight;
          wrapper.classList.remove("is-expanded");
          const toHeight = wrapper.offsetHeight;

          gsap.fromTo(
            wrapper,
            { height: fromHeight },
            {
              height: toHeight,
              duration: 0.5,
              ease: "power2.inOut",
              onComplete: () => gsap.set(wrapper, { height: "auto" }),
            },
          );
          btn.textContent = "mehr lesen";
        }
      });
    };

    document.querySelectorAll(".reviews_read-more").forEach(setupBtn);
  };

  // --- Navigation ---
  const goTo = (index, direction) => {
    if (animating) return;
    if (((index % total) + total) % total === current) return; // bereits aktiv
    animating = true;

    const prev = current;
    current = ((index % total) + total) % total;

    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));

    // PREV: einfahrendes Bild VOR der Timeline auf Startposition setzen
    // damit gsap.set synchron laeuft bevor die Timeline beginnt
    if (direction === -1) {
      slides.forEach((slide, i) => {
        const newOffset = (current - i + total) % total;
        if (newOffset === 0) {
          gsap.set(slide, {
            left: "110%",
            bottom: "0%",
            width: getPos(0).width,
            height: getPos(0).height,
            filter: getPos(0).filter,
            borderRadius: getPos(0).borderRadius,
            opacity: 0,
            zIndex: 3,
          });
        }
      });
    }

    const tl = gsap.timeline({
      defaults: { duration: config.duration, ease: config.ease },
      onComplete: () => {
        animating = false;
      },
    });

    slides.forEach((slide, i) => {
      const oldOffset = (i - prev + total) % total;
      const newOffset = (i - current + total) % total;
      // Bei weniger Slides als Positionen: Offsets auf sichtbaren Bereich begrenzen
      const visiblePositions = Math.min(total, config.positions.length - 1);
      const newPos = getPos(Math.min(newOffset, config.positions.length - 1));

      if (direction === 1) {
        // --- NEXT ---

        if (oldOffset === 0) {
          // Aktives Bild faehrt nach rechts aussen
          tl.to(
            slide,
            {
              left: "110%",
              duration: config.duration,
              ease: config.ease,
            },
            0,
          );
          tl.call(
            () => {
              gsap.set(slide, {
                left: newPos.left,
                bottom: newPos.bottom,
                width: "19%",
                height: "19%",
                borderRadius: "0.5rem",
                filter: "grayscale(1)",
                opacity: total <= 3 ? 1 : 0, // bei 3 slides bleibt es sichtbar
                zIndex: newPos.zIndex,
              });
            },
            null,
            config.duration,
          );
        } else {
          tl.to(
            slide,
            {
              left: newPos.left,
              bottom: newPos.bottom,
              width: newPos.width,
              height: newPos.height,
              filter: newPos.filter,
              zIndex: newPos.zIndex,
              opacity: newPos.opacity,
              borderRadius: newPos.borderRadius,
            },
            0,
          );
        }
      } else {
        // --- PREV ---

        if (newOffset === 0) {
          // Kommt von rechts rein
          tl.to(
            slide,
            {
              left: getPos(0).left,
              opacity: 1,
              duration: config.duration,
              ease: "power2.out",
            },
            config.duration / 3,
          );
        } else if (oldOffset === 0) {
          // Aktives Bild wird klein und geht nach links
          tl.to(
            slide,
            {
              left: newPos.left,
              bottom: newPos.bottom,
              width: newPos.width,
              height: newPos.height,
              filter: newPos.filter,
              zIndex: newPos.zIndex,
              opacity: newPos.opacity,
              borderRadius: newPos.borderRadius,
            },
            0,
          );
        } else if (
          total > 3 &&
          (oldOffset === config.positions.length - 1 ||
            newOffset >= config.positions.length)
        ) {
          // Linkes Bild verschwindet -- nur bei mehr als 3 slides noetig
          tl.to(
            slide,
            {
              left: "-25%",
              opacity: 0,
              duration: config.duration,
            },
            0,
          );
          tl.call(
            () => {
              gsap.set(slide, {
                left: newPos.left,
                bottom: newPos.bottom,
                zIndex: newPos.zIndex,
              });
            },
            null,
            config.duration,
          );
        } else {
          // Mittleres Bild schiebt sich nach links
          tl.to(
            slide,
            {
              left: newPos.left,
              bottom: newPos.bottom,
              width: newPos.width,
              height: newPos.height,
              filter: newPos.filter,
              zIndex: newPos.zIndex,
              opacity: newPos.opacity,
              borderRadius: newPos.borderRadius,
            },
            0,
          );
        }
      }
    });

    // Content fade
    tl.to(
      contents[prev],
      {
        opacity: 0,
        y: 8,
        duration: config.fadeDuration,
        ease: "power2.in",
        onComplete: () => {
          // Zustand zurücksetzen falls Text expandiert war
          const prevWrapper = contents[prev].querySelector(
            ".reviews_text-wrapper",
          );
          const prevBtn = contents[prev].querySelector(".reviews_read-more");
          if (prevWrapper && prevWrapper.classList.contains("is-expanded")) {
            prevWrapper.classList.remove("is-expanded");
            gsap.set(prevWrapper, { height: "auto" });
            if (prevBtn) prevBtn.textContent = "mehr lesen";
          }

          gsap.set(contents[prev], { display: "none", y: 0 });
          gsap.set(contents[current], { display: "flex", opacity: 0, y: 8 });
        },
      },
      0,
    );
    tl.to(
      contents[current],
      {
        opacity: 1,
        y: 0,
        duration: config.fadeDuration,
        ease: "power2.out",
      },
      config.fadeDuration + 0.05,
    );
    // Nach jedem Slide-Wechsel Read More Buttons neu prüfen
    tl.call(
      () => {
        document.querySelectorAll(".reviews_read-more").forEach((btn) => {
          const wrapper = btn
            .closest(".reviews_content-wrapper")
            .querySelector(".reviews_text-wrapper");
          if (wrapper.scrollHeight > wrapper.clientHeight) {
            gsap.set(btn, { display: "inline-block" });
          } else {
            gsap.set(btn, { display: "none" });
          }
        });
      },
      null,
      config.fadeDuration + 0.4,
    );
    tl.call(() => updatePointerEvents(), null, config.duration);
  };

  // --- Events ---
  btnNext?.addEventListener("click", () => goTo(current + 1, 1));
  btnPrev?.addEventListener("click", () => goTo(current - 1, -1));
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => goTo(i, i < current ? -1 : 1)),
  );

  // --- damit ich den aktiven Slide ausklammern kann, wenn ich den Cursor animiere
  slides.forEach((slide, i) => {
    if (i === current) {
      slide.setAttribute("data-active", "true");
    } else {
      slide.removeAttribute("data-active");
    }
  });

  // Swipe (direction wird aus delta berechnet)
  let touchStartX = 0;
  mask?.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  mask?.addEventListener(
    "touchend",
    (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) < config.swipeThreshold) return;
      delta > 0
        ? goTo(current - 1, -1) // swipe links = prev
        : goTo(current + 1, 1); // swipe rechts = next
    },
    { passive: true },
  );

  initReadMore();

  initSlides();
};

reviewsSlider();

// Nach vollständigem Laden prüfen damit scrollHeight korrekt ist
window.addEventListener("load", () => {
  document.querySelectorAll(".reviews_read-more").forEach((btn) => {
    const wrapper = btn
      .closest(".reviews_content-wrapper")
      .querySelector(".reviews_text-wrapper");
    const isTruncated = wrapper.scrollHeight > wrapper.clientHeight;
    gsap.set(btn, { display: isTruncated ? "inline-block" : "none" });
  });
});
