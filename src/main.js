import {
  safeAnimate,
  safeInView,
  prefersReducedMotion,
  MOTION_TOKENS,
} from "./motion-bridge.js";

const canonicalPassedTests = {
  addressing: ["✓", "10.24.18.117 / DHCP", "PASS", "pass"],
  gateway: ["✓", "10.24.18.1", "PASS", "pass"],
  dns: ["✓", "Name resolved", "PASS", "pass"],
  tcp: ["✓", "Configured target", "PASS", "pass"],
};

const canonicalPassedState = {
  neighbor: ["LLDP DETECTED", "pass"],
  switchName: "sw-access-03.example.net",
  port: "ge-0/0/24",
  protocol: "LLDP",
  observed: "Frame observed",
  note: "",
  summary: "4 OF 4 PASSED",
  result: ["CONFIGURED CONNECTIVITY CHECKS PASSED", "pass", "✓"],
  tests: canonicalPassedTests,
  announcement:
    "Passed example displayed. Four configured connectivity checks passed and an LLDP neighbor advertisement was observed.",
};

let sequenceTimers = [];

function clearHeroSequence() {
  sequenceTimers.forEach(clearTimeout);
  sequenceTimers = [];
  clearDiscoveryPeak();
}

function settleFlowRibbon() {
  const ribbon = document.querySelector(".instrument-flow");
  if (!ribbon) return;
  const nodes = ribbon.querySelectorAll(".flow-node");
  const connectors = ribbon.querySelectorAll("b");
  nodes.forEach((node) => {
    node.classList.remove("is-active", "is-pending");
    node.classList.add("is-complete");
  });
  connectors.forEach((conn) => {
    conn.classList.remove("is-active");
    conn.classList.add("is-complete");
  });
}

function advanceFlowRibbon(stepIndex) {
  const ribbon = document.querySelector(".instrument-flow");
  if (!ribbon) return;
  const nodes = ribbon.querySelectorAll(".flow-node");
  const connectors = ribbon.querySelectorAll("b");

  nodes.forEach((node, idx) => {
    node.classList.remove("is-active");
    if (idx < stepIndex) {
      node.classList.remove("is-pending");
      node.classList.add("is-complete");
    } else if (idx === stepIndex) {
      node.classList.remove("is-pending", "is-complete");
      node.classList.add("is-active");
    } else {
      node.classList.remove("is-complete");
      node.classList.add("is-pending");
    }
  });

  connectors.forEach((conn, idx) => {
    conn.classList.remove("is-active");
    if (idx < stepIndex) {
      conn.classList.add("is-complete");
    } else if (idx === stepIndex) {
      conn.classList.add("is-active");
    } else {
      conn.classList.remove("is-complete");
    }
  });
}

function updateTicker(statusState, text) {
  const ticker = document.querySelector("#hero-ticker");
  if (!ticker) return;
  const prefix = ticker.querySelector(".ticker-prefix");
  const textEl = ticker.querySelector("#ticker-text");
  if (prefix) {
    prefix.dataset.state = statusState;
    prefix.textContent = statusState.toUpperCase();
  }
  if (textEl) {
    textEl.textContent = text;
  }
}

function updateDiagnosticRow(row, [symbolChar, textVal, stateLabel, toneVal]) {
  if (!row) return;
  row.dataset.tone = toneVal;
  const symbol = row.querySelector(".state-symbol");
  if (symbol) {
    symbol.textContent = symbolChar;
    symbol.setAttribute("aria-label", stateLabel);
  }
  const strong = row.querySelector("strong");
  if (strong) strong.textContent = textVal;
  const em = row.querySelector("em");
  if (em) em.textContent = stateLabel;
  safeAnimate(row, { opacity: [0.75, 1], x: [3, 0] }, { duration: MOTION_TOKENS.duration.fast });
}

function updateStatusStack(activeIndex) {
  const stack = document.querySelector("#hero-status-stack");
  if (!stack) return;
  const lines = stack.querySelectorAll(".status-stack-line");
  lines.forEach((line, idx) => {
    const glyph = line.querySelector(".status-glyph");
    if (idx < activeIndex) {
      line.dataset.state = "pass";
      if (glyph) glyph.textContent = ">";
    } else if (idx === activeIndex) {
      line.dataset.state = "active";
      if (glyph) glyph.textContent = ">>";
    } else {
      line.dataset.state = "pending";
      if (glyph) glyph.textContent = ">";
    }
  });
}

function settleStatusStack() {
  const stack = document.querySelector("#hero-status-stack");
  if (!stack) return;
  const lines = stack.querySelectorAll(".status-stack-line");
  lines.forEach((line) => {
    line.dataset.state = "pass";
    const glyph = line.querySelector(".status-glyph");
    if (glyph) glyph.textContent = ">";
  });
}

function triggerConduitPulse(progressRatio) {
  const pulse = document.querySelector("#conduit-pulse");
  const trail = document.querySelector("#conduit-trail");
  const targetOffset = Math.round(1000 * (1 - Math.min(1, Math.max(0, progressRatio))));
  if (pulse) {
    pulse.classList.remove("is-settled");
    pulse.classList.add("is-pulsing");
    safeAnimate(pulse, { strokeDashoffset: targetOffset }, { duration: MOTION_TOKENS.duration.fast, easing: MOTION_TOKENS.easing.standard });
  }
  if (trail) {
    trail.classList.remove("is-settled");
    trail.classList.add("is-pulsing");
    safeAnimate(trail, { strokeDashoffset: targetOffset }, { duration: MOTION_TOKENS.duration.fast + 0.05, easing: MOTION_TOKENS.easing.standard });
  }
}

function settleConduit() {
  const pulse = document.querySelector("#conduit-pulse");
  const trail = document.querySelector("#conduit-trail");
  if (pulse) {
    pulse.classList.remove("is-pulsing");
    pulse.classList.add("is-settled");
    pulse.style.strokeDashoffset = "0";
  }
  if (trail) {
    trail.classList.remove("is-pulsing");
    trail.classList.add("is-settled");
    trail.style.strokeDashoffset = "0";
  }
}

function resetConduit() {
  const pulse = document.querySelector("#conduit-pulse");
  const trail = document.querySelector("#conduit-trail");
  if (pulse) {
    pulse.classList.remove("is-pulsing", "is-settled");
    pulse.style.strokeDashoffset = "1000";
  }
  if (trail) {
    trail.classList.remove("is-pulsing", "is-settled");
    trail.style.strokeDashoffset = "1000";
  }
}

function triggerDiscoveryPeak() {
  const conduit = document.querySelector("#hero-signal-conduit");
  const ambientGlow = document.querySelector(".rack-glow-ambient");
  if (conduit) conduit.classList.add("is-discovery-peak");
  if (ambientGlow) ambientGlow.classList.add("is-discovery-peak");
}

function clearDiscoveryPeak() {
  const conduit = document.querySelector("#hero-signal-conduit");
  const ambientGlow = document.querySelector(".rack-glow-ambient");
  if (conduit) conduit.classList.remove("is-discovery-peak");
  if (ambientGlow) ambientGlow.classList.remove("is-discovery-peak");
}

function settleHeroState() {
  clearHeroSequence();
  clearDiscoveryPeak();
  settleFlowRibbon();
  settleStatusStack();
  settleConduit();
  updateTicker("pass", "FIRST-PASS COMPLETE · 4 CHECKS PASSED · NEIGHBOR OBSERVED");
  const state = canonicalPassedState;
  const linkState = document.querySelector("#link-state");
  if (linkState) linkState.textContent = "CONNECTED";
  const linkStatusLight = document.querySelector(".status-light");
  if (linkStatusLight) linkStatusLight.dataset.tone = "pass";
  const linkDetail = document.querySelector(".link-detail");
  if (linkDetail) linkDetail.textContent = "1.0 Gbps negotiated";

  const neighbor = document.querySelector("#neighbor-state");
  if (neighbor) {
    neighbor.textContent = state.neighbor[0];
    neighbor.dataset.tone = state.neighbor[1];
  }
  const switchName = document.querySelector("#switch-name");
  if (switchName) switchName.textContent = state.switchName;
  const switchPort = document.querySelector("#switch-port");
  if (switchPort) switchPort.textContent = state.port;
  const switchProtocol = document.querySelector("#switch-protocol");
  if (switchProtocol) switchProtocol.textContent = state.protocol;
  const switchTime = document.querySelector("#switch-time");
  if (switchTime) switchTime.textContent = state.observed;
  const note = document.querySelector("#neighbor-note");
  if (note) {
    note.textContent = state.note;
    note.hidden = !state.note;
  }
  const checkSummary = document.querySelector("#check-summary");
  if (checkSummary) checkSummary.textContent = state.summary;
  Object.entries(state.tests).forEach(([key, values]) => {
    updateDiagnosticRow(document.querySelector(`[data-test="${key}"]`), values);
  });
  const result = document.querySelector("#result-bar");
  if (result) {
    result.dataset.tone = state.result[1];
    const icon = result.querySelector(".result-icon");
    if (icon) icon.textContent = state.result[2];
    const overall = document.querySelector("#overall-result");
    if (overall) overall.textContent = state.result[0];
    safeAnimate(result, { opacity: [0.85, 1] }, { duration: MOTION_TOKENS.duration.fast });
  }
  const status = document.querySelector("#demo-status");
  if (status) {
    status.textContent = state.announcement;
  }
}
document
  .querySelectorAll(".mobile-nav a")
  .forEach((link) =>
    link.addEventListener("click", () =>
      link.closest("details").removeAttribute("open"),
    ),
  );

document.querySelectorAll(".mobile-nav").forEach((navigation) => {
  const summary = navigation.querySelector("summary");
  if (!summary) return;
  const updateLabel = () => {
    summary.setAttribute(
      "aria-label",
      navigation.open ? "Close navigation" : "Open navigation",
    );
    summary.setAttribute("aria-expanded", String(navigation.open));
  };
  navigation.addEventListener("toggle", updateLabel);
  updateLabel();
});

const betaFormEnabled =
  import.meta.env.VITE_LANVEXA_ENABLE_BETA_FORM === "true";
const betaForm = document.querySelector("#beta-form");
if (betaForm) {
  betaForm.setAttribute("novalidate", "");
  if (!betaFormEnabled) {
    const betaButton = betaForm.querySelector("button");
    betaButton.disabled = true;
    betaButton.textContent = "Beta access unavailable";
    betaForm.querySelector("#form-status").textContent =
      "Beta access is not open in this deployment.";
  }
}
document
  .querySelector("#beta-form")
  ?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.querySelector("#email");
    const button = form.querySelector("button");
    const status = form.querySelector("#form-status");
    if (button.disabled) return;
    form.classList.remove("success", "error");
    status.textContent = "";
    if (!email.validity.valid) {
      form.classList.add("error");
      email.setAttribute("aria-invalid", "true");
      status.textContent = "Enter a valid email address.";
      email.focus();
      return;
    }
    email.removeAttribute("aria-invalid");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    const label = button.innerHTML;
    button.textContent = "Sending…";
    try {
      if (!betaFormEnabled) throw new Error("FORM_NOT_CONFIGURED");
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!response.ok) throw new Error("FORM_SUBMISSION_FAILED");
      window.location.assign(form.action);
    } catch (error) {
      form.classList.add("error");
      status.textContent =
        error.message === "FORM_NOT_CONFIGURED"
          ? "Beta access is not open in this deployment."
          : "The request could not be sent. Check the connection and try again.";
      button.innerHTML = label;
      button.disabled = false;
    } finally {
      button.removeAttribute("aria-busy");
    }
  });

const HERO_SEQUENCE_STEPS = [
  {
    delay: 180,
    node: 0,
    stack: 0,
    conduit: 0.1,
    ticker: ["pass", "INITIALIZING WIRED DIAGNOSTIC PASS…"],
    run(instrument) {
      safeAnimate(".adapter-bar", { opacity: [0.7, 1] }, { duration: MOTION_TOKENS.duration.fast });
    },
  },
  {
    delay: 380,
    node: 0,
    stack: 1,
    conduit: 0.25,
    ticker: ["pass", "LINK DETECTED · 1.0 GBPS NEGOTIATED"],
    run(instrument) {
      const linkState = instrument.querySelector("#link-state");
      const linkStatusLight = instrument.querySelector(".status-light");
      const linkDetail = instrument.querySelector(".link-detail");
      if (linkState) linkState.textContent = "CONNECTED";
      if (linkStatusLight) linkStatusLight.dataset.tone = "pass";
      if (linkDetail) linkDetail.textContent = "1.0 Gbps negotiated";
      safeAnimate(".app-status", { opacity: [0.8, 1] }, { duration: MOTION_TOKENS.duration.fast });
    },
  },
  {
    delay: 620,
    node: 1,
    stack: 2,
    conduit: 0.45,
    test: "addressing",
    values: ["✓", "10.24.18.117 / DHCP", "PASS", "pass"],
    ticker: ["pass", "DHCP ACQUIRED · 10.24.18.117"],
    run(instrument) {
      const checkSummary = instrument.querySelector("#check-summary");
      if (checkSummary) checkSummary.textContent = "1 OF 4 PASSED";
    },
  },
  {
    delay: 880,
    node: 2,
    stack: 3,
    conduit: 0.65,
    test: "gateway",
    values: ["✓", "10.24.18.1", "PASS", "pass"],
    ticker: ["pass", "GATEWAY REACHABLE · 10.24.18.1"],
    run(instrument) {
      const checkSummary = instrument.querySelector("#check-summary");
      if (checkSummary) checkSummary.textContent = "2 OF 4 PASSED";
    },
  },
  {
    delay: 1120,
    node: 3,
    stack: 4,
    conduit: 0.8,
    test: "dns",
    values: ["✓", "Name resolved", "PASS", "pass"],
    ticker: ["pass", "DNS RESOLVED"],
    run(instrument) {
      const checkSummary = instrument.querySelector("#check-summary");
      if (checkSummary) checkSummary.textContent = "3 OF 4 PASSED";
    },
  },
  {
    delay: 1280,
    node: 3,
    test: "tcp",
    values: ["✓", "Configured target", "PASS", "pass"],
    ticker: ["pass", "DNS & TARGET REACHABLE · ALL 4 CHECKS PASSED"],
    run(instrument) {
      const checkSummary = instrument.querySelector("#check-summary");
      if (checkSummary) checkSummary.textContent = "4 OF 4 PASSED";
    },
  },
  {
    delay: 1420,
    node: 4,
    stack: 5,
    conduit: 0.92,
    ticker: ["observed", "PASSIVE DISCOVERY · OBSERVING LLDP/CDP…"],
    run(instrument) {
      safeAnimate(".switch-panel", { opacity: [0.75, 1] }, { duration: MOTION_TOKENS.duration.fast });
    },
  },
  {
    delay: 1680,
    node: 4,
    conduit: 1.0,
    ticker: ["pass", "LLDP OBSERVED · sw-access-03.example.net:ge-0/0/24"],
    run(instrument) {
      triggerDiscoveryPeak();
      const neighborState = instrument.querySelector("#neighbor-state");
      if (neighborState) {
        neighborState.textContent = "LLDP DETECTED";
        neighborState.dataset.tone = "pass";
      }
      const switchName = instrument.querySelector("#switch-name");
      if (switchName) switchName.textContent = "sw-access-03.example.net";
      const switchPort = instrument.querySelector("#switch-port");
      if (switchPort) switchPort.textContent = "ge-0/0/24";
      const switchProtocol = instrument.querySelector("#switch-protocol");
      if (switchProtocol) switchProtocol.textContent = "LLDP";
      const switchTime = instrument.querySelector("#switch-time");
      if (switchTime) switchTime.textContent = "Frame observed";

      safeAnimate(".switch-panel", { opacity: [0.85, 1], x: [3, 0] }, { duration: MOTION_TOKENS.duration.state });
    },
  },
  {
    delay: 1920,
    node: 5,
    ticker: ["pass", "FIRST-PASS COMPLETE · EVIDENCE READY FOR HANDOFF"],
    run(instrument) {
      const resultBar = instrument.querySelector("#result-bar");
      if (resultBar) {
        resultBar.dataset.tone = "pass";
        const icon = resultBar.querySelector(".result-icon");
        if (icon) icon.textContent = "✓";
      }
      const overallResult = instrument.querySelector("#overall-result");
      if (overallResult) overallResult.textContent = "CONFIGURED CONNECTIVITY CHECKS PASSED";
      const status = document.querySelector("#demo-status");
      if (status) {
        status.textContent = "Passed example displayed. Four configured connectivity checks passed and an LLDP neighbor advertisement was observed.";
      }

      safeAnimate(resultBar, { opacity: [0.85, 1] }, { duration: MOTION_TOKENS.duration.state });
    },
  },
  {
    delay: 2050,
    node: 5,
    ticker: ["pass", "FIRST-PASS COMPLETE · 4 CHECKS PASSED · NEIGHBOR OBSERVED"],
    run() {
      clearDiscoveryPeak();
      settleFlowRibbon();
      settleStatusStack();
      settleConduit();
    },
  },
];

function runHeroDiagnosticSequence() {
  if (prefersReducedMotion()) {
    settleHeroState();
    return;
  }

  const hero = document.querySelector(".ledger-hero");
  if (!hero) return;

  const fallback = hero.querySelector("[data-interactive-fallback]");
  if (fallback && fallback.hasAttribute("hidden")) return;

  const instrument = hero.querySelector(".instrument");
  if (!instrument) return;

  clearHeroSequence();

  // Reset flow ribbon to step 0 pending
  advanceFlowRibbon(0);

  // Reset status stack to initial detecting state
  updateStatusStack(0);

  // Reset energy conduit
  resetConduit();

  // Set initial ticker status
  updateTicker("observed", "INITIALIZING WIRED DIAGNOSTIC PASS…");

  // Pre-run diagnostic state on instrument
  const linkState = instrument.querySelector("#link-state");
  const linkStatusLight = instrument.querySelector(".status-light");
  const linkDetail = instrument.querySelector(".link-detail");
  const neighborState = instrument.querySelector("#neighbor-state");
  const switchName = instrument.querySelector("#switch-name");
  const switchPort = instrument.querySelector("#switch-port");
  const switchProtocol = instrument.querySelector("#switch-protocol");
  const switchTime = instrument.querySelector("#switch-time");
  const checkSummary = instrument.querySelector("#check-summary");
  const resultBar = instrument.querySelector("#result-bar");
  const overallResult = instrument.querySelector("#overall-result");
  const resultIcon = resultBar?.querySelector(".result-icon");

  if (linkState) linkState.textContent = "NEGOTIATING…";
  if (linkStatusLight) linkStatusLight.dataset.tone = "unknown";
  if (linkDetail) linkDetail.textContent = "Detecting interface…";
  if (neighborState) {
    neighborState.textContent = "LISTENING…";
    neighborState.dataset.tone = "unknown";
  }
  if (switchName) switchName.textContent = "Awaiting advertisement…";
  if (switchPort) switchPort.textContent = "—";
  if (switchProtocol) switchProtocol.textContent = "—";
  if (switchTime) switchTime.textContent = "Listening";
  if (checkSummary) checkSummary.textContent = "TESTS IN PROGRESS";

  ["addressing", "gateway", "dns", "tcp"].forEach((key) => {
    const row = instrument.querySelector(`[data-test="${key}"]`);
    if (!row) return;
    row.dataset.tone = "unknown";
    const symbol = row.querySelector(".state-symbol");
    if (symbol) {
      symbol.textContent = "…";
      symbol.setAttribute("aria-label", "Testing");
    }
    const strong = row.querySelector("strong");
    if (strong) {
      if (key === "addressing") strong.textContent = "Acquiring lease…";
      else if (key === "gateway") strong.textContent = "Awaiting IP…";
      else if (key === "dns") strong.textContent = "Awaiting gateway…";
      else if (key === "tcp") strong.textContent = "Awaiting DNS…";
    }
    const em = row.querySelector("em");
    if (em) em.textContent = "TESTING";
  });

  if (resultBar) resultBar.dataset.tone = "observed";
  if (resultIcon) resultIcon.textContent = "…";
  if (overallResult) overallResult.textContent = "FIRST-PASS SEQUENCE RUNNING";

  HERO_SEQUENCE_STEPS.forEach((step) => {
    sequenceTimers.push(
      setTimeout(() => {
        if (typeof step.node === "number") {
          advanceFlowRibbon(step.node);
        }
        if (typeof step.stack === "number") {
          updateStatusStack(step.stack);
        }
        if (typeof step.conduit === "number") {
          triggerConduitPulse(step.conduit);
        }
        if (step.ticker) {
          updateTicker(step.ticker[0], step.ticker[1]);
        }
        if (step.test) {
          updateDiagnosticRow(instrument.querySelector(`[data-test="${step.test}"]`), step.values);
        }
        if (step.run) {
          step.run(instrument);
        }
      }, step.delay),
    );
  });
}

function replayHeroSequence() {
  clearHeroSequence();
  if (prefersReducedMotion()) {
    settleHeroState();
    return;
  }
  runHeroDiagnosticSequence();
}

const replayButton = document.querySelector("#hero-replay");
if (replayButton) {
  replayButton.addEventListener("click", replayHeroSequence);
}

// Homepage-only motion: progressive, one-shot reveals with a complete reduced-motion fallback.
const homepageHero = document.querySelector(".ledger-hero");
if (homepageHero) {
  const page = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  page.classList.add("homepage-motion-ready");
  if (reduceMotion.matches) page.classList.add("motion-reduced");

  const reveal = (element, delay = 0) => {
    if (!element) return;
    element.classList.add("motion-reveal");
    element.style.setProperty("--motion-delay", `${delay}ms`);
  };
  [
    [homepageHero.querySelector(".system-masthead") || homepageHero.querySelector(".incident-folio"), 0],
    [homepageHero.querySelector(".editorial-kicker-row") || homepageHero.querySelector(".hero-copy .kicker"), 60],
    [homepageHero.querySelector(".system-hero-editorial h1") || homepageHero.querySelector(".hero-copy h1"), 130],
    [homepageHero.querySelector(".system-hero-editorial .system-hero-lede") || homepageHero.querySelector(".hero-copy .lede"), 210],
    [homepageHero.querySelector(".system-hero-editorial .hero-actions") || homepageHero.querySelector(".hero-copy .hero-actions"), 290],
    [homepageHero.querySelector(".system-hero-visual") || homepageHero.querySelector(".instrument-wrap"), 380],
    [homepageHero.querySelector(".hero-scope-caveat") || homepageHero.querySelector(".hero-caveat"), 460],
  ].forEach(([element, delay]) => reveal(element, delay));

  const sections = [...document.querySelectorAll("main > section:not(.ledger-hero)")];
  sections.forEach((section) => {
    section.classList.add("motion-section");
    [...section.children].forEach((child, index) => reveal(child, Math.min(index * 110, 220)));
  });

  const show = (section) => {
    section.classList.add("is-visible");
    section.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
    if (!reduceMotion.matches) {
      section.classList.add("is-signal-sweeping");
      setTimeout(() => {
        section.classList.remove("is-signal-sweeping");
        section.classList.add("is-signal-settled");
      }, 550);
    } else {
      section.classList.add("is-signal-settled");
    }
  };

  if (reduceMotion.matches) {
    document.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
    sections.forEach((section) => show(section));
  } else {
    requestAnimationFrame(() => {
      homepageHero.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
    });

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries, instance) => {
          entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
            show(entry.target);
            instance.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 })
      : null;
    sections.forEach((section) => observer ? observer.observe(section) : show(section));

    // Viewport-triggered initial Hero playback (runs once per page load)
    const instrument = homepageHero.querySelector(".instrument");
    if (instrument) {
      let heroAutoplayTriggered = false;
      let stopHeroInView = () => {};
      stopHeroInView = safeInView(
        instrument,
        () => {
          if (heroAutoplayTriggered) return;
          heroAutoplayTriggered = true;
          stopHeroInView();
          const autoplayTimer = setTimeout(() => {
            runHeroDiagnosticSequence();
          }, 600);
          sequenceTimers.push(autoplayTimer);
        },
        { amount: 0.25 },
      );
    }
  }

  const updateHeader = () => page.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
