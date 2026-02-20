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
    this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.render();
  }

  handleKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;

    const option = e.target.closest('.cf-option');
    if (option) {
      e.preventDefault();
      option.click();
    }
  }

  handleClick(e) {
    const option = e.target.closest('.cf-option');
    if (option) {
      this.handleOptionClick(option.dataset.step, option.dataset.value);
      return;
    }

    if (e.target.closest('.cf-back-btn')) {
      this.goToPreviousStep();
      return;
    }

    if (e.target.closest('.cf-reset-btn')) {
      this.reset();
      return;
    }
  }

  handleOptionClick(stepId, value) {
    this.answers[stepId] = value;

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.renderLoadingScreen();
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }

  reset() {
    this.currentStep = 0;
    this.answers = {};
    this.render();
  }

  render() {
    this.container.innerHTML =
      this.renderProgressBar() +
      this.renderStep(this.currentStep);
    this.setFocus();
  }

  setFocus() {
    const firstOption = this.container.querySelector('.cf-option');
    if (firstOption) {
      firstOption.focus();
    }
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

  renderLoadingScreen() {
    const messages = this.config.loading_messages;

    this.container.innerHTML = `
      <div class="cf-loading">
        <div class="cf-loading__spinner"></div>
        <p class="cf-loading__message" aria-live="polite"></p>
      </div>
    `;

    const messageEl = this.container.querySelector('.cf-loading__message');
    const delay = 800;

    messages.forEach((msg, i) => {
      setTimeout(() => {
        messageEl.textContent = msg;
      }, i * delay);
    });

    setTimeout(() => {
      const results = this.calculateResults();
      this.renderResults(results);
    }, messages.length * delay);
  }

  renderResults(topCasinos) {
    // Results rendering — implemented in a future commit.
    this.container.innerHTML = '<p style="color:#fff;">Results will appear here.</p>';
  }

  calculateResults() {
    const WEIGHTS = {
      'casino-type': 40,
      'game': 25,
      'banking': 20,
      'payout': 15,
    };

    const PAYOUT_SCALE = ['instant', '1-2-days', 'up-to-1-week'];

    const scored = this.casinos.map((casino) => {
      let score = 0;

      // Type match: user value in casino's types array.
      const userType = this.answers['casino-type'];
      if (userType && casino.types.includes(userType)) {
        score += WEIGHTS['casino-type'];
      }

      // Game match: user value in casino's games array.
      const userGame = this.answers['game'];
      if (userGame && casino.games.includes(userGame)) {
        score += WEIGHTS['game'];
      }

      // Banking match: user value in casino's banking array.
      const userBanking = this.answers['banking'];
      if (userBanking && casino.banking.includes(userBanking)) {
        score += WEIGHTS['banking'];
      }

      // Payout speed: full points if casino is equal or faster, half if one step slower, 0 otherwise.
      const userPayout = this.answers['payout'];
      if (userPayout) {
        const userIdx = PAYOUT_SCALE.indexOf(userPayout);
        const casinoIdx = PAYOUT_SCALE.indexOf(casino.payout_speed);
        const diff = casinoIdx - userIdx;

        if (diff <= 0) {
          score += WEIGHTS['payout'];
        } else if (diff === 1) {
          score += WEIGHTS['payout'] / 2;
        }
      }

      return { casino, score };
    });

    // Sort by score desc, tiebreak by rating desc.
    scored.sort((a, b) => b.score - a.score || b.casino.rating - a.casino.rating);

    // Return top 3 with score > 0.
    return scored
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map((item) => item.casino);
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
