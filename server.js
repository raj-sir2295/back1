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
    const query = `
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

    const result = await pool.query(query, values);

    res.json({
      message: "Monthly Feedback saved successfully!",
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
