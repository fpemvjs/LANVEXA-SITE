import {
  safeAnimate,
  safeInView,
  prefersReducedMotion,
  MOTION_TOKENS,
} from "./motion-bridge.js";

const commonPass = {
  addressing: ["✓", "10.24.18.117 / DHCP", "PASS", "pass"],
  gateway: ["✓", "10.24.18.1", "PASS", "pass"],
  dns: ["✓", "Name resolved", "PASS", "pass"],
  tcp: ["✓", "Configured target", "PASS", "pass"],
};

const examples = {
  passed: {
    neighbor: ["LLDP DETECTED", "pass"],
    switchName: "sw-access-03.example.net",
    port: "ge-0/0/24",
    protocol: "LLDP",
    observed: "Frame observed",
    note: "",
    summary: "4 OF 4 PASSED",
    result: ["CONFIGURED CONNECTIVITY CHECKS PASSED", "pass", "✓"],
    tests: commonPass,
    announcement:
      "Passed example displayed. Four configured connectivity checks passed and an LLDP neighbor advertisement was observed.",
  },
  partial: {
    neighbor: ["NO ADVERTISEMENT OBSERVED", "unknown"],
    switchName: "Not detected",
    port: "Not detected",
    protocol: "LLDP / CDP",
    observed: "None observed",
    note: "No LLDP/CDP advertisement was observed during this example.",
    summary: "2 PASSED · 1 FAILED · 1 NOT TESTED",
    result: ["PARTIAL RESULT — REVIEW FAILED CHECK", "partial", "!"],
    tests: {
      addressing: commonPass.addressing,
      gateway: commonPass.gateway,
      dns: ["×", "Name not resolved", "FAIL", "fail"],
      tcp: ["—", "Dependent check not run", "NOT TESTED", "unknown"],
    },
    announcement:
      "Partial example displayed. Addressing and gateway passed, DNS failed, TCP was not tested, and no neighbor advertisement was observed.",
  },
  noNeighbor: {
    neighbor: ["NO ADVERTISEMENT OBSERVED", "unknown"],
    switchName: "Not detected",
    port: "Not detected",
    protocol: "LLDP / CDP",
    observed: "None observed",
    note: "Possible reasons include LLDP/CDP being disabled, filtered, delayed, or not advertised toward the endpoint.",
    summary: "4 OF 4 PASSED",
    result: [
      "CONNECTIVITY CHECKS PASSED · NO NEIGHBOR OBSERVED",
      "observed",
      "—",
    ],
    tests: commonPass,
    announcement:
      "No-neighbor example displayed. Four configured connectivity checks passed. No LLDP or CDP advertisement was observed; this is not labeled as a connectivity failure.",
  },
};

let sequenceTimers = [];

function clearHeroSequence() {
  sequenceTimers.forEach(clearTimeout);
  sequenceTimers = [];
}

function settleSignalPath() {
  const path = document.querySelector(".homepage-signal-path");
  if (!path) return;
  const nodes = path.querySelectorAll(".path-node");
  const lines = path.querySelectorAll("b");
  nodes.forEach((node, idx) => {
    node.classList.remove("is-pending", "is-active");
    if (idx === 6) {
      node.classList.add("is-observed");
      node.classList.remove("is-pass");
    } else {
      node.classList.add("is-pass");
      node.classList.remove("is-observed");
    }
  });
  lines.forEach((line) => {
    line.classList.remove("is-active");
    line.classList.add("is-complete");
  });
}

function advanceSignalPath(stepIndex) {
  const path = document.querySelector(".homepage-signal-path");
  if (!path) return;
  const nodes = path.querySelectorAll(".path-node");
  const lines = path.querySelectorAll("b");
  if (stepIndex > 0 && nodes[stepIndex - 1]) {
    nodes[stepIndex - 1].classList.remove("is-active", "is-pending");
    nodes[stepIndex - 1].classList.add(stepIndex - 1 === 6 ? "is-observed" : "is-pass");
    lines[stepIndex - 1]?.classList.replace("is-active", "is-complete");
  }
  if (nodes[stepIndex]) {
    nodes[stepIndex].classList.remove("is-pending");
    if (stepIndex === 7) {
      nodes[stepIndex].classList.add("is-pass");
    } else {
      nodes[stepIndex].classList.add("is-active");
      if (stepIndex === 6) nodes[stepIndex].classList.add("is-observed");
      lines[stepIndex]?.classList.add("is-active");
    }
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

function settleHeroState(name = "passed") {
  setExample(name);
}

function setExample(name) {
  clearHeroSequence();
  settleSignalPath();
  const state = examples[name];
  if (!state) return;
  document.querySelectorAll(".example-control").forEach((button) => {
    const active = button.dataset.example === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
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
  if (status) status.textContent = state.announcement;
}

document
  .querySelectorAll(".example-control")
  .forEach((button) =>
    button.addEventListener("click", () => setExample(button.dataset.example)),
  );
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
    delay: 260,
    node: 1,
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
    delay: 540,
    node: 2,
    test: "addressing",
    values: ["✓", "10.24.18.117 / DHCP", "PASS", "pass"],
  },
  {
    delay: 800,
    node: 3,
    test: "gateway",
    values: ["✓", "10.24.18.1", "PASS", "pass"],
  },
  {
    delay: 1060,
    node: 4,
    test: "dns",
    values: ["✓", "Name resolved", "PASS", "pass"],
  },
  {
    delay: 1300,
    node: 5,
    test: "tcp",
    values: ["✓", "Configured target", "PASS", "pass"],
  },
  {
    delay: 1540,
    node: 6,
    run(instrument) {
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

      safeAnimate(".switch-panel", { opacity: [0.8, 1], x: [3, 0] }, { duration: MOTION_TOKENS.duration.state });
    },
  },
  {
    delay: 1800,
    node: 7,
    run(instrument) {
      const checkSummary = instrument.querySelector("#check-summary");
      if (checkSummary) checkSummary.textContent = "4 OF 4 PASSED";
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
];

function runHeroDiagnosticSequence() {
  if (prefersReducedMotion()) {
    settleSignalPath();
    return;
  }

  const hero = document.querySelector(".ledger-hero");
  if (!hero) return;

  const fallback = hero.querySelector("[data-interactive-fallback]");
  if (fallback && fallback.hasAttribute("hidden")) return;

  const path = hero.querySelector(".homepage-signal-path");
  const instrument = hero.querySelector(".instrument");
  if (!path || !instrument) return;

  clearHeroSequence();

  // Reset path to step 0 (JACK active, nodes 1-7 pending)
  const nodes = path.querySelectorAll(".path-node");
  const lines = path.querySelectorAll("b");
  nodes.forEach((node, idx) => {
    node.classList.remove("is-active", "is-pass", "is-observed");
    node.classList.add(idx === 0 ? "is-active" : "is-pending");
  });
  lines.forEach((line, idx) => {
    line.classList.remove("is-active", "is-complete");
    if (idx === 0) line.classList.add("is-active");
  });

  // Pre-run diagnostic state on instrument
  const linkState = instrument.querySelector("#link-state");
  const linkStatusLight = instrument.querySelector(".status-light");
  const linkDetail = instrument.querySelector(".link-detail");
  const neighborState = instrument.querySelector("#neighbor-state");
  const switchName = instrument.querySelector("#switch-name");
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
    const em = row.querySelector("em");
    if (em) em.textContent = "TESTING";
  });

  if (resultBar) resultBar.dataset.tone = "observed";
  if (resultIcon) resultIcon.textContent = "…";
  if (overallResult) overallResult.textContent = "FIRST-PASS SEQUENCE RUNNING";

  HERO_SEQUENCE_STEPS.forEach((step) => {
    sequenceTimers.push(
      setTimeout(() => {
        advanceSignalPath(step.node);
        if (step.test) {
          updateDiagnosticRow(instrument.querySelector(`[data-test="${step.test}"]`), step.values);
        } else if (step.run) {
          step.run(instrument);
        }
      }, step.delay),
    );
  });
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
    [homepageHero.querySelector(".incident-folio"), 0],
    [homepageHero.querySelector(".hero-copy .kicker"), 60],
    [homepageHero.querySelector(".hero-copy h1"), 130],
    [homepageHero.querySelector(".hero-copy .lede"), 210],
    [homepageHero.querySelector(".hero-copy .hero-actions"), 290],
    [homepageHero.querySelector(".homepage-signal-path"), 360],
    [homepageHero.querySelector(".instrument-wrap"), 420],
    [homepageHero.querySelector(".hero-caveat"), 500],
  ].forEach(([element, delay]) => reveal(element, delay));

  const path = homepageHero.querySelector(".homepage-signal-path");
  path?.classList.add("motion-path");

  const sections = [...document.querySelectorAll("main > section.ledger-stage:not(.ledger-hero)")];
  sections.forEach((section) => {
    section.classList.add("motion-section");
    [...section.children]
      .filter((child) => !child.classList.contains("ledger-coordinate") && !child.classList.contains("homepage-transformation"))
      .forEach((child, index) => reveal(child, Math.min(index * 110, 220)));
  });

  const transformation = document.querySelector(".homepage-transformation");
  const transformStages = transformation ? [...transformation.querySelectorAll(".transform-stage")] : [];
  const transformConnectors = transformation ? [...transformation.querySelectorAll(".transform-connector")] : [];

  const settleTransformation = () => {
    if (!transformation) return;
    transformStages.forEach((stage) => stage.classList.add("is-visible"));
    transformConnectors.forEach((conn) => conn.classList.add("is-active"));
  };

  const show = (section) => {
    section.classList.add("is-visible");
    section.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
  };

  if (reduceMotion.matches) {
    document.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
    path?.classList.add("is-visible");
    sections.forEach((section) => show(section));
    settleTransformation();
    settleSignalPath();
  } else {
    if (transformation) transformation.classList.add("motion-transformation");

    requestAnimationFrame(() => {
      homepageHero.querySelectorAll(".motion-reveal").forEach((element) => element.classList.add("is-visible"));
      path?.classList.add("is-visible");
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

    // Section 03 Scroll Storytelling: Reveal the 4 diagnostic transformation stages sequentially
    if (transformation) {
      let transformationTriggered = false;
      safeInView(
        transformation,
        () => {
          if (transformationTriggered) return;
          transformationTriggered = true;

          const stageDelays = [0, 110, 220, 330];
          transformStages.forEach((stage, idx) => {
            setTimeout(() => {
              stage.classList.add("is-visible");
              if (idx > 0 && transformConnectors[idx - 1]) {
                transformConnectors[idx - 1].classList.add("is-active");
              }
            }, stageDelays[idx] ?? idx * 110);
          });
        },
        { amount: 0.2, margin: "0px 0px -10% 0px" },
      );
    }

    runHeroDiagnosticSequence();
  }

  const updateHeader = () => page.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
