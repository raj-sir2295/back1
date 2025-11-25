import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // Supabase/PostgreSQL connection

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Helper functions
const cleanText = (value) => (value ? value.toString().trim() : "");
const cleanLower = (value) => (value ? value.toString().trim().toLowerCase() : "");

// POST /submit
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

  // Clean inputs
  studentName = cleanLower(studentName);
  joiningCourse = cleanLower(joiningCourse);
  batchTime = cleanText(batchTime);
  teacherName = cleanLower(teacherName);
  suggestion = cleanLower(suggestion);
  mobileNumber = cleanText(mobileNumber);
  branch = cleanLower(branch);
  feedbackMonth = cleanLower(feedbackMonth);
  feedbackYear = cleanLower(feedbackYear);

  // Convert Q1-Q6 to numbers
  q1 = Number(q1) || 0;
  q2 = Number(q2) || 0;
  q3 = Number(q3) || 0;
  q4 = Number(q4) || 0;
  q5 = Number(q5) || 0;
  q6 = Number(q6) || 0;

  try {
    // Step 1: Check if mobile number is registered
    const mobileCheck = await pool.query(
      "SELECT * FROM registered_students WHERE mobile_number = $1",
      [mobileNumber]
    );

    if (mobileCheck.rows.length === 0) {
      return res.status(400).json({
        message: "यह मोबाइल नंबर हमारे रिकॉर्ड में नहीं है! केवल registered mobile number से ही feedback दिया जा सकता है।"
      });
    }

    // Step 2: Duplicate month/year check
    const checkQuery = `
      SELECT * FROM feedback
      WHERE student_name = $1
      AND feedback_month = $2
      AND feedback_year = $3
    `;

    const checkResult = await pool.query(checkQuery, [
      studentName,
      feedbackMonth,
      feedbackYear
    ]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: `Duplicate entry! "${studentName}" ने ${feedbackMonth}/${feedbackYear} का feedback पहले ही दिया है।`
      });
    }

    // Step 3: Insert feedback
    const insertQuery = `
      INSERT INTO feedback(
        student_name, joining_course, batch_time, teacher_name,
        q1, q2, q3, q4, q5, q6,
        suggestion, mobile_number, branch, feedback_month, feedback_year
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *;
    `;

    const result = await pool.query(insertQuery, [
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
    ]);

    res.json({
      message: `Monthly Feedback saved successfully for "${studentName}"!`,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error occurred!", error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
