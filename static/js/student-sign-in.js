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
  apiKey: "AIzaSyAybRpf6QvzpAgPh75X-Cu0PGZuVc-peXE",
  authDomain: "wearable-sensor-7-ccdff.firebaseapp.com",
  databaseURL: "https://wearable-sensor-7-ccdff-default-rtdb.firebaseio.com",
  projectId: "wearable-sensor-7-ccdff",
  storageBucket: "wearable-sensor-7-ccdff.firebasestorage.app",
  messagingSenderId: "932486870928",
  appId: "1:932486870928:web:cc9f47564ae654adb2e515"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize firebase Authentication
const auth = getAuth();

// Returns instance of your app's FRD
const database = getDatabase(app);

// ---------------- Sign-In User --------------------------------//
document.getElementById('signIn').onclick = function () {

  // Get user's email and password for sign in
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;


  // Attempt to sign user in
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          // Create user credential & store user ID
          const user = userCredential.user;

          // log sign-in with in db
          // update - will only add the last_login infor and won't overwrite
          let logDate = new Date();
          update(ref(database, 'users/' + user.uid + '/accountInfo'), {
              last_login: logDate,
          })
              .then(() => {
                  alert('User signed in successfully!');

                  // Get snapshot of all the user info (including uid) to pass to 
                  // the login() function and store in session or local storage
                  get(ref(database, 'users/' + user.uid + '/accountInfo')).then((snapshot) => {
                      if (snapshot.exists()) {
                          // console.log(snapshot.val()); 
                          logIn(snapshot.val(), firebaseConfig);
                      } else {
                          console.log("User does not exist");
                      }
                  })
                      .catch((error) => {
                          console.error(error);
                      });
              })
              .catch((error) => {
                  // Sign in failed
                  alert("User does not exist");
              });
      })
      .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert("User does not exist.");
      });
}


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
          "headers": {"Content-Type": "application/json"},
          "body": JSON.stringify(fbcfg),
      })

      // alert(fbcfg);
      window.location = 'home';
  }

  // Local storage is permanent (keep user logged in even if browser is closed)
  // Local storage will be cleared a signOut() function in home.js
  else {
      localStorage.setItem('keepLoggedIn', 'yes');
      localStorage.setItem('user', JSON.stringify(user));
      
      // Send Firebase config. and user ID to app.py using POST
      fetch('/test', {
          "method": "POST",
          "headers": {"Content-Type": "application/json"},
          "body": JSON.stringify(fbcfg),
      })

      // alert(fbcfg);
      window.location = 'home';
  }

}