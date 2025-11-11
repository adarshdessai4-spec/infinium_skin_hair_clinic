const initHairTestFlow = () => {
  const panels = Array.from(document.querySelectorAll('[data-step-panel]'));
  if (!panels.length) {
    return;
  }

  const progressFill = document.querySelector('[data-progress-fill]');
  const progressValue = document.querySelector('[data-progress-value]');
  const prevButton = document.querySelector('[data-test-prev]');
  const steps = Array.from(document.querySelectorAll('.test-step'));
  const panelMeta = [
    { progress: 0, stepIndex: 0 },
    { progress: 8, stepIndex: 0 },
    { progress: 12, stepIndex: 0 },
    { progress: 24, stepIndex: 1 },
    { progress: 28, stepIndex: 1 },
    { progress: 33, stepIndex: 1 },
    { progress: 44, stepIndex: 1 },
    { progress: 72, stepIndex: 2 },
  ];
  let currentStep = 0;

  const updateUI = () => {
    panels.forEach((panel, index) => {
      const isActive = index === currentStep;
      panel.classList.toggle('is-active-panel', isActive);
      panel.hidden = !isActive;
    });

    const targetMeta = panelMeta[currentStep] ?? panelMeta[panelMeta.length - 1];

    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === targetMeta.stepIndex);
    });

    const progress =
      targetMeta.progress ?? Math.round((currentStep / Math.max(panels.length - 1, 1)) * 100);
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    if (progressValue) {
      progressValue.textContent = `${progress}%`;
    }

    if (prevButton) {
      prevButton.disabled = currentStep === 0;
    }
  };

  document.querySelectorAll('[data-test-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (currentStep < panels.length - 1) {
        currentStep += 1;
        updateUI();
      }
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep -= 1;
        updateUI();
      }
    });
  }

  const setupChoiceGroups = () => {
    document.querySelectorAll('[data-choice-next]').forEach((button) => {
      const groupName = button.getAttribute('data-choice-next');
      if (!groupName) {
        return;
      }
      const inputs = Array.from(document.querySelectorAll(`input[name="${groupName}"]`));
      if (!inputs.length) {
        return;
      }

      const updateState = () => {
        const checked = document.querySelector(`input[name="${groupName}"]:checked`);
        inputs.forEach((input) => {
          const card = input.closest('.hair-stage-card, .choice-card, .radio-list__item');
          if (card) {
            card.classList.toggle('is-selected', checked === input);
          }
        });
        button.disabled = !checked;
      };

      inputs.forEach((input) => {
        input.addEventListener('change', updateState);
      });

      updateState();
    });
  };

  setupChoiceGroups();

  updateUI();
};

document.addEventListener('DOMContentLoaded', initHairTestFlow);
