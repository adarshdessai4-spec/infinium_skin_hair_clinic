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

  const loginTriggers = document.querySelectorAll('[data-login-trigger]');
  const loginModal = document.getElementById('loginModal');
  if (loginModal && loginTriggers.length) {
    const closeButtons = loginModal.querySelectorAll('[data-login-close]');
    const overlay = loginModal.querySelector('.login-modal__overlay');
    const errorField = loginModal.querySelector('[data-login-error]');
    let lastLoginTrigger = null;
    const numberStep = loginModal.querySelector('[data-login-step="number"]');
    const otpStep = loginModal.querySelector('[data-login-step="otp"]');
    const phoneInput = loginModal.querySelector('#loginMobile');
    const sendButton = loginModal.querySelector('[data-login-action="send"]');
    const otpInputs = loginModal.querySelectorAll('[data-otp-input]');
    const otpTarget = loginModal.querySelector('[data-otp-target]');
    const resendButton = loginModal.querySelector('[data-login-resend]');
    const countdownLabel = loginModal.querySelector('[data-login-countdown]');
    const verifyButton = loginModal.querySelector('[data-login-action="verify"]');
    const googleButton = loginModal.querySelector('.login-social--google');
    const roleButtons = loginModal.querySelectorAll('[data-login-role]');

    const resolveApiBase = () => {
      if (typeof window.__INF_OTP_API_BASE === 'string') {
        return window.__INF_OTP_API_BASE;
      }
      if (window.location.hostname === 'localhost' && window.location.port !== '4000') {
        return 'http://localhost:4000';
      }
      return '';
    };

    const OTP_API_BASE = resolveApiBase();
    const OTP_SECONDS = 60;
    let otpTimerId = null;
    let currentCountdown = OTP_SECONDS;
    let currentPhoneDisplay = '+91 XXXXXXXX';
    let currentPhoneDigits = '';
    let currentRole = 'user';
    const createSessionPayload = (context = {}) => ({
      role: context.role || currentRole,
      name: context.name || context.email || context.phone || 'Infinium Member',
      email: context.email,
      phone: context.phone,
      avatar: context.avatar,
      provider: context.provider || 'otp',
      loggedInAt: new Date().toISOString(),
    });

    const requestOtpApi = async (path, payload) => {
      const url = OTP_API_BASE ? `${OTP_API_BASE}${path}` : path;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }
      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong. Please try again.');
      }
      return data;
    };

    const setButtonLoading = (button, isLoading, loadingText) => {
      if (!button) return;
      if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent;
      }
      button.disabled = isLoading;
      if (isLoading && loadingText) {
        button.textContent = loadingText;
      } else {
        button.textContent = button.dataset.defaultText;
      }
    };

    const setLoginError = (message = '') => {
      if (!errorField) return;
      errorField.textContent = message;
      errorField.style.visibility = message ? 'visible' : 'hidden';
    };

    const showLoginStep = (step) => {
      numberStep?.classList.toggle('is-active', step === 'number');
      otpStep?.classList.toggle('is-active', step === 'otp');
    };

    const stopOtpTimer = () => {
      if (otpTimerId) {
        clearInterval(otpTimerId);
        otpTimerId = null;
      }
    };

    const resetLoginFlow = () => {
      stopOtpTimer();
      currentCountdown = OTP_SECONDS;
      if (resendButton) {
        resendButton.disabled = true;
        resendButton.setAttribute('disabled', 'true');
      }
      if (countdownLabel) countdownLabel.textContent = OTP_SECONDS.toString();
      phoneInput.value = '';
      otpInputs.forEach((input) => {
        input.value = '';
      });
      currentPhoneDisplay = '+91 XXXXXXXX';
      currentPhoneDigits = '';
      if (otpTarget) otpTarget.textContent = currentPhoneDisplay;
      setLoginError('');
      setButtonLoading(sendButton, false);
      setButtonLoading(verifyButton, false);
      showLoginStep('number');
    };

    const startOtpTimer = () => {
      stopOtpTimer();
      currentCountdown = OTP_SECONDS;
      if (countdownLabel) countdownLabel.textContent = currentCountdown.toString();
      if (resendButton) {
        resendButton.disabled = true;
        resendButton.setAttribute('disabled', 'true');
      }
      otpTimerId = setInterval(() => {
        currentCountdown -= 1;
        if (countdownLabel) countdownLabel.textContent = Math.max(currentCountdown, 0).toString();
        if (currentCountdown <= 0) {
          stopOtpTimer();
          if (resendButton) {
            resendButton.disabled = false;
            resendButton.removeAttribute('disabled');
          }
        }
      }, 1000);
    };

    const startOtpFlow = (phoneDigits) => {
      currentPhoneDigits = phoneDigits;
      currentPhoneDisplay = `+91 ${phoneDigits}`;
      if (otpTarget) otpTarget.textContent = currentPhoneDisplay;
      showLoginStep('otp');
      otpInputs[0]?.focus();
      startOtpTimer();
    };

    const sanitizeDigits = (value) => value.replace(/\D/g, '');

    const collectOtp = () => Array.from(otpInputs).reduce((acc, input) => acc + input.value, '');

    const destinationForRole = (roleOverride) => {
      const role = roleOverride || currentRole;
      return role === 'admin' ? 'admin-portal.html' : 'user-portal.html';
    };

    const handleLoginSuccess = (context = {}) => {
      const payload = createSessionPayload(context);
      try {
        localStorage.setItem('infiniumUserContext', JSON.stringify(payload));
      } catch (_) {
        /* ignore */
      }
      setLoginState(false);
      window.location.href = destinationForRole(payload.role);
    };

    let googlePopup = null;
    const closeGooglePopup = () => {
      if (googlePopup && !googlePopup.closed) {
        googlePopup.close();
      }
      googlePopup = null;
    };

    const setLoginState = (open) => {
      resetLoginFlow();
      loginModal.classList.toggle('is-open', open);
      loginModal.setAttribute('aria-hidden', (!open).toString());
      document.body.classList.toggle('modal-open', open);
      if (open) {
        phoneInput.focus();
      } else {
        lastLoginTrigger?.focus();
      }
    };

    loginTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        lastLoginTrigger = trigger;
        setLoginState(true);
      });
    });

    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => setLoginState(false));
    });

    overlay?.addEventListener('click', () => setLoginState(false));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && loginModal.classList.contains('is-open')) {
        setLoginState(false);
      }
    });

    roleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        roleButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentRole = btn.dataset.loginRole || 'user';
      });
    });

    const handleGoogleMessage = (event) => {
      const data = event.data;
      if (!data || data.source !== 'infinium-google-auth') {
        return;
      }
      closeGooglePopup();
      if (data.error) {
        setLoginError(data.error);
        return;
      }
      setLoginError('');
      handleLoginSuccess({
        name: data.user?.name,
        email: data.user?.email,
        avatar: data.user?.picture,
        provider: 'google',
      });
    };

    window.addEventListener('message', handleGoogleMessage);

    if (sendButton) {
      phoneInput.addEventListener('input', () => {
        if (phoneInput.value.trim().length) {
          phoneInput.classList.remove('is-error');
        }
      });

      sendButton.addEventListener('click', async () => {
        const digits = sanitizeDigits(phoneInput.value);
        if (digits.length < 10) {
          phoneInput.focus();
          phoneInput.classList.add('is-error');
          setLoginError('Please enter a valid 10 digit mobile number.');
          return;
        }
        phoneInput.classList.remove('is-error');
        setLoginError('');
        setButtonLoading(sendButton, true, 'Sending…');
        try {
          await requestOtpApi('/api/send-otp', { phone: digits.slice(-10) });
          startOtpFlow(digits.slice(-10));
        } catch (error) {
          setLoginError(error.message);
        } finally {
          setButtonLoading(sendButton, false);
        }
      });
    }

    otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = sanitizeDigits(input.value).slice(0, 1);
        if (input.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });

    resendButton?.addEventListener('click', async () => {
      if (resendButton.disabled || !currentPhoneDigits) return;
      setLoginError('');
      resendButton.disabled = true;
      resendButton.setAttribute('disabled', 'true');
      try {
        await requestOtpApi('/api/send-otp', { phone: currentPhoneDigits });
        startOtpTimer();
      } catch (error) {
        setLoginError(error.message);
        stopOtpTimer();
        resendButton.disabled = false;
        resendButton.removeAttribute('disabled');
      }
    });

    verifyButton?.addEventListener('click', async () => {
      const code = collectOtp();
      if (code.length < otpInputs.length) {
        otpInputs[0]?.focus();
        setLoginError('Please enter the complete OTP.');
        return;
      }
      if (!currentPhoneDigits) {
        showLoginStep('number');
        setLoginError('Please enter your mobile number first.');
        return;
      }
      setLoginError('');
      setButtonLoading(verifyButton, true, 'Verifying…');
      try {
        await requestOtpApi('/api/verify-otp', { phone: currentPhoneDigits, otp: code });
        const phoneLabel = currentPhoneDigits ? `+91 ${currentPhoneDigits}` : null;
        handleLoginSuccess({
          phone: phoneLabel || undefined,
          name: phoneLabel || undefined,
          provider: 'otp',
        });
      } catch (error) {
        setLoginError(error.message);
      } finally {
        setButtonLoading(verifyButton, false);
      }
    });

    if (googleButton) {
      googleButton.addEventListener('click', async () => {
        try {
          setLoginError('');
          const url = OTP_API_BASE ? `${OTP_API_BASE}/api/auth/google/url` : '/api/auth/google/url';
          const response = await fetch(url);
          const contentType = response.headers.get('content-type') || '';
          const data = contentType.includes('application/json') ? await response.json() : {};
          if (!response.ok || !data?.url) {
            throw new Error(data?.message || 'Unable to start Google login.');
          }
          googlePopup = window.open(
            data.url,
            'infinium-google-login',
            'width=520,height=600'
          );
          if (!googlePopup) {
            throw new Error('Please allow popups to continue with Google login.');
          }
        } catch (error) {
          setLoginError(error.message);
        }
      });
    }
  }

  const productsPanel = document.getElementById('productsPanel');
  const productTriggers = document.querySelectorAll('[data-products-trigger]');
  if (productsPanel && productTriggers.length) {
    const productCloseButtons = productsPanel.querySelectorAll('[data-products-close]');
    const setProductsState = (open) => {
      productsPanel.classList.toggle('is-open', open);
      productsPanel.setAttribute('aria-hidden', (!open).toString());
    };

    productTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        setProductsState(true);
      });
    });

    productCloseButtons.forEach((btn) => {
      btn.addEventListener('click', () => setProductsState(false));
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
