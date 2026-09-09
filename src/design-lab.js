// LANVEXA V2 Design Lab Switcher & Interaction Controller
// Strictly compliant with verified claim boundaries.

function initDesignLab() {
  const tabs = document.querySelectorAll('.lab-pill-btn');
  const panels = document.querySelectorAll('.v2-proto-container');

  function switchTab(targetId) {
    if (!targetId) return;

    // Normalize id
    if (!targetId.startsWith('proto-')) {
      targetId = `proto-${targetId.toLowerCase()}`;
    }

    const activePanel = document.getElementById(targetId);
    if (!activePanel) return;

    tabs.forEach((tab) => {
      const matches = tab.getAttribute('data-target') === targetId;
      tab.classList.toggle('is-active', matches);
      tab.setAttribute('aria-selected', matches ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === targetId);
    });

    // Update URL hash without jumping
    if (history.replaceState) {
      history.replaceState(null, '', `#${targetId}`);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.getAttribute('data-target');
      switchTab(targetId);
    });
  });

  // Replay buttons simulation
  const replayButtons = document.querySelectorAll('[data-lab-run], .telemetry-run-btn, .action-btn');
  replayButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parentContainer = btn.closest('.v2-proto-container');
      if (!parentContainer) return;

      const animatedElements = parentContainer.querySelectorAll('.spec-node, .test-record-item, .bench-row');
      animatedElements.forEach((el) => {
        el.style.opacity = '0.4';
        el.style.transition = 'opacity 0.2s ease';
      });

      setTimeout(() => {
        animatedElements.forEach((el, index) => {
          setTimeout(() => {
            el.style.opacity = '1';
          }, index * 80);
        });
      }, 250);
    });
  });

  // Initialize from hash or query param if available
  const urlParams = new URLSearchParams(window.location.search);
  const variantParam = urlParams.get('variant') || urlParams.get('proto');
  const hash = window.location.hash.replace('#', '');

  if (variantParam) {
    switchTab(variantParam);
  } else if (hash && (hash === 'proto-b' || hash === 'proto-flagship' || hash === 'proto-d' || hash === 'proto-e')) {
    switchTab(hash);
  } else {
    // Default to unified Flagship: Field Evidence System
    switchTab('proto-flagship');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesignLab);
} else {
  initDesignLab();
}

