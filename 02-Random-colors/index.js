const colorSwatch = document.querySelector("#colorSwatch");
const hexValue = document.querySelector("#hexValue");
const colorMood = document.querySelector("#colorMood");
const generateButton = document.querySelector("#generateButton");
const copyButton = document.querySelector("#copyButton");
const copyLabel = document.querySelector("#copyLabel");
const statusMessage = document.querySelector("#statusMessage");
const historyGrid = document.querySelector("#historyGrid");
const historyCount = document.querySelector("#historyCount");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const emptyState = document.querySelector("#emptyState");

const STORAGE_KEY = "colorcraft-history-v1";
const MAX_HISTORY = 10;
const moodNames = [
  "Violet dream", "Ocean breeze", "Citrus pop", "Soft rose",
  "Midnight blue", "Fresh mint", "Golden hour", "Electric energy",
  "Berry glow", "Calm skies", "Spring bloom", "Neon pulse"
];

let currentColor = "#8B5CF6";
let history = loadHistory();

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved)
      ? saved.filter((color) => /^#[0-9A-F]{6}$/i.test(color)).slice(0, MAX_HISTORY)
      : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // The generator still works if browser storage is unavailable.
  }
}

function randomHex() {
  return "#" + Math.floor(Math.random() * 0x1000000)
    .toString(16).padStart(6, "0").toUpperCase();
}

function pickMood() {
  return moodNames[Math.floor(Math.random() * moodNames.length)];
}

function setColor(color, addToHistory = true) {
  currentColor = color.toUpperCase();
  colorSwatch.style.backgroundColor = currentColor;
  hexValue.textContent = currentColor;
  colorMood.textContent = pickMood();
  statusMessage.textContent = `${currentColor} is ready to use.`;
  copyLabel.textContent = "Copy HEX";

  if (addToHistory) {
    history = [currentColor, ...history.filter((item) => item !== currentColor)]
      .slice(0, MAX_HISTORY);
    saveHistory();
    renderHistory();
  }
}

function renderHistory() {
  historyGrid.replaceChildren();
  historyCount.textContent = String(history.length);
  emptyState.hidden = history.length > 0;
  historyGrid.hidden = history.length === 0;

  history.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.setAttribute("aria-label", `Preview color ${color}`);

    const swatch = document.createElement("span");
    swatch.className = "history-swatch";
    swatch.style.backgroundColor = color;

    const meta = document.createElement("span");
    meta.className = "history-meta";

    const hex = document.createElement("span");
    hex.className = "history-hex";
    hex.textContent = color;

    const copyHint = document.createElement("span");
    copyHint.className = "history-copy";
    copyHint.textContent = "↗";

    meta.append(hex, copyHint);
    button.append(swatch, meta);
    button.addEventListener("click", () => setColor(color, false));
    historyGrid.append(button);
  });
}

function generateColor() {
  let nextColor = randomHex();
  while (history.length > 1 && nextColor === currentColor) {
    nextColor = randomHex();
  }
  setColor(nextColor);
}

async function copyCurrentColor() {
  try {
    await navigator.clipboard.writeText(currentColor);
    copyLabel.textContent = "Copied!";
    statusMessage.textContent = `${currentColor} copied to clipboard.`;
  } catch {
    // Fallback for browsers where Clipboard API is unavailable.
    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = currentColor;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.append(temporaryInput);
    temporaryInput.select();
    const copied = document.execCommand("copy");
    temporaryInput.remove();
    copyLabel.textContent = copied ? "Copied!" : "Select HEX";
    statusMessage.textContent = copied
      ? `${currentColor} copied to clipboard.`
      : "Copy isn't available here; select the HEX value manually.";
  }
}

generateButton.addEventListener("click", generateColor);
colorSwatch.addEventListener("click", generateColor);
copyButton.addEventListener("click", copyCurrentColor);

clearHistoryButton.addEventListener("click", () => {
  history = [];
  saveHistory();
  renderHistory();
  statusMessage.textContent = "Your color history has been cleared.";
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.code === "Space" && !event.repeat && !isTyping) {
    event.preventDefault();
    generateColor();
  }
});

setColor(currentColor, false);
renderHistory();
