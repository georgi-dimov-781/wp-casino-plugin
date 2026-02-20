/**
 * Casino Finder — main quiz class.
 */
class CasinoFinder {

  constructor(containerEl, config) {
    this.container = containerEl;
    this.steps = config.steps;
    this.casinos = config.casinos;
    this.config = config;
    this.currentStep = 0;
    this.answers = {};

    this.init();
  }

  init() {
    this.container.addEventListener('click', (e) => this.handleClick(e));
    this.render();
  }

  handleClick(e) {
    // Delegated click handler — implemented in next commits.
  }

  render() {
    this.container.innerHTML =
      this.renderProgressBar() +
      this.renderStep(this.currentStep);
  }

  renderStep(stepIndex) {
    const step = this.steps[stepIndex];
    const selectedValue = this.answers[step.id] || null;

    const optionsHtml = step.options.map((opt) => {
      const selected = opt.value === selectedValue ? ' cf-option--selected' : '';
      return `
        <button class="cf-option${selected}"
                type="button"
                data-step="${step.id}"
                data-value="${opt.value}"
                aria-pressed="${opt.value === selectedValue}">
          <span class="cf-option__icon">${opt.icon}</span>
          <span class="cf-option__label">${opt.label}</span>
        </button>
      `;
    }).join('');

    const backBtn = stepIndex > 0
      ? '<button class="cf-back-btn" type="button">&larr; Go Back</button>'
      : '';

    return `
      <div class="cf-step">
        <h2 class="cf-step__question">${step.question}</h2>
        <div class="cf-step__options">
          ${optionsHtml}
        </div>
        <div class="cf-step__nav">
          ${backBtn}
          <button class="cf-reset-btn" type="button">Start Over</button>
        </div>
      </div>
    `;
  }

  renderProgressBar() {
    const totalSteps = this.steps.length;

    const stepsHtml = this.steps.map((step, i) => {
      let state = 'upcoming';
      if (i < this.currentStep) state = 'completed';
      else if (i === this.currentStep) state = 'active';

      return `
        <div class="cf-progress__step cf-progress__step--${state}">
          <div class="cf-progress__dot">
            ${state === 'completed' ? '<span class="cf-progress__check">&#10003;</span>' : ''}
          </div>
          <span class="cf-progress__label">${step.title}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="cf-progress"
           role="progressbar"
           aria-valuenow="${this.currentStep + 1}"
           aria-valuemin="1"
           aria-valuemax="${totalSteps}">
        ${stepsHtml}
      </div>
    `;
  }
}

// Auto-init on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('casino-finder');
  if (container && window.casinoFinderConfig) {
    new CasinoFinder(container, window.casinoFinderConfig);
  }
});
