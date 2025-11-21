import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

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
    q1,
    q2,
    q3,
    q4,
    q5,
    q6,
    suggestion
  } = req.body;

  try {
    // Case-insensitive duplicate check
    const checkQuery = `
      SELECT * FROM feedback
      WHERE LOWER(student_name) = LOWER($1)
    `;
    const checkResult = await pool.query(checkQuery, [studentName]);

    if (checkResult.rows.length > 0) {
      // Duplicate entry message
      return res.status(400).json({
        message: `Duplicate entry! Feedback already submitted for "${studentName}".`
      });
    }

    // Insert feedback if not exists
    const insertQuery = `
      INSERT INTO feedback(
        student_name,
        joining_course,
        batch_time,
        teacher_name,
        q1, q2, q3, q4, q5, q6,
        suggestion
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;

    const values = [
      studentName,
      joiningCourse,
      batchTime,
      teacherName,
      q1, q2, q3, q4, q5, q6,
      suggestion
    ];

    const result = await pool.query(insertQuery, values);

    // Success message
    res.json({
      message: `Monthly Feedback saved successfully for "${studentName}"!`,
      data: result.rows[0]
    });

  } catch (err) {
    // Handle duplicate key error at DB level (if UNIQUE constraint exists)
    if (err.code === "23505") { // PostgreSQL duplicate key error
      return res.status(400).json({
        message: `Duplicate entry! Feedback already submitted for "${studentName}".`
      });
    }

    console.error(err);
    res.status(500).json({ message: "Error occurred!", error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
