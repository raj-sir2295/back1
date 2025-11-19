import express from "express";
import cors from "cors";
import sql from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS fix for Netlify frontend
app.use(cors({
  origin: "https://teal-klepon-9a05ff.netlify.app",  // <-- Netlify URL
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.post("/submit", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, student_id, description } = req.body;

    await sql`
      INSERT INTO complaints (first_name, last_name, email, phone, student_id, description)
      VALUES (${first_name}, ${last_name}, ${email}, ${phone}, ${student_id}, ${description})
    `;

    res.send({ status: "success", message: "Complaint Submitted" });

  } catch (err) {
    console.error("DB ERROR:", err);
    res.send({ status: "error", error: err });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
