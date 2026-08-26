# Trivia Musical

Jogo de trivia musical: ouça um trecho de uma música e tente adivinhar antes
que o tempo (e a pontuação) acabem. Quanto menos segundos você precisar, mais
pontos ganha.

## Como funciona
- Escolha uma categoria (Sertanejo, Funk, MPB, Pop, Rap, Rock, Anos 2000,
  Gospel, Eletronica ou "Qualquer gênero" — mistura tudo).
- Cada partida tem 10 rodadas seguidas, com pontuação total ao final.
- Toca um trecho de 2 segundos da música. Se não souber, dá pra "pular" pra
  desbloquear mais tempo (5s → 10s → 15s).
- Acertar o titulo vale a pontuacao cheia do estagio (100/75/50/25); acertar
  so o artista vale metade.
- Errar a resposta encerra a rodada na hora (o avanço de estágio só acontece
  ao pular a dica).
- Pequenos erros de digitação e "&" no lugar de "e" (ex: Simone & Simaria)
  são aceitos como resposta certa.
- Os áudios são previews oficiais de 30s buscados em tempo real na
  **iTunes Search API** (Apple).
- As fotos das categorias vêm da **Pexels API** (banco de fotos reais e
  gratuitas).

## Estrutura
```
music-trivia/
├── backend/   → API Node/Express (busca musicas e fotos, gerencia rodadas e pontuacao)
└── frontend/  → App React/Vite (interface do jogo)
```

## Como rodar localmente

### 1. Pegue uma chave gratuita da Pexels (opcional, mas recomendado)
As fotos das categorias vêm da Pexels. Sem a chave o jogo funciona
normalmente, só sem as fotos de fundo nos cards.
1. Acesse https://www.pexels.com/api/ e clique em "Get Started"
2. Crie uma conta gratuita e copie sua API key

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# edite o .env e cole sua PEXELS_API_KEY
npm start
```
Isso sobe a API em `http://localhost:3001`.

### 3. Frontend
Em outro terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Isso sobe o app em `http://localhost:5173`.

Abra `http://localhost:5173` no navegador.

## Notas técnicas
- Não é necessária chave de API para os áudios (iTunes Search API é pública).
- As rodadas e sessões ficam guardadas em memória no backend (suficiente
  para uso local/portfólio).
- Deploy em produção: mesmo fluxo do projeto anterior (finance-tracker) —
  backend no Render, frontend na Vercel, ajustando `VITE_API_URL` e
  configurando `PEXELS_API_KEY` nas variáveis de ambiente do Render.

## Próximos passos possíveis
- Deploy em produção (Render + Vercel)
- Ranking/histórico de pontuação por usuário
- Número de rodadas por partida configurável
