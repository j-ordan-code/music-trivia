const { v4: uuidv4 } = require("uuid");
const songsByCategory = require("../data/songs");
const { findTrackPreview } = require("./itunesService");

// Estágios do jogo: duração do trecho (em segundos) e pontos concedidos
const STAGES = [
  { seconds: 2, points: 100 },
  { seconds: 5, points: 75 },
  { seconds: 10, points: 50 },
  { seconds: 15, points: 25 }
];

// Armazenamento em memória das rodadas ativas (suficiente para um projeto de portfólio)
const activeRounds = new Map();

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/&/g, " e ") // trata "&" e "e" como equivalentes (ex: Simone & Simaria)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s]/g, "") // remove pontuação
    .replace(/\s+/g, " ")
    .trim();
}

// Distância de edição (Levenshtein) — usada para tolerar pequenos erros de digitação
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // remoção
        dp[i][j - 1] + 1, // inserção
        dp[i - 1][j - 1] + cost // substituição
      );
    }
  }
  return dp[m][n];
}

// Quantos erros de digitação tolerar, proporcional ao tamanho do texto
function typoTolerance(length) {
  if (length <= 4) return 0;
  if (length <= 8) return 1;
  return 2;
}

function isCloseEnough(a, b) {
  if (!a || !b) return false;
  const tolerance = typoTolerance(Math.min(a.length, b.length));
  return levenshtein(a, b) <= tolerance;
}

function matchType(guess, correctTitle, correctArtist) {
  const normalizedGuess = normalize(guess);
  const normalizedTitle = normalize(correctTitle);
  const normalizedArtist = normalize(correctArtist);

  if (!normalizedGuess) return null;

  const titleMatch =
    normalizedGuess === normalizedTitle ||
    (normalizedTitle.includes(normalizedGuess) && normalizedGuess.length >= 3) ||
    normalizedGuess.includes(normalizedTitle) ||
    isCloseEnough(normalizedGuess, normalizedTitle);

  if (titleMatch) return "title";

  const artistMatch =
    normalizedGuess === normalizedArtist || isCloseEnough(normalizedGuess, normalizedArtist);

  if (artistMatch) return "artist";

  return null;
}

async function getAvailableCategories() {
  const { findCategoryImage } = require("./pexelsService");
  return Promise.all(
    Object.keys(songsByCategory).map(async (key) => ({
      id: key,
      label: categoryLabel(key),
      imageUrl: await findCategoryImage(CATEGORY_IMAGE_QUERY[key] || key)
    }))
  );
}

function categoryLabel(key) {
  const labels = {
    sertanejo: "Sertanejo",
    funk: "Funk",
    mpb: "MPB",
    pop: "Pop",
    rap: "Rap / Hip-Hop",
    rock: "Rock",
    anos2000: "Anos 2000",
    gospel: "Gospel",
    eletronica: "Eletrônica",
    qualquer: "Qualquer gênero"
  };
  return labels[key] || key;
}

const CATEGORY_IMAGE_QUERY = {
  sertanejo: "acoustic guitar sunset field",
  funk: "concert crowd bass speakers",
  mpb: "vinyl record player closeup",
  pop: "colorful stage lights concert",
  rap: "microphone stage closeup",
  rock: "electric guitar rock concert",
  anos2000: "retro boombox cassette",
  gospel: "choir singing church",
  eletronica: "dj turntable club lights",
  qualquer: "music festival crowd"
};

/**
 * Cria uma nova rodada: escolhe uma música aleatória da categoria,
 * busca o preview na iTunes e guarda o estado da rodada em memória.
 * Tenta algumas músicas diferentes caso alguma não tenha preview disponível.
 * mode: "type" (digitar resposta) ou "choice" (múltipla escolha)
 */
async function createRound(category, mode = "type") {
  const pool = songsByCategory[category];
  if (!pool) {
    throw new Error("Categoria inválida");
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  let track = null;
  let songMeta = null;

  for (const candidate of shuffled.slice(0, 6)) {
    const found = await findTrackPreview(candidate.artist, candidate.title);
    if (found) {
      track = found;
      songMeta = candidate;
      break;
    }
  }

  if (!track) {
    throw new Error(
      "Não foi possível encontrar preview de áudio para essa categoria no momento"
    );
  }

  const correctTitle = track.trackName || songMeta.title;
  const correctArtist = track.artistName || songMeta.artist;

  let options = null;
  if (mode === "choice") {
    const distractorPool = pool.filter((s) => s.title !== songMeta.title);
    const distractors = [...distractorPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.title);
    options = [...distractors, correctTitle].sort(() => Math.random() - 0.5);
  }

  const roundId = uuidv4();
  activeRounds.set(roundId, {
    stageIndex: 0,
    mode,
    previewUrl: track.previewUrl,
    correctTitle,
    correctArtist,
    artworkUrl: track.artworkUrl,
    status: "playing", // playing | won | lost
    createdAt: Date.now()
  });

  return {
    roundId,
    mode,
    options,
    stage: 1,
    maxStage: STAGES.length,
    seconds: STAGES[0].seconds,
    pointsAvailable: STAGES[0].points,
    previewUrl: track.previewUrl
  };
}

function getRound(roundId) {
  const round = activeRounds.get(roundId);
  if (!round) {
    throw new Error("Rodada não encontrada ou expirada");
  }
  return round;
}

function submitGuess(roundId, guess) {
  const round = getRound(roundId);
  if (round.status !== "playing") {
    throw new Error("Essa rodada já terminou");
  }

  const stage = STAGES[round.stageIndex];
  const match = matchType(guess, round.correctTitle, round.correctArtist);

  if (match === "title") {
    round.status = "won";
    return {
      correct: true,
      matchType: "title",
      pointsEarned: stage.points,
      correctTitle: round.correctTitle,
      correctArtist: round.correctArtist,
      artworkUrl: round.artworkUrl
    };
  }

  if (match === "artist") {
    round.status = "won";
    const pointsEarned = Math.round(stage.points / 2);
    return {
      correct: true,
      matchType: "artist",
      pointsEarned,
      correctTitle: round.correctTitle,
      correctArtist: round.correctArtist,
      artworkUrl: round.artworkUrl
    };
  }

  // Errou: a rodada acaba na hora (não avança estágio automaticamente)
  round.status = "lost";
  return {
    correct: false,
    roundOver: true,
    pointsEarned: 0,
    correctTitle: round.correctTitle,
    correctArtist: round.correctArtist,
    artworkUrl: round.artworkUrl
  };
}

function skipStage(roundId) {
  const round = getRound(roundId);
  if (round.status !== "playing") {
    throw new Error("Essa rodada já terminou");
  }

  if (round.stageIndex === STAGES.length - 1) {
    round.status = "lost";
    return {
      roundOver: true,
      pointsEarned: 0,
      correctTitle: round.correctTitle,
      correctArtist: round.correctArtist,
      artworkUrl: round.artworkUrl
    };
  }

  round.stageIndex += 1;
  const nextStage = STAGES[round.stageIndex];
  return {
    roundOver: false,
    stage: round.stageIndex + 1,
    seconds: nextStage.seconds,
    pointsAvailable: nextStage.points
  };
}

// Limpa rodadas antigas (mais de 30 min) periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [id, round] of activeRounds.entries()) {
    if (now - round.createdAt > 30 * 60 * 1000) {
      activeRounds.delete(id);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  getAvailableCategories,
  createRound,
  submitGuess,
  skipStage,
  STAGES
};
