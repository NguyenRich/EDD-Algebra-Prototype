// import-questions.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, child, push, set, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// ---------------- Firebase Config ---------------- //
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
const auth = getAuth();
const db = getDatabase(app);

// ---------------- Helper Functions ---------------- //
function getCurrentUser() {
  let userData = localStorage.getItem("user") || sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

// ---------------- Load Teacher Classrooms ---------------- //
async function loadClassrooms() {
  const teacher = getCurrentUser();
  const classroomSelect = document.getElementById("classroomSelect");
  classroomSelect.innerHTML = `<option disabled selected>Loading...</option>`;

  if (!teacher) {
    classroomSelect.innerHTML = `<option disabled>Please sign in</option>`;
    return;
  }

  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "classrooms"));
  if (!snapshot.exists()) {
    classroomSelect.innerHTML = `<option disabled>No classrooms found</option>`;
    return;
  }

  const classrooms = snapshot.val();
  classroomSelect.innerHTML = `<option disabled selected>Select a Classroom</option>`;
  for (const code in classrooms) {
    const c = classrooms[code];
    if (c.teacherUID === teacher.uid) {
      classroomSelect.innerHTML += `<option value="${code}">${c.className} (${code})</option>`;
    }
  }
}

// ---------------- Load Questions ---------------- //
async function loadQuestions() {
  const classCode = document.getElementById("classroomSelect").value;
  const level = document.getElementById("levelSelect").value;
  const questionsList = document.getElementById("questionsList");

  questionsList.innerHTML = "<p class='text-center'>Loading questions...</p>";
  await loadDueDate();


  if (!classCode || !level) {
    questionsList.innerHTML = "<p class='text-center text-muted'>Select a classroom and level.</p>";
    return;
  }

  const snapshot = await get(ref(db, `classrooms/${classCode}/levels/${level}`));

  if (!snapshot.exists()) {
    questionsList.innerHTML = "<p class='text-center text-muted'>No questions yet for this level.</p>";
    return;
  }

  const questions = snapshot.val();
  questionsList.innerHTML = "";

  for (const qid in questions) {
    const q = questions[qid];

    const timerText = q.timer ? `${q.timer} seconds` : "No timer";

    const questionHTML = `
      <div class="list-group-item p-3 mb-2 border rounded shadow-sm">
        <h5><strong>${q.question}</strong></h5>

        <p class="text-primary"><strong>Timer:</strong> ${timerText}</p>

        <ol type="A">
          ${q.choices
        .map(
          (c, i) =>
            `<li class="${i === q.correctIndex ? "fw-bold text-success" : ""}">${c}</li>`
        )
        .join("")}
        </ol>
        <button class="btn btn-danger btn-sm mt-2" data-qid="${qid}">Delete</button>
      </div>
    `;
    questionsList.innerHTML += questionHTML;
  }

  // Attach delete listeners
  document.querySelectorAll("#questionsList button").forEach(btn => {
    btn.onclick = async function () {
      const qid = this.getAttribute("data-qid");
      if (confirm("Delete this question?")) {
        await remove(ref(db, `classrooms/${classCode}/levels/${level}/${qid}`));
        loadQuestions();
      }
    };
  });
}

// ---------------- Save Level Due Date ---------------- //
document.getElementById("saveDueDateBtn").onclick = async function () {
  const classCode = document.getElementById("classroomSelect").value;
  const level = document.getElementById("levelSelect").value;
  const dueDate = document.getElementById("dueDateInput").value;

  // Fully block saving when not selected
  if (!classCode || classCode === "Select a Classroom") {
    alert("Please select a classroom before saving a due date.");
    return;
  }

  if (!level || level === "Select a Level") {
    alert("Please select a level before saving a due date.");
    return;
  }

  try {
    await set(ref(db, `classrooms/${classCode}/levels/${level}/dueDate`),
      dueDate || null
    );
    alert("Due date saved.");
  } catch (err) {
    console.error(err);
    alert("Error saving due date.");
  }
};

// ---------------- Load Level Due Date ---------------- //
async function loadDueDate() {
  const classCode = document.getElementById("classroomSelect").value;
  const level = document.getElementById("levelSelect").value;

  const dueDateInput = document.getElementById("dueDateInput");
  dueDateInput.value = "";

  if (!classCode || !level) return;

  const snapshot = await get(ref(db, `classrooms/${classCode}/levels/${level}/dueDate`));
  if (snapshot.exists()) {
    dueDateInput.value = snapshot.val();
  }
}

// ---------------- Add Question ---------------- //
document.getElementById("addQuestionBtn").onclick = async function () {
  const classCode = document.getElementById("classroomSelect").value;
  const level = document.getElementById("levelSelect").value;
  const questionText = document.getElementById("questionText").value.trim();
  const correctIndex = document.getElementById("correctChoice").value;
  const timerValue = document.getElementById("timerInput").value.trim();
  const choiceInputs = document.querySelectorAll(".choice-input");
  const choices = Array.from(choiceInputs).map(c => c.value.trim());

  if (!classCode || !level || !questionText || correctIndex === "Select Correct Option") {
    alert("Please complete all fields before adding a question.");
    return;
  }

  if (choices.some(c => c === "")) {
    alert("All answer choices must be filled in.");
    return;
  }

  // Parse timer or allow empty = null
  let timer = null;
  if (timerValue !== "") {
    const parsed = parseInt(timerValue);
    if (isNaN(parsed) || parsed <= 0) {
      alert("Timer must be a positive number of seconds or left blank.");
      return;
    }
    timer = parsed;
  }


  const newQuestion = {
    question: questionText,
    choices: choices,
    correctIndex: parseInt(correctIndex),
    timer: timer
  };

  try {
    const questionRef = push(ref(db, `classrooms/${classCode}/levels/${level}`));
    await set(questionRef, newQuestion);
    alert("Question added successfully!");
    document.getElementById("questionText").value = "";
    document.getElementById("timerInput").value = "";
    choiceInputs.forEach(c => (c.value = ""));
    document.getElementById("correctChoice").selectedIndex = 0;
    loadQuestions();
  } catch (error) {
    console.error(error);
    alert("Error saving question.");
  }
};

// ---------------- Event Listeners ---------------- //
document.getElementById("classroomSelect").addEventListener("change", loadQuestions);
document.getElementById("levelSelect").addEventListener("change", loadQuestions);

// ---------------- Init ---------------- //
window.addEventListener("load", loadClassrooms, false)
