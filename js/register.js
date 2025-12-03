// Program: register.js
// Names: Richard Nguyen, Audrey Wang, Haley Ryan
// Program Description: Javascript code for connecting register functions from Firebase with HTML website

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword }
    from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { getDatabase, ref, set, update, child, get }
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
const auth = getAuth()
const db = getDatabase(app)


// ---------------- Register New User --------------------------------//
document.getElementById('submitData').onclick = function () {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('userEmail').value;
    const accountType = document.getElementById('accountType').value;

    // Firebase requires a password of at least 6 characters
    const password = document.getElementById('userPass').value;

    // Validate user inputs
    if (!validation(firstName, lastName, email, password)) {
        return;
    }
    // Create new app user using email/password auth
    createUserWithEmailAndPassword(auth, email, password, accountType)
        .then((userCredential) => {
            // Create user credential
            const user = userCredential.user;

            // Add user account info to realtime database
            // set - will create a new ref, or completely replace existing one
            // Each new user will be placed under the 'users' node
            set(ref(db, 'users/' + user.uid + '/accountInfo'), {
                uid: user.uid,    // save userID for home.js reference
                email: email,
                password: encryptPass(password),
                firstname: firstName,
                lastname: lastName,
                accountType: accountType
            })
                .then(() => {
                    // Data saved successfully!
                    alert('User created successfully!')
                })
                .catch((error) => {
                    // Data write failed...
                    alert("Error: User could not be made.")
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        })
}

// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str) {
    return str === null || str.match(/^ *$/) !== null
}

// ---------------------- Validate Registration Data -----------------------//
function validation(firstName, lastName, email, password) {
    let fNameRegex = /^[a-zA-Z]+$/;
    let lNameRegex = /^[a-zA-Z]+$/;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (isEmptyorSpaces(firstName) || isEmptyorSpaces(lastName) ||
        isEmptyorSpaces(email) || isEmptyorSpaces(password)) {
        alert("Please complete all fields.");
        return false;
    }

    if (!fNameRegex.test(firstName)) {
        alert("The first name should only contain letters.");
        return false;
    }

    if (!lNameRegex.test(lastName)) {
        alert("The last name should only contain letters.");
        return false;
    }

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email.");
        return false;
    }

    return true;
}

// --------------- Password Encryption -------------------------------------//
function encryptPass(password) {
    let encrypted = CryptoJS.AES.encrypt(password, password);
    return encrypted.toString();
}

