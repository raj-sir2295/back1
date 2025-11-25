import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // Supabase PostgreSQL connection

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Helper function → trim + lowercase
const clean = (value) => {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
};

app.post("/submit", async (req, res) => {
  let {
    studentName,
    joiningCourse,
    batchTime,
    teacherName,
    q1, q2, q3, q4, q5, q6,
    suggestion,
    mobileNumber,
    branch,
    feedbackMonth,
    feedbackYear
  } = req.body;

  // Clean all inputs
  studentName = clean(studentName);
  joiningCourse = clean(joiningCourse);
  batchTime = clean(batchTime);
  teacherName = clean(teacherName);
  suggestion = clean(suggestion);
  mobileNumber = clean(mobileNumber);
  branch = clean(branch);
  feedbackMonth = clean(feedbackMonth);
  feedbackYear = clean(feedbackYear);

  try {

    // ---------------------------
    // 1️⃣ Check if mobile number exists
    // ---------------------------
    const mobileCheck = await pool.query(
      `SELECT * FROM students WHERE mobile_number = $1`,
      [mobileNumber]
    );

    if (mobileCheck.rows.length === 0) {
      return res.status(400).json({
        message: `❌ This mobile number is not registered in our system: ${mobileNumber}`
      });
    }

    // ---------------------------
    // 2️⃣ Duplicate monthly feedback check
    // ---------------------------
    const checkQuery = `
      SELECT * FROM feedback
      WHERE mobile_number = $1
      AND feedback_month = $2
      AND feedback_year = $3
    `;

    const checkResult = await pool.query(checkQuery, [
      mobileNumber,
      feedbackMonth,
      feedbackYear
    ]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: `❌ Feedback already submitted for this number (${mobileNumber}) in ${feedbackMonth}/${feedbackYear}.`
      });
    }

    // ---------------------------
    // 3️⃣ Insert feedback
    // ---------------------------
    const insertQuery = `
      INSERT INTO feedback(
        student_name,
        joining_course,
        batch_time,
        teacher_name,
        q1, q2, q3, q4, q5, q6,
        suggestion,
        mobile_number,
        branch,
        feedback_month,
        feedback_year
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *;
    `;

    const values = [
      studentName,
      joiningCourse,
      batchTime,
      teacherName,
      q1, q2, q3, q4, q5, q6,
      suggestion,
      mobileNumber,
      branch,
      feedbackMonth,
      feedbackYear
    ];

    const result = await pool.query(insertQuery, values);

    res.json({
      message: `✅ Monthly Feedback saved successfully for "${studentName}"!`,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ Internal Server Error!",
      error: err.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
