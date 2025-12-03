// Program: sign-in.js
// Names: Richard Nguyen, Audrey Wang, Haley Ryan
// Program Description: Javascript code for connecting sign-in functions from Firebase with HTML website

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    getDatabase, ref, set, update, child, get,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
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

// Initialize firebase Authentication
const auth = getAuth();

// Returns instance of your app's FRD
const database = getDatabase(app);

// ---------------- Sign-In User --------------------------------//
document.getElementById("signIn").onclick = function () {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Log sign-in time
            let logDate = new Date();
            update(ref(database, "users/" + user.uid + "/accountInfo"), {
                last_login: logDate,
            });

            // Retrieve user info from Realtime DB
            get(ref(database, "users/" + user.uid + "/accountInfo"))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userInfo = snapshot.val();
                        const userType = userInfo.accountType;

                        // Check account type
                        if (typeof expectedAccountType !== "undefined" && userType !== expectedAccountType) {
                            alert(
                                `Access denied. You are registered as a ${userType}, not a ${expectedAccountType}.`
                            );
                            // Sign out the wrong user
                            signOut(auth);
                            return;
                        }

                        // Continue login process
                        alert("User signed in successfully!");
                        logIn(userInfo, firebaseConfig);
                    } else {
                        alert("User data not found.");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    alert("Error retrieving user data.");
                });
        })
        .catch((error) => {
            alert("Incorrect email or password.");
            console.error(error);
        });
};



// --------------- Keep User Logged In ------------//
function logIn(user, fbcfg) {
    let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

    fbcfg.userID = user.uid;    // Add userID to FB config to pass to Flask

    // Session storage is temporary (only while session is active)
    // Information saved as a string (must convert JS object to a string)
    // Session starge will be cleard with a signOut() function is home.js
    if (!keepLoggedIn) {
        sessionStorage.setItem('user', JSON.stringify(user));

        // Send Firebase config. and user ID to app.py using POST
        fetch('/test', {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(fbcfg),
        })

        // alert(fbcfg);
        if (expectedAccountType == "Teacher")
            window.location = 'teacher-home.html';
        else
            window.location = 'student-home.html';
    }

    // Local storage is permanent (keep user logged in even if browser is closed)
    // Local storage will be cleared a signOut() function in home.js
    else {
        localStorage.setItem('keepLoggedIn', 'yes');
        localStorage.setItem('user', JSON.stringify(user));

        // Send Firebase config. and user ID to app.py using POST
        fetch('/test', {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(fbcfg),
        })

        // alert(fbcfg);
        window.location = 'index.html';
    }

}