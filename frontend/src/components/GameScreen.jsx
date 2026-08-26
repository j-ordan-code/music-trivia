import { useEffect, useRef, useState } from "react";
import { api } from "../api";

const STAGE_LABELS = ["2s", "5s", "10s", "15s"];

export default function GameScreen({ categoryLabel, round, setRound, onRoundEnd }) {
  const [guessText, setGuessText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef(null);
  const stopTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(stopTimerRef.current);
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    clearTimeout(stopTimerRef.current);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [round.stage]);

  function playClip() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setError("Nao foi possivel tocar o audio. Tente novamente."));

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      audioRef.current?.pause();
      setIsPlaying(false);
    }, round.seconds * 1000);
  }

  async function submitGuessValue(value) {
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.guess(round.roundId, value);
      audioRef.current?.pause();
      setIsPlaying(false);
      if (result.correct) {
        onRoundEnd({ outcome: "won", ...result });
      } else if (result.roundOver) {
        onRoundEnd({ outcome: "lost", ...result });
      } else {
        setGuessText("");
        setRound((prev) => ({ ...prev, ...result }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleTypedSubmit(e) {
    e.preventDefault();
    submitGuessValue(guessText.trim());
  }

  async function handleSkip() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.skip(round.roundId);
      audioRef.current?.pause();
      setIsPlaying(false);
      if (result.roundOver) {
        onRoundEnd({ outcome: "lost", ...result });
      } else {
        setRound((prev) => ({ ...prev, ...result }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const stageIndex = round.stage - 1;
  const isChoiceMode = round.mode === "choice" && Array.isArray(round.options);

  return (
    <div className="game-card">
      <span className="category-tag">{categoryLabel}</span>

      <div className="vinyl-wrap">
        <div className={`vinyl ${isPlaying ? "is-playing" : ""}`}>
          <div className="vinyl-label">
            <div className="vinyl-hole" />
          </div>
        </div>
        <div className={`equalizer ${isPlaying ? "is-playing" : ""}`}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <audio ref={audioRef} src={round.previewUrl} preload="auto" />

      <div style={{ width: "100%" }}>
        <div className="stage-track">
          {STAGE_LABELS.map((label, idx) => (
            <div
              key={label}
              className={`stage-segment ${
                idx < stageIndex ? "filled" : idx === stageIndex ? "current" : ""
              }`}
            />
          ))}
        </div>
        <div className="stage-labels">
          {STAGE_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      <div className="points-callout">Vale {round.pointsAvailable} pontos</div>

      <button className="play-button" onClick={playClip} disabled={isPlaying}>
        {isPlaying ? "Tocando..." : `Ouvir ${round.seconds}s`}
      </button>

      {isChoiceMode ? (
        <div className="choice-grid">
          {round.options.map((option) => (
            <button
              key={option}
              className="choice-button"
              onClick={() => submitGuessValue(option)}
              disabled={busy}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form className="guess-form" onSubmit={handleTypedSubmit}>
          <input
            className="guess-input"
            placeholder="Nome da musica ou artista..."
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            disabled={busy}
          />
          <button className="play-button" disabled={busy || !guessText.trim()}>
            Responder
          </button>
        </form>
      )}

      <button type="button" className="btn-secondary skip-button" onClick={handleSkip} disabled={busy}>
        Pular dica
      </button>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
