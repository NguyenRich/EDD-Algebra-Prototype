// student-home.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, update, child } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
const auth = getAuth();

// --------- Helper ---------
function getCurrentUser() {
  let userData = localStorage.getItem("user") || sessionStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

// --------- Load student info ---------
async function loadStudentInfo() {
  const user = getCurrentUser();
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "users/" + user.uid + "/classroomCode"));
  const classInfoDiv = document.getElementById("classInfo");

  if (snapshot.exists()) {
    const code = snapshot.val();
    const classSnap = await get(child(dbRef, "classrooms/" + code));
    if (classSnap.exists()) {
      const classroom = classSnap.val();
      classInfoDiv.innerHTML = `
        <p><strong>Class Name:</strong> ${classroom.className}</p>
        <p><strong>Teacher:</strong> ${classroom.teacherName}</p>
        <p><strong>Class Code:</strong> ${code}</p>
        <p class="success-texxt">You are already enrolled in this class.</p>
      `;
    }
  }
}

// --------- Join Classroom ---------
document.getElementById("joinClassBtn").onclick = async function () {
  const user = getCurrentUser();
  const classCode = document.getElementById("classCodeInput").value.trim();

  if (!classCode) {
    alert("Please enter a class code.");
    return;
  }

  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "classrooms/" + classCode));
  if (!snapshot.exists()) {
    alert("Classroom not found. Check the code and try again.");
    return;
  }

  // Assign the student to the classroom
  await update(ref(db, "users/" + user.uid + "/"), {
    classroomCode: classCode,
  });

  // Add student record under the classroom node for teacher visibility
  await update(ref(db, "classrooms/" + classCode + "/students/" + user.uid), {
    studentName: user.firstname + " " + user.lastname,
    email: user.email,
  });

  alert("Successfully joined classroom!");
  loadStudentInfo();
};

// --------- Go to Levels ---------
document.getElementById("goToLevels").onclick = function () {
  window.location = "levels.html";
};

window.addEventListener("load", loadStudentInfo, false)