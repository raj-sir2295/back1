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
    fullName,
    mobileNumber,
    branch,
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
    // Case-insensitive duplicate check by fullName + mobileNumber (optional for better uniqueness)
    const checkQuery = `
      SELECT * FROM feedback
      WHERE LOWER(full_name) = LOWER($1) AND mobile_number = $2
    `;
    const checkResult = await pool.query(checkQuery, [fullName, mobileNumber]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: `Duplicate entry! Feedback already submitted for "${fullName}".`
      });
    }

    // Insert feedback if not exists
    const insertQuery = `
      INSERT INTO feedback(
        full_name,
        mobile_number,
        branch,
        joining_course,
        batch_time,
        teacher_name,
        q1, q2, q3, q4, q5, q6,
        suggestion
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;

    const values = [
      fullName,
      mobileNumber,
      branch,
      joiningCourse,
      batchTime,
      teacherName,
      q1, q2, q3, q4, q5, q6,
      suggestion
    ];

    const result = await pool.query(insertQuery, values);

    res.json({
      message: `Monthly Feedback saved successfully for "${fullName}"!`,
      data: result.rows[0]
    });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        message: `Duplicate entry! Feedback already submitted for "${fullName}".`
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
