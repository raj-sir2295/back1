const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/submit", (req, res) => {
  const { first_name, last_name, email, phone, student_id, description } = req.body;

  const sql = "INSERT INTO complaints (first_name, last_name, email, phone, student_id, description) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [first_name, last_name, email, phone, student_id, description], (err, result) => {
    if (err) {
      res.send({ status: "error", error: err });
    } else {
      res.send({ status: "success", message: "Complaint Submitted" });
    }
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
