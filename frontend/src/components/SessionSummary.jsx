export default function SessionSummary({ totalScore, roundsTotal, onPlayAgain, onChangeCategory }) {
  return (
    <div className="game-card result-card">
      <span className="summary-label">Partida encerrada</span>
      <div className="summary-total">{totalScore} pts</div>
      <span className="summary-label">{roundsTotal} rodadas jogadas</span>

      <div className="action-row">
        <button className="btn-secondary" onClick={onChangeCategory}>
          Trocar categoria
        </button>
        <button className="play-button" onClick={onPlayAgain}>
          Jogar novamente
        </button>
      </div>
    </div>
  );
}
