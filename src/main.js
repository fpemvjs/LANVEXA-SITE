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

function setExample(name) {
  const state = examples[name];
  if (!state) return;
  document.querySelectorAll(".example-control").forEach((button) => {
    const active = button.dataset.example === name;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const neighbor = document.querySelector("#neighbor-state");
  neighbor.textContent = state.neighbor[0];
  neighbor.dataset.tone = state.neighbor[1];
  document.querySelector("#switch-name").textContent = state.switchName;
  document.querySelector("#switch-port").textContent = state.port;
  document.querySelector("#switch-protocol").textContent = state.protocol;
  document.querySelector("#switch-time").textContent = state.observed;
  const note = document.querySelector("#neighbor-note");
  note.textContent = state.note;
  note.hidden = !state.note;
  document.querySelector("#check-summary").textContent = state.summary;
  Object.entries(state.tests).forEach(([key, values]) => {
    const row = document.querySelector(`[data-test="${key}"]`);
    row.dataset.tone = values[3];
    const symbol = row.querySelector(".state-symbol");
    symbol.textContent = values[0];
    symbol.setAttribute("aria-label", values[2]);
    row.querySelector("strong").textContent = values[1];
    row.querySelector("em").textContent = values[2];
  });
  const result = document.querySelector("#result-bar");
  result.dataset.tone = state.result[1];
  result.querySelector(".result-icon").textContent = state.result[2];
  document.querySelector("#overall-result").textContent = state.result[0];
  document.querySelector("#demo-status").textContent = state.announcement;
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
