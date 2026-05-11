//#region Magnetic Button
/* ********************** Magnetic Button und Links ****************** */

const targets = document.querySelectorAll('.link_button, .nav_menu_link, [data-magnetic]');

targets.forEach((el) => {
  const isButton = el.classList.contains('link_button');
  const innerText = isButton ? el.querySelector('.button_text') : null;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    gsap.to(el, {
      x: relX * 10,
      y: relY * 10,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    if (innerText) {
      gsap.to(innerText, {
        x: relX * 5,
        y: relY * 5,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  });

  el.addEventListener('mouseleave', () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    });
    if (innerText) {
      gsap.to(innerText, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  });
});
//#endregion
