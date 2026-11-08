<div align="center">
  <img src="./assets/pacman-logo.svg" alt="Logo Pac-Man" width="720">

  <p>
    <strong>Um jogo Pac-Man moderno, criado com Vite, JavaScript e Canvas.</strong>
  </p>

  <p>
    <a href="#-como-rodar-o-projeto"><img src="https://img.shields.io/badge/rodar%20localmente-vite-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Rodar localmente"></a>
    <img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=222222" alt="JavaScript">
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

Este projeto recria a experiencia arcade de Pac-Man diretamente no navegador, com labirintos inspirados no estilo classico, portais laterais e verticais, fantasmas com comportamentos distintos, fases progressivas e efeitos sonoros sintetizados em tempo real.

Nao usa assets de audio externos: toda a trilha ambiente e os efeitos sao gerados pelo Web Audio API.

## Funcionalidades

- Movimento continuo com controles por teclado, WASD, setas e botoes touch
- Confirmacao por Enter nas telas Ready, Game Over, replay e proxima fase
- Quatro pellets especiais por fase
- Modo de vulnerabilidade dos fantasmas por tempo limitado
- Tres fantasmas com personalidades diferentes
- Mapas simetricos com corredores e blocos inspirados nos labirintos arcade
- Portais horizontais, verticais ou ambos
- Sistema de vidas, pontuacao e fases
- Controles visiveis no rodape
- Efeitos sonoros de interface, ambiente, movimento, comida, fantasmas, paredes, portais e resultados
- Botao para ativar ou desativar o audio
- Interface responsiva para desktop e dispositivos moveis

## Controles

| Acao | Teclado | Rodape / Tela |
|---|---|---|
| Mover para cima | `W` ou `Seta para cima` | Botao `▲` |
| Mover para esquerda | `A` ou `Seta para esquerda` | Botao `◀` |
| Mover para baixo | `S` ou `Seta para baixo` | Botao `▼` |
| Mover para direita | `D` ou `Seta para direita` | Botao `▶` |
| Iniciar ou confirmar | `Enter` | Botao `ENTER` |
| Controlar som | Clique ou toque no icone `♪` | Botao de som |

## Como rodar o projeto

### Requisitos

- [Node.js](https://nodejs.org/) versao 20 ou superior
- npm instalado junto com o Node.js

### Instalacao

```bash
git clone https://github.com/adolfoclima/PacMan.git
cd PacMan
npm install
```

### Iniciar em modo desenvolvimento

```bash
npm run dev
```

Abra o endereco exibido pelo Vite, normalmente:

```text
http://localhost:5173/
```

### Gerar versao de producao

```bash
npm run build
```

Os arquivos otimizados serao criados na pasta `dist`.

### Visualizar a versao de producao

```bash
npm run preview
```

## Tecnologias utilizadas

- Vite
- JavaScript moderno
- HTML Canvas
- CSS responsivo
- Web Audio API
- Git e GitHub

## Estrutura principal

```text
PacMan/
├── assets/
│   ├── pacman-logo.svg
│   └── game-preview.png
├── public/
├── src/
│   ├── audio/          # Web Audio e efeitos sonoros
│   ├── config/         # Configuracao centralizada
│   ├── controllers/    # Entrada de teclado e controles
│   ├── entities/       # Fabricas das entidades
│   ├── game/           # Fases, movimento, IA, colisao e ciclo
│   ├── render/         # Renderizacao Canvas
│   ├── ui/             # Interface, HUD e overlays
│   ├── main.js         # Bootstrap da aplicacao
│   └── style.css
├── index.html
├── package.json
└── README.md
```

## Regras do jogo

- Coma os pellets pequenos para acumular pontos
- Pellets especiais deixam os fantasmas vulneraveis por alguns segundos
- Toque em um fantasma vulneravel para recebe-lo de volta ao centro
- Atravesse os portais para sair pelo lado oposto
- Perder um encontro com um fantasma vivo remove uma vida
- Ao eliminar todas as comidas, o jogador avanca para a fase seguinte

## Autor

Desenvolvido por [Adolfo Lima](https://github.com/adolfoclima).

---

<div align="center">
  <img src="./assets/pacman-logo.svg" alt="Pac-Man logo" width="360">
</div>
