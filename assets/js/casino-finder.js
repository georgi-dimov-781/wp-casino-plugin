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
    this.announcer = document.createElement('div');
    this.announcer.className = 'cf-sr-only';
    this.announcer.setAttribute('aria-live', 'assertive');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.container.parentNode.insertBefore(this.announcer, this.container.nextSibling);

    this.container.addEventListener('click', (e) => this.handleClick(e));
    this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.render();
  }

  esc(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, (c) => map[c]);
  }

  announce(message) {
    this.announcer.textContent = '';
    setTimeout(() => {
      this.announcer.textContent = message;
    }, 50);
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

    const copyBtn = e.target.closest('.cf-card__promo-copy');
    if (copyBtn) {
      this.handleCopyCode(copyBtn.dataset.code, copyBtn);
      return;
    }
  }

  handleCopyCode(code, buttonEl) {
    navigator.clipboard.writeText(code).then(() => {
      const original = buttonEl.innerHTML;
      buttonEl.innerHTML = '&#10003;';
      buttonEl.classList.add('cf-card__promo-copy--copied');
      this.announce('Promo code copied to clipboard');

      setTimeout(() => {
        buttonEl.innerHTML = original;
        buttonEl.classList.remove('cf-card__promo-copy--copied');
      }, 2000);
    });
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

  scrollToTop() {
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  renderStep(stepIndex) {
    const step = this.steps[stepIndex];
    const selectedValue = this.answers[step.id] || null;

    const optionsHtml = step.options.map((opt) => {
      const selected = opt.value === selectedValue ? ' cf-option--selected' : '';
      return `
        <button class="cf-option${selected}"
                type="button"
                data-step="${this.esc(step.id)}"
                data-value="${this.esc(opt.value)}"
                aria-pressed="${opt.value === selectedValue}">
          <span class="cf-option__icon">${this.esc(opt.icon)}</span>
          <span class="cf-option__label">${this.esc(opt.label)}</span>
        </button>
      `;
    }).join('');

    const navHtml = stepIndex > 0
      ? `<div class="cf-step__nav">
          <button class="cf-back-btn" type="button">&larr; Go Back</button>
          <button class="cf-reset-btn" type="button">Start Over</button>
        </div>`
      : '';

    return `
      <div class="cf-step">
        <h2 class="cf-step__question">${this.esc(step.question)}</h2>
        <div class="cf-step__options">
          ${optionsHtml}
        </div>
        ${navHtml}
      </div>
    `;
  }

  renderLoadingScreen() {
    const messages = this.config.loading_messages;

    this.container.innerHTML = `
      ${this.renderProgressBar(true)}
      <div class="cf-loading">
        <div class="cf-loading__spinner"></div>
        <p class="cf-loading__message" aria-live="polite"></p>
      </div>
    `;

    const messageEl = this.container.querySelector('.cf-loading__message');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = prefersReducedMotion ? 200 : 800;

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
    if (!topCasinos.length) {
      this.container.innerHTML = `
        ${this.renderProgressBar(true)}
        <div class="cf-no-results">
          <p class="cf-no-results__message">${this.esc(this.config.no_results_message)}</p>
          <button class="cf-reset-btn" type="button">Start Over</button>
        </div>
      `;
      this.scrollToTop();
      return;
    }

    const intro = this.config.results_intro.replace('{total}', this.casinos.length);
    const pluginUrl = this.config.plugin_url;

    const cardsHtml = topCasinos.map((casino, i) => `
      <div class="cf-result-card" data-rank="${i + 1}">
        <span class="cf-card__rank">${i + 1}</span>

        <div class="cf-card__badge">
          <span class="cf-card__badge-star">&#9733;</span>
          <span class="cf-card__badge-score">${this.esc(casino.rating)}</span>
          <span class="cf-card__badge-max">/ 5</span>
        </div>

        <div class="cf-card__logo">
          <img src="${this.esc(pluginUrl)}assets/images/${this.esc(casino.logo)}"
               alt="${this.esc(casino.name)}"
               loading="lazy"
               width="200"
               height="60">
        </div>

        <div class="cf-card__features">
          <div class="cf-card__feature">
            <span class="cf-card__feature-label">Slot Games</span>
            <span class="cf-card__feature-value">${this.esc(casino.slot_games)}</span>
          </div>
          <div class="cf-card__feature cf-card__feature--bordered">
            <span class="cf-card__feature-label">Packages</span>
            <span class="cf-card__feature-value">${casino.has_packages ? 'YES' : 'NO'}</span>
          </div>
          <div class="cf-card__feature">
            <span class="cf-card__feature-label">VIP</span>
            <span class="cf-card__feature-value">${casino.has_vip ? 'YES' : 'NO'}</span>
          </div>
        </div>

        <hr class="cf-card__divider">

        <a href="${this.esc(casino.review_url)}" class="cf-card__review-link">${this.esc(casino.name)} review</a>

        <p class="cf-card__bonus-text">${this.esc(casino.bonus_text)}</p>

        <div class="cf-card__promo">
          <span class="cf-card__promo-code">${this.esc(casino.promo_code)}</span>
          <button class="cf-card__promo-copy"
                  type="button"
                  data-code="${this.esc(casino.promo_code)}"
                  aria-label="Copy promo code ${this.esc(casino.promo_code)}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        <a href="${this.esc(casino.affiliate_url)}"
           class="cf-card__cta"
           target="_blank"
           rel="noopener noreferrer">
          Play at ${this.esc(casino.name)}
        </a>
      </div>
    `).join('');

    this.container.innerHTML = `
      ${this.renderProgressBar(true)}
      <div class="cf-results">
        <p class="cf-results__intro">${this.esc(intro)}</p>
        <div class="cf-results__grid">
          ${cardsHtml}
        </div>
        <button class="cf-reset-btn" type="button">Start Over</button>
      </div>
    `;
    this.scrollToTop();
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

  renderProgressBar(showResults = false) {
    const totalSteps = this.steps.length + 1;

    const stepsHtml = this.steps.map((step, i) => {
      let state = 'upcoming';
      if (showResults || i < this.currentStep) state = 'completed';
      else if (i === this.currentStep) state = 'active';

      return `
        <div class="cf-progress__step cf-progress__step--${state}">
          <div class="cf-progress__dot">
            ${state === 'completed' ? '<span class="cf-progress__check">&#10003;</span>' : ''}
          </div>
          <span class="cf-progress__label">${this.esc(step.title)}</span>
        </div>
      `;
    }).join('');

    const bestMatchState = showResults ? 'active' : 'upcoming';
    const bestMatchHtml = `
      <div class="cf-progress__step cf-progress__step--${bestMatchState}">
        <div class="cf-progress__dot"></div>
        <span class="cf-progress__label">Best Match</span>
      </div>
    `;

    const currentValue = showResults ? totalSteps : this.currentStep + 1;
    const completedSegments = showResults ? totalSteps - 1 : this.currentStep;
    const progressPercent = (completedSegments / (totalSteps - 1)) * 100;

    return `
      <div class="cf-progress"
           role="progressbar"
           aria-valuenow="${currentValue}"
           aria-valuemin="1"
           aria-valuemax="${totalSteps}"
           style="--progress: ${progressPercent}">
        ${stepsHtml}
        ${bestMatchHtml}
      </div>
    `;
  }
}

// Auto-init on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.casino-finder');
  if (containers.length && window.casinoFinderConfig) {
    containers.forEach((el) => new CasinoFinder(el, window.casinoFinderConfig));
  }
});
