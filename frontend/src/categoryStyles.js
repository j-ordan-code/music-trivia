import { Guitar, Speaker, Disc3, Sparkles, Mic2, Zap, Radio, HeartHandshake, AudioWaveform, Shuffle } from "lucide-react";

// Identidade visual por categoria: cor de destaque (duotone sobre a foto) + icone.
// Mantem o conjunto coeso mesmo quando a foto de fundo nao "bate" perfeitamente com o genero.
export const CATEGORY_STYLE = {
  sertanejo: { color: "#B8722E", icon: Guitar },
  funk: { color: "#D6339F", icon: Speaker },
  mpb: { color: "#1F8A70", icon: Disc3 },
  pop: { color: "#7B5CFA", icon: Sparkles },
  rap: { color: "#D64550", icon: Mic2 },
  rock: { color: "#364FC7", icon: Zap },
  anos2000: { color: "#E8871E", icon: Radio },
  gospel: { color: "#2F9E44", icon: HeartHandshake },
  eletronica: { color: "#0EA5C4", icon: AudioWaveform },
  qualquer: { color: "#5C5F66", icon: Shuffle }
};

export function getCategoryStyle(id) {
  return CATEGORY_STYLE[id] || { color: "#5C5F66", icon: Shuffle };
}
