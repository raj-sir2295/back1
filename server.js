import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js"; // Supabase PostgreSQL connection

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Monthly feedback insert API
app.post("/submit", async (req, res) => {
  const {
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

  try {
    // Case-insensitive & monthly duplicate check
    const checkQuery = `
      SELECT * FROM feedback
      WHERE LOWER(student_name) = LOWER($1)
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
        message: `Duplicate entry! Feedback already submitted for "${studentName}" in ${feedbackMonth}/${feedbackYear}.`
      });
    }

    // Insert feedback
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
