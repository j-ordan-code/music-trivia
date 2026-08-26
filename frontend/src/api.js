const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro na requisição");
  }
  return data;
}

export const api = {
  getCategories: () => request("/api/game/categories"),
  newRound: (category, mode) =>
    request("/api/game/new", {
      method: "POST",
      body: JSON.stringify({ category, mode })
    }),
  guess: (roundId, guess) =>
    request("/api/game/guess", {
      method: "POST",
      body: JSON.stringify({ roundId, guess })
    }),
  skip: (roundId) =>
    request("/api/game/skip", {
      method: "POST",
      body: JSON.stringify({ roundId })
    })
};
