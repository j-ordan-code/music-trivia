const fetch = require("node-fetch");

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

// Cache simples em memória: evita bater na API da Pexels a cada request
const cache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

async function findCategoryImage(query) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return null; // sem chave configurada: frontend cai no visual padrão sem foto
  }

  const cached = cache.get(query);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.url;
  }

  const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
  const response = await fetch(url, {
    headers: { Authorization: apiKey }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const photo = data.photos && data.photos[0];
  if (!photo) {
    return null;
  }

  const imageUrl = photo.src.large;
  cache.set(query, { url: imageUrl, fetchedAt: Date.now() });
  return imageUrl;
}

module.exports = { findCategoryImage };
