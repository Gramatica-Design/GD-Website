//#region Cursor
/* *************************** Cursor ******************************** */

gsap.set(".cursor", { xPercent: -50, yPercent: -50 });

let xTo = gsap.quickTo(".cursor", "x", { duration: 0.3, ease: "power3" });
let yTo = gsap.quickTo(".cursor", "y", { duration: 0.3, ease: "power3" });

window.addEventListener("mousemove", e => {
  xTo(e.clientX);
  yTo(e.clientY);
});
//#endregion
