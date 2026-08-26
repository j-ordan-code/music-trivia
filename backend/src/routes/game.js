const express = require("express");
const router = express.Router();
const gameService = require("../services/gameService");

router.get("/categories", async (req, res) => {
  const categories = await gameService.getAvailableCategories();
  res.json({ categories });
});

router.post("/new", async (req, res) => {
  try {
    const { category, mode } = req.body;
    const round = await gameService.createRound(category, mode);
    res.json(round);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/guess", (req, res) => {
  try {
    const { roundId, guess } = req.body;
    const result = gameService.submitGuess(roundId, guess);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/skip", (req, res) => {
  try {
    const { roundId } = req.body;
    const result = gameService.skipStage(roundId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
