// levels.js
const slider = document.querySelector('.slider');

function activate(e) {
  const items = document.querySelectorAll('.item');
  e.target.matches('.next') && slider.append(items[0])
  e.target.matches('.prev') && slider.prepend(items[items.length-1]);
}

document.addEventListener('click',activate,false);

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

async function loadLevels() {
  const user = getCurrentUser();
  const dbRef = ref(db);
  const userSnap = await get(child(dbRef, "users/" + user.uid));
  const classCode = userSnap.val()?.classroomCode;

  if (!classCode) {
    return;
  }

  // Load scores
  const scoreSnap = await get(child(dbRef, `users/${user.uid}/scores/${classCode}`));
  const scores = scoreSnap.exists() ? scoreSnap.val() : {};

  for (let i = 1; i <= 5; i++) {
    const highScore = document.getElementById(`score-level-${i}`);
    highScore.innerHTML = "";

    const score = scores[i] ?? "0";
    highScore.innerHTML += `
            High Score: ${score}%
    `;
  }
}

window.addEventListener("load", loadLevels, false)
