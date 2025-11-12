# Filename: app.py
# Purpose: Flask app for EDD
# Coded By: Richard Nguyen, Audrey Wang, Haley Ryan

from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime

global config, userID, db, timeStamp, key

app = Flask(__name__)


@app.route("/")             # Landing Page
def index():
    return render_template("index.html")
@app.route("/about")
def about():
    return render_template("about.html")
@app.route("/register")
def register():
    return render_template("register.html")
@app.route("/student-sign-in")
def studentSignIn():
    return render_template("student-sign-in.html")
@app.route("/teacher-sign-in")
def teacherSignIn():
    return render_template("teacher-sign-in.html")
@app.route("/student-home")
def studentHome():
    return render_template("student-home.html")
@app.route("/teacher-home")
def teacherHome():
    return render_template("teacher-home.html")
@app.route("/import-questions")
def importQuestions():
    return render_template("import-questions.html")
@app.route("/levels")
def levels():
    return render_template("levels.html")
@app.route("/level-1")
def level1():
    return render_template("level-1.html")
@app.route("/level-2")
def level2():
    return render_template("level-2.html")
@app.route("/level-3")
def level3():
    return render_template("level-3.html")
@app.route("/level-4")
def level4():
    return render_template("level-4.html")
@app.route("/level-5")
def level5():
    return render_template("level-5.html")


# Run server on local IP address on port 5000
# Replace the: ***,***,*** between the quotes with your laptop's IP address
# If you see the error: "The requested address is not valid in its context" it means the 
# IP address specified for the host is incorrect.

if __name__ == "__main__":
    app.run(debug=False, host='127.0.0.1', port=5050)
