(function () {
  const overlay = document.getElementById('menuOverlay');
  const menuButton = document.querySelector('.nav-icon--menu');
  const closeButton = document.querySelector('.menu-overlay__close');

  if (overlay && menuButton && closeButton) {
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
  }

  const navDropdown = document.querySelector('.nav-dropdown');
  if (navDropdown) {
    const dropdownButton = navDropdown.querySelector('.nav-cta--dropdown');
    const dropdownMenu = navDropdown.querySelector('.nav-dropdown__menu');

    if (dropdownButton && dropdownMenu) {
      const setDropdownState = (open) => {
        navDropdown.classList.toggle('is-open', open);
        dropdownButton.setAttribute('aria-expanded', open.toString());
      };

      dropdownButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = navDropdown.classList.contains('is-open');
        setDropdownState(!isOpen);
      });

      dropdownMenu.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      document.addEventListener('click', () => {
        setDropdownState(false);
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          setDropdownState(false);
        }
      });
    }
  }
})();
