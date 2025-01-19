const express = require("express");
const router = express.Router();
const pool = require("../db/db");

router.post("/save", async (req, res) => {
  const { score, time } = req.body;
  try {
    await pool.query("INSERT INTO scores (score, time) VALUES ($1, $2)", [
      score,
      time,
    ]);
    res.status(200).send("Score saved");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving score");
  }
});

module.exports = router;
