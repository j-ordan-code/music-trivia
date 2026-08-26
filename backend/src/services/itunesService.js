const fetch = require("node-fetch");

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

/**
 * Busca uma faixa na iTunes Search API pelo artista + título.
 * Retorna o preview oficial de 30s, capa do álbum e metadados.
 */
async function findTrackPreview(artist, title) {
  const term = encodeURIComponent(`${artist} ${title}`);
  const url = `${ITUNES_SEARCH_URL}?term=${term}&media=music&entity=song&limit=5`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`iTunes API retornou status ${response.status}`);
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    return null;
  }

  // Pega o primeiro resultado que tenha preview de áudio disponível
  const match = data.results.find((r) => r.previewUrl) || data.results[0];
  if (!match.previewUrl) {
    return null;
  }

  return {
    previewUrl: match.previewUrl,
    artworkUrl: match.artworkUrl100
      ? match.artworkUrl100.replace("100x100", "300x300")
      : null,
    trackName: match.trackName,
    artistName: match.artistName,
    collectionName: match.collectionName
  };
}

module.exports = { findTrackPreview };
