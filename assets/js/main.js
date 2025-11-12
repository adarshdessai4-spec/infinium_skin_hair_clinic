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
        const target = event.target.closest('button[data-link]');
        if (target) {
          setDropdownState(false);
          const href = target.getAttribute('data-link');
          if (href && href !== '#') {
            window.location.href = href;
          }
        }
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

  const moneyBackExit = document.querySelector('.money-back__exit');
  if (moneyBackExit) {
    moneyBackExit.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  const eligibilityTrigger = document.querySelector('[data-eligibility-trigger]');
  const eligibilityModal = document.getElementById('eligibilityModal');

  if (eligibilityTrigger && eligibilityModal) {
    const closeButtons = eligibilityModal.querySelectorAll('[data-eligibility-close]');
    const overlay = eligibilityModal.querySelector('.eligibility-modal__overlay');

    const setModalState = (open) => {
      eligibilityModal.classList.toggle('is-open', open);
      eligibilityModal.setAttribute('aria-hidden', (!open).toString());
      document.body.classList.toggle('modal-open', open);
      if (open) {
        eligibilityModal.querySelector('.eligibility-modal__close').focus();
      } else {
        eligibilityTrigger.focus();
      }
    };

    eligibilityTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      setModalState(true);
    });

    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => setModalState(false));
    });

    overlay?.addEventListener('click', () => setModalState(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && eligibilityModal.classList.contains('is-open')) {
        setModalState(false);
      }
    });
  }
})();
