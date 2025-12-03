// level-1.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHTLiF_y8AOaDzWqf_iX93XjhOCLSLahc",
  authDomain: "edd-algebra.firebaseapp.com",
  databaseURL: "https://edd-algebra-default-rtdb.firebaseio.com",
  projectId: "edd-algebra",
  storageBucket: "edd-algebra.firebasestorage.app",
  messagingSenderId: "194608581423",
  appId: "1:194608581423:web:060535491082ad1e9befda"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function getCurrentUser() {
  let userData = localStorage.getItem("user") || sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let classCode = null;
const level = 1;
let introPlayed = false;
let midPlayed = false;
let timerInterval = null;
let timeLeft = null;

const lifeDisplay = document.getElementById("lifeCount");

const videoContainer = document.getElementById("videoContainer");
const videoPlayer = document.getElementById("levelVideo");

const introVideo = "videos/level-1-start.mp4";
const midVideo = "videos/level-1-mid.mp4";
const endVideo = "videos/level-1-end.mp4";

// ---------------- Load Questions ---------------- //
async function loadQuestions() {
  const user = getCurrentUser();
  if (!user) {
    alert("You must be logged in to take this quiz.");
    window.location = "student-home.html";
    return;
  }

  const dbRef = ref(db);
  const userSnap = await get(child(dbRef, "users/" + user.uid));
  classCode = userSnap.val()?.classroomCode;

  if (!classCode) {
    alert("You are not assigned to any classroom.");
    window.location = "student-home.html";
    return;
  }

  const questionsSnap = await get(child(dbRef, `classrooms/${classCode}/levels/${level}`));
  if (!questionsSnap.exists()) {
    document.getElementById("quizContent").innerHTML = `<p>No questions available for this level yet.</p>`;
    return;
  }

  const data = questionsSnap.val();
  questions = Object.entries(data)
  .filter(([key, value]) => key !== "dueDate")
  .map(([key, value]) => value);

  // Play intro before showing first question
  playVideo(introVideo, () => {
    introPlayed = true;
    displayQuestion();
  });
}

// ---------------- Display Question ---------------- //
function displayQuestion() {
  // Hide video if it's showing
  videoContainer.classList.add("d-none");

  // MIDPOINT VIDEO CHECK
  const halfwayIndex = Math.floor(questions.length / 2);
  if (!midPlayed && currentQuestionIndex === halfwayIndex) {
    midPlayed = true;
    playVideo(midVideo, () => displayQuestion());
    return;
  }

  stopTimer();

  const questionObj = questions[currentQuestionIndex];
  const questionText = document.getElementById("questionText");
  const choicesContainer = document.getElementById("choicesContainer");

  questionText.textContent = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;
  choicesContainer.innerHTML = "";

  questionObj.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-dark py-2";
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(i);
    choicesContainer.appendChild(btn);
  });

  document.getElementById("nextBtn").style.display = "none";

  if (questionObj.timer) {
    timeLeft = questionObj.timer;
    const timerDisplay = document.getElementById("timerDisplay");
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    timerDisplay.classList.remove("d-none");

    timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `Time Left: ${timeLeft}s`;

      if (timeLeft <= 0) {
        stopTimer();
        handleTimeout();
      }
    }, 1000);
  } else {
    document.getElementById("timerDisplay").classList.add("d-none");
  }
}

// ---------------- Handle Timeout (automatic wrong answer) ---------------- //
function handleTimeout() {
  const questionObj = questions[currentQuestionIndex];

  const buttons = document.querySelectorAll("#choicesContainer button");
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === questionObj.correctIndex) btn.classList.add("btn-success");
  });

  lives--;
  lifeDisplay.textContent = lives;

  if (lives <= 0) {
    failLevel();
    return;
  }

  document.getElementById("nextBtn").style.display = "block";
}

// ---------------- Stop Timer ---------------- //
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

// ---------------- Video Player ---------------- //
function playVideo(src, callback) {
  stopTimer();

  document.getElementById("quizContent").classList.add("d-none");
  videoContainer.classList.remove("d-none");

  videoPlayer.src = src;
  videoPlayer.currentTime = 0;
  videoPlayer.play();

  videoPlayer.onended = () => {
    videoContainer.classList.add("d-none");
    document.getElementById("quizContent").classList.remove("d-none");
    callback();
  };
}

// ---------------- Handle Answer ---------------- //
function handleAnswer(selectedIndex) {
  stopTimer();

  const questionObj = questions[currentQuestionIndex];
  const correct = selectedIndex === questionObj.correctIndex;

  const buttons = document.querySelectorAll("#choicesContainer button");
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === questionObj.correctIndex) btn.classList.add("btn-success");
    else if (idx === selectedIndex) btn.classList.add("btn-danger");
  });

  if (correct) {
    score++;
  } else {
    lives--;
    lifeDisplay.textContent = lives;
    if (lives <= 0) {
      failLevel();
      return;
    }
  }

  document.getElementById("nextBtn").style.display = "block";
}

// ---------------- Next Question ---------------- //
document.getElementById("nextBtn").onclick = function () {
  currentQuestionIndex++;

  stopTimer();

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    // Play end video before showing results
    playVideo(endVideo, () => finishQuiz());
  }
};

// ---------------- Finish Quiz (success) ---------------- //
async function finishQuiz() {
  stopTimer();

  document.getElementById("quizContent").classList.add("d-none");
  document.getElementById("resultContent").classList.remove("d-none");

  const percentage = Math.round((score / questions.length) * 100);
  document.getElementById("resultTitle").textContent = "Level Complete!";
  document.getElementById("scoreText").textContent =
    `You got ${score} out of ${questions.length} correct (${percentage}%).`;

  await saveScore(percentage);
}

// ---------------- Fail Quiz (out of lives) ---------------- //
async function failLevel() {
  stopTimer();
  
  document.getElementById("quizContent").classList.add("d-none");
  document.getElementById("resultContent").classList.remove("d-none");

  const percentage = Math.round((score / questions.length) * 100);
  document.getElementById("resultTitle").textContent = "You Lost All Your Lives!";
  document.getElementById("scoreText").textContent =
    `You answered ${score} correctly before failing. Your score: ${percentage}%.`;

  await saveScore(percentage);
}

// ---------------- Save Score ---------------- //
async function saveScore(percentage) {
  const user = getCurrentUser();
  if (!user || !classCode) return;

  try {
    await update(ref(db, `users/${user.uid}/scores/${classCode}`), {
      [level]: percentage
    });
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

// ---------------- Back to Home ---------------- //
document.getElementById("backHome").onclick = () => {
  window.location = "student-home.html";
};

// ---------------- Init ---------------- //
window.addEventListener("load", loadQuestions, false);