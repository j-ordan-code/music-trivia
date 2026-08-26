import { useEffect, useState } from "react";
import { api } from "./api";
import CategorySelector from "./components/CategorySelector";
import GameScreen from "./components/GameScreen";
import ResultCard from "./components/ResultCard";
import SessionSummary from "./components/SessionSummary";
import ModeToggle from "./components/ModeToggle";

const ROUNDS_PER_SESSION = 10;

export default function App() {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [answerMode, setAnswerMode] = useState("type"); // "type" | "choice"
  const [round, setRound] = useState(null);
  const [result, setResult] = useState(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [sessionOver, setSessionOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setError("Nao foi possivel carregar as categorias. O backend esta rodando?"));
  }, []);

  async function startRound(categoryId, mode = answerMode) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const newRound = await api.newRound(categoryId, mode);
      setCategory(categoryId);
      setRound(newRound);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRoundEnd(roundResult) {
    const pointsEarned = roundResult.outcome === "won" ? roundResult.pointsEarned : 0;
    const nextRoundsPlayed = roundsPlayed + 1;

    setSessionScore((s) => s + pointsEarned);
    setRoundsPlayed(nextRoundsPlayed);
    setResult(roundResult);
    setRound(null);

    if (nextRoundsPlayed >= ROUNDS_PER_SESSION) {
      setSessionOver(true);
    }
  }

  function startNewSession(categoryId) {
    setSessionScore(0);
    setRoundsPlayed(0);
    setSessionOver(false);
    startRound(categoryId);
  }

  function resetToCategories() {
    setResult(null);
    setSessionOver(false);
    setSessionScore(0);
    setRoundsPlayed(0);
    setCategory(null);
  }

  const categoryLabel = categories.find((c) => c.id === category)?.label || category;
  const showCategoryScreen = !loading && !round && !result && !sessionOver && categories.length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">Trivia Musical</h1>
        <div className="header-right">
          {category && !sessionOver && (
            <span className="round-progress">
              Rodada {Math.min(roundsPlayed + 1, ROUNDS_PER_SESSION)}/{ROUNDS_PER_SESSION}
            </span>
          )}
          <div className="score-pill">{sessionScore} pts</div>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading && <p className="loading-text">Carregando...</p>}

      {showCategoryScreen && (
        <>
          <ModeToggle value={answerMode} onChange={setAnswerMode} />
          <CategorySelector categories={categories} onSelect={startNewSession} />
        </>
      )}

      {!loading && round && (
        <GameScreen
          categoryLabel={categoryLabel}
          round={round}
          setRound={setRound}
          onRoundEnd={handleRoundEnd}
        />
      )}

      {!loading && result && !sessionOver && (
        <ResultCard result={result} onNextRound={() => startRound(category)} onChangeCategory={resetToCategories} />
      )}

      {!loading && sessionOver && (
        <SessionSummary
          totalScore={sessionScore}
          roundsTotal={ROUNDS_PER_SESSION}
          onPlayAgain={() => startNewSession(category)}
          onChangeCategory={resetToCategories}
        />
      )}
    </div>
  );
}
