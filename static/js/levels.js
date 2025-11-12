// levels.js

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
  const levelsContainer = document.getElementById("levelsContainer");

  if (!classCode) {
    levelsContainer.innerHTML = `<p class="text-center text-danger">You have not joined a classroom yet.</p>`;
    return;
  }

  // Load scores
  const scoreSnap = await get(child(dbRef, `users/${user.uid}/scores/${classCode}`));
  const scores = scoreSnap.exists() ? scoreSnap.val() : {};

  levelsContainer.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const score = scores[i] ?? "N/A";
    levelsContainer.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card p-4 rounded-4 shadow h-100">
          <h3>Level ${i}</h3>
          <p><strong>High Score:</strong> ${score}</p>
          <button class="btn btn-success w-100" onclick="window.location='level-${i}'">
            Start Level ${i}
          </button>
        </div>
      </div>
    `;
  }
}

window.onload = loadLevels;
