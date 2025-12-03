// ----------------- Page Loaded After User Sign-in -------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHTLiF_y8AOaDzWqf_iX93XjhOCLSLahc",
  authDomain: "edd-algebra.firebaseapp.com",
  databaseURL: "https://edd-algebra-default-rtdb.firebaseio.com",
  projectId: "edd-algebra",
  storageBucket: "edd-algebra.firebasestorage.app",
  messagingSenderId: "194608581423",
  appId: "1:194608581423:web:060535491082ad1e9befda"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth();

const db = getDatabase(app);

const dbref = ref(db);


// ---------------------// Get reference values -----------------------------
let signIn = document.getElementById('signInMenu');   // signIn menu link
let register = document.getElementById('register');   // Register menu link
let userLink = document.getElementById('userLink');   // User name for navbar
let signOutLink = document.getElementById('signOut')  // Sign out link
let currentUser = null;                               // Initialize current user to null 


// ----------------------- Get User's Name'Name ------------------------------
function getUserName() {

  // Grab value for the 'keep logged in' switch
  let keepLoggedIn = localStorage.getItem('keepLoggedIn');

  // Grab the user information from the signIn.JS
  if (keepLoggedIn == 'yes') {
    currentUser = JSON.parse(localStorage.getItem('user'));
  }
  else {
    currentUser = JSON.parse(sessionStorage.getItem('user'));
  }
}

// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD
function signOutUser() {
  sessionStorage.removeItem('user');              // Clear session storage
  localStorage.removeItem('user');                // Clear local storage
  localStorage.removeItem('keepLoggedIn)');       // Clear logged in setting


  signOut(auth).then(() => {
    //Sign out successful
  }).catch((error) => {
    // Error occured 
  });

  window.location = '/'
}

// --------------------------- Home Page Loading -----------------------------
window.addEventListener("load", function () {


  // ------------------------- Set Welcome Message -------------------------
  getUserName();    // Get current user's first name
  if (currentUser == null) {
    userLink.classList.add('d-none');
    signOutLink.classList.add('d-none');
  }
  else {
    userLink.innerText = currentUser.firstname;
    if (currentUser.accountType == "Student")
      userLink.href = "student-home.html"
    else
      userLink.href = "teacher-home.html"
    register.classList.add('d-none');
    signIn.classList.add('d-none');
  }

  if (currentUser == null) {
  }
  else {
    register.classList.add('d-none');
    document.getElementById('signOut').onclick = function () {
      signOutUser();
    }
  }

}, false)

