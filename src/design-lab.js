const runButtons = document.querySelectorAll("[data-lab-run]");
const path = document.querySelector(".lab-path-horizontal");
const workbench = document.querySelector(".lab-workbench");
let running = false;

runButtons.forEach((button) => button.addEventListener("click", () => {
  if (running) return;
  running = true;
  workbench.classList.add("is-active");
  path.classList.remove("is-resolving");
  setTimeout(() => path.classList.add("is-resolving"), 120);
  setTimeout(() => { workbench.classList.remove("is-active"); running = false; }, 1900);
}));
