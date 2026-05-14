//#region Footer Form
/* ************************* Footer Form ****************************** */

const formWrapper = document.querySelector('.footer_form-wrapper');
const formTab = document.querySelector('.form_tab');

// Tab: togglet das Form, stoppt Bubbling zum Rest der Seite
formTab?.addEventListener('click', (e) => {
  e.stopPropagation();
  formWrapper.classList.toggle('is-closed');
});

// Klicks innerhalb des Form-Wrappers nicht nach oben weitergeben
// (verhindert ungewolltes Schliessen beim Tippen, Klicken usw.)
formWrapper?.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Klick irgendwo sonst auf der Seite → Form schliessen
document.addEventListener('click', () => {
  if (formWrapper && !formWrapper.classList.contains('is-closed')) {
    formWrapper.classList.add('is-closed');
  }
});

//#endregion
