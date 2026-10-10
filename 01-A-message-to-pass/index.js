
/* =========================================
   MessageDrop — Interactive Chat
========================================= */

// 1. Select HTML elements
const form = document.querySelector("#message-form");
const input = document.querySelector("#message-input");
const error = document.querySelector(".error");
const chatMessages = document.querySelector("#chat-messages");
const emptyChat = document.querySelector("#empty-chat");
const charCount = document.querySelector("#char-count");
const sendBtn = document.querySelector("#send-btn");
const chatStatus = document.querySelector("#chat-status");
const clearBtn = document.querySelector("#clear-chat");
const emojiToggle = document.querySelector("#emoji-toggle");
const emojiMenu = document.querySelector("#emoji-menu");

// 2. Store messages in an array
const STORAGE_KEY = "messagedrop-chat-v1";
const MAX_LENGTH = 250;

let messages = loadMessages();


// 3. Safely load saved messages
function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    // Validate saved data before rendering it.
    return saved.filter((item) =>
      item &&
      typeof item.text === "string" &&
      typeof item.time === "string" &&
      Number.isFinite(Date.parse(item.time)) &&
      item.text.trim().length > 0 &&
      item.text.length <= MAX_LENGTH
    );
  } catch {
    return [];
  }
}


// 4. Save messages in this browser
function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    return true;
  } catch {
    showStatus("Unable to save messages in this browser.");
    return false;
  }
}


// 5. Display temporary feedback
let statusTimer;

function showStatus(text) {
  chatStatus.textContent = text;

  clearTimeout(statusTimer);

  statusTimer = setTimeout(() => {
    chatStatus.textContent = "";
  }, 3000);
}


// 6. Format message timestamps
function formatTime(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateString));
}


// 7. Create a single message bubble
function createMessageBubble(item) {
  const bubble = document.createElement("article");
  bubble.className = "chat-bubble";

  // Create the message text safely.
  const text = document.createElement("p");
  text.className = "bubble-text";
  text.textContent = item.text;

  // Add time and a local-save indicator.
  const meta = document.createElement("div");
  meta.className = "bubble-meta";

  const time = document.createElement("time");
  time.dateTime = item.time;
  time.textContent = formatTime(item.time);

  const indicator = document.createElement("span");
  indicator.className = "message-indicator";
  indicator.textContent = "✓";
  indicator.setAttribute("aria-label", "Saved in this browser");

  meta.append(time, indicator);
  bubble.append(text, meta);

  return bubble;
}


// 8. Render the conversation
function renderMessages() {
  chatMessages.replaceChildren();

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-chat";
    empty.textContent = "No messages yet. Send your first message!";

    chatMessages.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  messages.forEach((item) => {
    fragment.append(createMessageBubble(item));
  });

  chatMessages.append(fragment);

  // Scroll to the latest message.
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


// 9. Update the character counter
function updateCharacterCount() {
  const length = input.value.length;

  charCount.textContent = `${length}/${MAX_LENGTH}`;

  charCount.classList.toggle(
    "counter-warning",
    length >= MAX_LENGTH * 0.9
  );

  // Keep the button state in sync with the input.
  sendBtn.disabled = input.value.trim() === "";
}


// 10. Handle form submission
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  // Prevent empty messages.
  if (!text) {
    error.hidden = false;
    input.focus();
    return;
  }

  // Enforce the character limit.
  if (text.length > MAX_LENGTH) {
    error.textContent = `Your message must be ${MAX_LENGTH} characters or fewer.`;
    error.hidden = false;
    input.focus();
    return;
  }

  // Create a new message.
  const newMessage = {
    id: crypto.randomUUID(),
    text: text,
    time: new Date().toISOString()
  };

  // Add it to the conversation.
  messages.push(newMessage);

  // Save and update the interface.
  const saved = saveMessages();

  renderMessages();

  input.value = "";
  error.hidden = true;
  updateCharacterCount();
  input.focus();

  showStatus(
    saved
      ? "Message added to your conversation."
      : "Message added temporarily; it could not be saved."
  );
});


// 11. Hide the error while the user types
input.addEventListener("input", () => {
  error.hidden = true;
  updateCharacterCount();
});


// 12. Enter sends; Shift + Enter adds a new line
input.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.isComposing
  ) {
    event.preventDefault();

    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    }
  }
});


// 13. Toggle the emoji menu
emojiToggle.addEventListener("click", () => {
  const opening = emojiMenu.hidden;

  emojiMenu.hidden = !opening;
  emojiToggle.setAttribute("aria-expanded", String(opening));
});


// 14. Insert an emoji at the cursor
emojiMenu.addEventListener("click", (event) => {
  const button = event.target.closest(".emoji-option");

  if (!button) {
    return;
  }

  const start = input.selectionStart;
  const end = input.selectionEnd;
  const emoji = button.textContent;
  const current = input.value;

  const updated =
    current.slice(0, start) +
    emoji +
    current.slice(end);

  // Do not exceed the character limit.
  if (updated.length > MAX_LENGTH) {
    showStatus("Your message has reached the character limit.");
    return;
  }

  input.value = updated;

  const newCursor = start + emoji.length;

  input.focus();
  input.setSelectionRange(newCursor, newCursor);

  updateCharacterCount();

  emojiMenu.hidden = true;
  emojiToggle.setAttribute("aria-expanded", "false");
});


// 15. Close the emoji menu when clicking elsewhere
document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".emoji-picker") &&
    !emojiMenu.hidden
  ) {
    emojiMenu.hidden = true;
    emojiToggle.setAttribute("aria-expanded", "false");
  }
});


// 16. Clear the conversation
clearBtn.addEventListener("click", () => {
  if (messages.length === 0) {
    showStatus("Your conversation is already empty.");
    return;
  }

  const confirmed = window.confirm(
    "Delete all messages saved in this browser?"
  );

  if (!confirmed) {
    return;
  }

  const previousMessages = messages;

  messages = [];

  if (!saveMessages()) {
    messages = previousMessages;
    return;
  }

  renderMessages();
  showStatus("Your conversation has been cleared.");
});


// 17. Restore the conversation on page load
renderMessages();
updateCharacterCount();
