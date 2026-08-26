export default function ResultCard({ result, onNextRound, onChangeCategory }) {
  const won = result.outcome === "won";

  return (
    <div className={`game-card result-card ${won ? "won" : "lost"}`}>
      <h2 className="result-title">{won ? "Resposta correta" : "Resposta incorreta"}</h2>

      {result.artworkUrl && (
        <img className="result-art" src={result.artworkUrl} alt="Capa do album" />
      )}

      <div>
        <div className="result-song">{result.correctTitle}</div>
        <div className="result-artist">{result.correctArtist}</div>
      </div>

      {won && (
        <div className="points-callout">
          +{result.pointsEarned} pontos
          {result.matchType === "artist" && " (artista)"}
        </div>
      )}

      <div className="action-row">
        <button className="btn-secondary" onClick={onChangeCategory}>
          Trocar categoria
        </button>
        <button className="play-button" onClick={onNextRound}>
          Proxima musica
        </button>
      </div>
    </div>
  );
}
