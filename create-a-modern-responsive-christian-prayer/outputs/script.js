const yearElement = document.getElementById("currentYear");
const musicToggle = document.getElementById("musicToggle");
const revealElements = document.querySelectorAll(".reveal");

yearElement.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => observer.observe(element));

let audioContext;
let masterGain;
let oscillators = [];
let isPlaying = false;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

if (!AudioContextClass) {
  musicToggle.disabled = true;
  musicToggle.title = "Prayer music is unavailable in this browser.";
  musicToggle.setAttribute("aria-disabled", "true");
}

function createPrayerPad() {
  audioContext = new AudioContextClass();
  masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  masterGain.connect(audioContext.destination);

  const notes = [196, 246.94, 293.66, 392];
  oscillators = notes.map((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    noteGain.gain.setValueAtTime(0.08, audioContext.currentTime);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start();

    return oscillator;
  });
}

async function togglePrayerMusic() {
  if (!AudioContextClass) {
    return;
  }

  if (!audioContext) {
    createPrayerPad();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;
  isPlaying = !isPlaying;

  if (isPlaying) {
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-pressed", "true");
  } else {
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
  }
}

musicToggle.addEventListener("click", togglePrayerMusic);
