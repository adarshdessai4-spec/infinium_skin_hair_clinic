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

  const hairStageInputs = document.querySelectorAll('input[name="hair-stage"]');
  const hairStageCards = document.querySelectorAll('.hair-stage-card');
  const hairStageNextButton = document.querySelector('[data-step-panel="3"] [data-test-next]');

  const updateHairStageState = () => {
    const checked = document.querySelector('input[name="hair-stage"]:checked');
    hairStageCards.forEach((card) => {
      card.classList.toggle('is-selected', checked ? card.contains(checked) : false);
    });
    if (hairStageNextButton) {
      hairStageNextButton.disabled = !checked;
    }
  };

  hairStageInputs.forEach((input) => {
    input.addEventListener('change', () => {
      updateHairStageState();
    });
  });

  updateHairStageState();

  updateUI();
};

document.addEventListener('DOMContentLoaded', initHairTestFlow);
