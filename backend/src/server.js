require("dotenv").config();
const express = require("express");
const cors = require("cors");
const gameRoutes = require("./routes/game");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "music-trivia-backend" });
});

app.use("/api/game", gameRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
