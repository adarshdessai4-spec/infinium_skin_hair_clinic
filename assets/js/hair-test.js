const initHairTestFlow = () => {
  const panels = Array.from(document.querySelectorAll('[data-step-panel]'));
  if (!panels.length) {
    return;
  }

  const progressFill = document.querySelector('[data-progress-fill]');
  const progressValue = document.querySelector('[data-progress-value]');
  const prevButton = document.querySelector('[data-test-prev]');
  const steps = Array.from(document.querySelectorAll('.test-step'));
  const progressPoints = [0, 8];
  let currentStep = 0;

  const updateUI = () => {
    panels.forEach((panel, index) => {
      const isActive = index === currentStep;
      panel.classList.toggle('is-active-panel', isActive);
      panel.hidden = !isActive;
    });

    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === currentStep);
    });

    const progress = progressPoints[currentStep] ?? Math.round((currentStep / (panels.length - 1)) * 100);
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

  updateUI();
};

document.addEventListener('DOMContentLoaded', initHairTestFlow);
