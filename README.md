<div align="center">
  <img src="./assets/pacman-logo.svg" alt="Logo Pac-Man" width="720">

  <p>
    <strong>Um jogo Pac-Man moderno, criado com React, Vite e HTML Canvas.</strong>
  </p>

  <p>
    <a href="#-como-rodar-o-projeto"><img src="https://img.shields.io/badge/rodar%20localmente-vite-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Rodar localmente"></a>
    <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=222222" alt="React">
    <img src="https://img.shields.io/badge/emotion-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white" alt="Emotion">
    <img src="https://img.shields.io/badge/canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="Canvas">
  </p>
</div>

---

## Preview do jogo

<div align="center">
  <img src="./assets/game-preview.png?v=20261108" alt="Pac-Man rodando no navegador" width="860">
</div>

---

## Sobre o projeto

Este projeto recria a experiência arcade de Pac-Man diretamente no navegador, com labirintos inspirados no estilo clássico, portais, fantasmas com comportamentos distintos, fases progressivas e efeitos sonoros sintetizados em tempo real.

O React é responsável pela interface, pelo ciclo de vida dos componentes e pelos controles. O motor do jogo permanece separado em módulos de estado, movimento, colisão, IA, áudio, renderização e geração de fases.

Não usa assets de áudio externos: toda a trilha ambiente e os efeitos são gerados pela Web Audio API.

## Funcionalidades

- Movimento contínuo por teclado, WASD, setas e controles touch
- Controles de teclado e confirmação por Enter nas telas do jogo
- Controles D-pad em tablet e celular
- Quatro fantasmas com comportamentos distintos
- Pellets especiais com modo de vulnerabilidade temporária
- Portais laterais, verticais ou combinados conforme o mapa
- Sistema de vidas, pontuação e fases progressivas
- Efeitos sonoros de interface, ambiente, movimento, comida, fantasmas, portais e resultados
- Controle para ativar ou desativar o áudio
- Interface responsiva com estilos gerenciados pelo Emotion
- Seletor moderno de idioma com bandeiras
- Português, inglês e espanhol com detecção automática do idioma do navegador
- Preferência de idioma persistida no navegador

## Controles

| Ação | Teclado | Desktop | Tablet / Celular |
|---|---|---|---|
| Mover para cima | `W` ou `Seta para cima` | Botão `W / ▲` | Botão `▲` |
| Mover para esquerda | `A` ou `Seta para esquerda` | Botão `A / ◀` | Botão `◀` |
| Mover para baixo | `S` ou `Seta para baixo` | Botão `S / ▼` | Botão `▼` |
| Mover para direita | `D` ou `Seta para direita` | Botão `D / ▶` | Botão `▶` |
| Iniciar ou confirmar | `Enter` | Botão de confirmação | Botão na tela |
| Controlar som | Clique ou toque no botão | Botão de som | Botão de som |
| Alterar idioma | Selecione no menu | Seletor com bandeira | Seletor com bandeira |

## Como rodar o projeto

### Requisitos

- [Node.js](https://nodejs.org/) versão 20.19 ou superior
- npm

### Instalação

```bash
git clone https://github.com/adolfoclima/PacMan.git
cd PacMan
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O Vite exibirá o endereço local, normalmente:

```text
http://localhost:5173/
```

### Produção

```bash
npm run build
npm run preview
```

Os arquivos otimizados são gerados na pasta `dist`.

### Implantação na Vercel

O projeto já inclui `vercel.json` com o framework Vite, o diretório de saída e o fallback da aplicação.

1. Faça o push do projeto para GitHub, GitLab ou Bitbucket.
2. Importe o repositório na [Vercel](https://vercel.com/new).
3. Mantenha:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Implante.

### Qualidade e testes

```bash
npm run test
npm run lint
npm run format:check
npm run build
```

Para executar os testes continuamente:

```bash
npm run test:watch
```

## Tecnologias utilizadas

- React 19
- React DOM
- Vite
- Emotion Styled e Emotion React
- HTML Canvas
- Web Audio API
- JavaScript moderno
- Jest
- ESLint
- Prettier

## Estrutura principal

```text
PacMan/
├── assets/
│   ├── pacman-logo.svg
│   └── game-preview.png
├── src/
│   ├── audio/          # Web Audio e efeitos sonoros
│   ├── config/         # Configuração centralizada
│   ├── entities/       # Entidades e fábricas dos personagens
│   ├── game/           # Estado, movimento, colisão, IA e fases
│   ├── i18n/           # Idiomas, detecção e persistência
│   ├── render/         # Renderização do jogo em Canvas
│   ├── ui/
│   │   ├── GameApp.jsx              # Orquestração da aplicação React
│   │   ├── GlobalStyles.jsx         # Estilos globais básicos
│   │   └── components/
│   │       ├── GameBoard.jsx        # Tabuleiro, canvas e overlay
│   │       ├── GameControls.jsx     # Controles desktop e touch
│   │       ├── GameHud.jsx          # Pontuação, fase e vidas
│   │       ├── LanguageSelector.jsx # Menu e estilos do idioma
│   │       └── Topbar.jsx           # Cabeçalho e controle de áudio
│   └── main.jsx        # Bootstrap da aplicação React
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Regras do jogo

- Coma os pellets pequenos para acumular pontos
- Pellets especiais deixam os fantasmas vulneráveis por alguns segundos
- Use os portais para atravessar o mapa pelos lados opostos
- Um encontro com um fantasma vivo remove uma vida
- Comer todos os pellets disponíveis avança para a fase seguinte

## Autor

Desenvolvido por [Adolfo Lima](https://github.com/adolfoclima).

---

<div align="center">
  <img src="./assets/pacman-logo.svg" alt="Logo Pac-Man" width="360">
</div>
