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
    this.container.innerHTML = '<p style="color:#fff;">Casino Finder loaded.</p>';
  }
}

// Auto-init on DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('casino-finder');
  if (container && window.casinoFinderConfig) {
    new CasinoFinder(container, window.casinoFinderConfig);
  }
});
