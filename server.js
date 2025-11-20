import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Simple insert API
app.post("/submit", async (req, res) => {
  const { first_name, last_name, email, phone, student_id, description } = req.body;

  try {
    const query = `
      INSERT INTO feedback(first_name, last_name, email, phone, student_id, description)
      VALUES($1, $2, $3, $4, $5, $6) RETURNING *;
    `;

    const values = [first_name, last_name, email, phone, student_id, description];

    const result = await pool.query(query, values);

    res.json({ message: "Feedback submitted successfully!", data: result.rows[0] });
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
