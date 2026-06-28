//#region Cursor
/* *************************** Cursor ******************************** */

if (window.matchMedia("(pointer: fine)").matches) {

  const cursor = document.querySelector(".cursor");
  if (cursor) {

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });

    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });

    // Beim Wiedereintritt in den Browser: Cursor sofort an Maus-Position setzen,
    // damit kein Sprung vom alten Ort zur neuen Position animiert wird.
    document.addEventListener("mouseenter", (e) => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
    });

  }

} // end desktop check
//#endregion
