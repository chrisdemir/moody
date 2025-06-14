const saveBtn = document.getElementById("save-btn");
const noteInput = document.getElementById("note");
const entryList = document.getElementById("entry-list");
const trashList = document.getElementById("trash-list");
const trashToggle = document.getElementById("trash-toggle");
const emotionLabel = document.getElementById("emotion-label");

let selectedEmotion = null;

const emotionNameMap = {
  HAPPY: "HAPPY",
  SAD: "SAD",
  ANGRY: "ANGRY",
  QUIET: "CALM",
  TIRED: "TIRED",
  CHEERFUL: "CHEERFUL",
  FRUSTRATED: "FRUSTRATED",
  MELANCHOLIC: "MELANCHOLIC"
};

// === Emotion auswählen ===
document.querySelectorAll(".emotion-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedEmotion = btn.dataset.emotion;
    document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    emotionLabel.textContent = emotionNameMap[selectedEmotion] || selectedEmotion;
  });
});

// === Eintrag speichern ===
saveBtn.addEventListener("click", () => {
  const note = noteInput.value.trim();
  if (!selectedEmotion || !note) {
    alert("Please select an emotion and enter a note!");
    return;
  }

  const entry = {
    emotion: selectedEmotion,
    text: note,
    timestamp: new Date().toISOString()
  };

  saveEntry(entry);
  displayEntries();

  noteInput.value = "";
  selectedEmotion = null;
  emotionLabel.textContent = "Your Emotion";
  document.querySelectorAll(".emotion-btn").forEach(b => b.classList.remove("active"));
});

// === Speicherfunktionen ===
function saveEntry(entry) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  entries.unshift(entry);
  localStorage.setItem("entries", JSON.stringify(entries));
}

function deleteEntry(index) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  const deletedEntries = JSON.parse(localStorage.getItem("deletedEntries") || "[]");
  const [removed] = entries.splice(index, 1);
  deletedEntries.unshift(removed);
  localStorage.setItem("entries", JSON.stringify(entries));
  localStorage.setItem("deletedEntries", JSON.stringify(deletedEntries));
  displayEntries();
}

function restoreEntry(index) {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  const deletedEntries = JSON.parse(localStorage.getItem("deletedEntries") || "[]");
  const [restored] = deletedEntries.splice(index, 1);
  if (!restored) return;

  entries.push(restored);
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  localStorage.setItem("entries", JSON.stringify(entries));
  localStorage.setItem("deletedEntries", JSON.stringify(deletedEntries));

  displayEntries();
  displayTrash();
}

// === Anzeige aktiver Einträge ===
function displayEntries() {
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");
  entryList.innerHTML = "";

  entries.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="entry-meta-line">
        <span class="entry-date">${date.toLocaleDateString()}</span>
        <span class="entry-time">${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="entry-main-line">
        <span class="entry-emotion">${emotionNameMap[entry.emotion] || entry.emotion}</span>
        <span class="entry-text">${entry.text}</span>
      </div>
    `;

    let startX = 0;
    let endX = 0;

    li.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: false });

    li.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) {
        li.classList.add("swipe-out");
        li.addEventListener("transitionend", () => {
          deleteEntry(index);
        }, { once: true });
      }
    }, { passive: false });

    entryList.appendChild(li);
  });
}

// === Anzeige Papierkorb ===
function displayTrash() {
  const deletedEntries = JSON.parse(localStorage.getItem("deletedEntries") || "[]");
  trashList.innerHTML = "";

  deletedEntries.forEach((entry, index) => {
    const date = new Date(entry.timestamp);
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="entry-meta-line">
        <span class="entry-date">${date.toLocaleDateString()}</span>
        <span class="entry-time">${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="entry-main-line">
        <span class="entry-emotion">${emotionNameMap[entry.emotion] || entry.emotion}</span>
        <span class="entry-text">${entry.text}</span>
      </div>
    `;

    let startX = 0;
    let endX = 0;

    li.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: false });

    li.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) {
        li.classList.add("swipe-out");
        li.addEventListener("transitionend", () => {
          restoreEntry(index);
        }, { once: true });
      }
    }, { passive: false });

    trashList.appendChild(li);
  });
}

// === Papierkorb Toggle ===
let trashVisible = false;
trashToggle.addEventListener("click", () => {
  trashVisible = !trashVisible;
  trashList.classList.toggle("hidden", !trashVisible);
  if (trashVisible) displayTrash();
});

// === Start ===
displayEntries();
