export default function ModeToggle({ value, onChange }) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="Formato de resposta">
      <button
        className={`mode-toggle-btn ${value === "type" ? "active" : ""}`}
        onClick={() => onChange("type")}
      >
        Digitar resposta
      </button>
      <button
        className={`mode-toggle-btn ${value === "choice" ? "active" : ""}`}
        onClick={() => onChange("choice")}
      >
        Multipla escolha
      </button>
    </div>
  );
}
