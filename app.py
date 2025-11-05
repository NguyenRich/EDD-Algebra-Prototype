# Filename: app.py
# Purpose: Flask app for Research Website
# Coded By: Richard Nguyen, Aditya Choudhary, Dorisa Sun, Yanna Varouhakis

from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime

global config, userID, db, timeStamp, key

app = Flask(__name__)


@app.route("/")             # Landing Page
def index():
    return render_template("index.html")
def studentSignIn():
    return render_template("student-sign-in.html")

# Run server on local IP address on port 5000
# Replace the: ***,***,*** between the quotes with your laptop's IP address
# If you see the error: "The requested address is not valid in its context" it means the 
# IP address specified for the host is incorrect.

if __name__ == "__main__":
    app.run(debug=False, host='127.0.0.1', port=5050)
