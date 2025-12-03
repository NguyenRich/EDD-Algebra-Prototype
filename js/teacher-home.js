// Program: teacher-home.js
// Description: Firebase logic for Teacher Hub page

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, push, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

function generateClassCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ---------------- Create Classroom ---------------- //
document.getElementById("createClassBtn").onclick = async function () {
  const teacher = getCurrentUser();
  const className = document.getElementById("classroomName").value.trim();

  if (!teacher) {
    alert("You must be signed in as a teacher to create a classroom.");
    return;
  }
  if (className === "") {
    alert("Please enter a classroom name.");
    return;
  }

  const classCode = generateClassCode();
  const classRef = ref(db, `classrooms/${classCode}`);

  const classData = {
    classCode: classCode,
    className: className,
    teacherUID: teacher.uid,
    teacherName: teacher.lastname,
    students: {},
    createdAt: new Date().toISOString()
  };

  try {
    await set(classRef, classData);
    alert(`Classroom "${className}" created successfully! Code: ${classCode}`);
    displayClassrooms(); // refresh list
    displayStudentScores(); // refresh scores
  } catch (error) {
    console.error(error);
    alert("Error creating classroom.");
  }
};

// ---------------- Display Classrooms ---------------- //
async function displayClassrooms() {
  const teacher = getCurrentUser();
  const classListDiv = document.getElementById("classList");

  if (!teacher) {
    classListDiv.innerHTML = "<p class='text-danger'>Please sign in again.</p>";
    return;
  }

  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "classrooms"));
  if (!snapshot.exists()) {
    classListDiv.innerHTML = "<p class='text-muted'>No classrooms found.</p>";
    return;
  }

  const classes = snapshot.val();
  let html = "";

  for (const code in classes) {
    const c = classes[code];
    if (c.teacherUID === teacher.uid) {
      const studentCount = c.students ? Object.keys(c.students).length : 0;
      html += `
        <div class="card my-3 p-3 shadow-sm">
          <h4>${c.className} <span class="badge bg-secondary">${c.classCode}</span></h4>
          <p>Students Enrolled: ${studentCount}</p>
          ${studentCount > 0 ? `<ul>${Object.values(c.students).map(s => `<li>${s.studentName}</li>`).join('')}</ul>` : ""}
        </div>
      `;
    }
  }

  classListDiv.innerHTML = html || "<p class='text-muted'>No classrooms created yet.</p>";
}

// ---------------- Display Student Scores ---------------- //
async function displayStudentScores() {
  const teacher = getCurrentUser();
  const studentScoresBody = document.getElementById("studentScoresBody");

  if (!teacher) return;

  const dbRef = ref(db);
  const usersSnap = await get(child(dbRef, "users"));

  studentScoresBody.innerHTML = "";

  if (!usersSnap.exists()) {
    studentScoresBody.innerHTML = `<tr><td colspan="8">No student data available.</td></tr>`;
    return;
  }

  const allUsers = usersSnap.val();
  let hasStudents = false;

  // Iterate through all users to find students
  for (const uid in allUsers) {
    const student = allUsers[uid];
    const info = student.accountInfo;
    if (!info || info.accountType !== "Student") continue;

    const studentClassCode = student.classroomCode;
    if (!studentClassCode) continue;

    // Check if this classroom belongs to the current teacher
    const classSnap = await get(child(dbRef, `classrooms/${studentClassCode}`));
    if (!classSnap.exists()) continue;

    const classroom = classSnap.val();
    if (classroom.teacherUID !== teacher.uid) continue;

    hasStudents = true;

    // Get scores for this classroom
    const scores = student.scores?.[studentClassCode] || {};

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${classroom.className}</td>
      <td>${info.firstname} ${info.lastname}</td>
      <td>${info.email}</td>
      <td>${scores[1] ?? "-"}</td>
      <td>${scores[2] ?? "-"}</td>
      <td>${scores[3] ?? "-"}</td>
      <td>${scores[4] ?? "-"}</td>
      <td>${scores[5] ?? "-"}</td>
    `;
    studentScoresBody.appendChild(row);
  }

  if (!hasStudents) {
    studentScoresBody.innerHTML = `<tr><td colspan="8">No students have joined your classrooms yet.</td></tr>`;
  }
}

// ---------------- Initialize ---------------- //
window.addEventListener("load", function () {
  displayClassrooms();
  displayStudentScores();
}, false)
