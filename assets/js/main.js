(function () {
  const overlay = document.getElementById('menuOverlay');
  const menuButton = document.querySelector('.nav-icon--menu');
  const closeButton = document.querySelector('.menu-overlay__close');

  if (!overlay || !menuButton || !closeButton) {
    return;
  }

  const toggleMenu = (forceState) => {
    const isOpen = overlay.classList.contains('is-open');
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

    overlay.classList.toggle('is-open', shouldOpen);
    overlay.setAttribute('aria-hidden', (!shouldOpen).toString());
    document.body.classList.toggle('menu-open', shouldOpen);
    menuButton.setAttribute('aria-expanded', shouldOpen.toString());

    if (shouldOpen) {
      closeButton.focus();
    } else {
      menuButton.focus();
    }
  };

  menuButton.addEventListener('click', () => toggleMenu());
  closeButton.addEventListener('click', () => toggleMenu(false));
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      toggleMenu(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      toggleMenu(false);
    }
  });
})();
