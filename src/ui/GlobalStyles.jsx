import { Global, css } from "@emotion/react";

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          --color-background: #090a15;
          --color-yellow: #ffe438;
          --color-muted: #7d819f;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          overflow-x: hidden;
          color: #fff;
          font-family: "Space Mono", monospace;
          background: radial-gradient(
            circle at 50% 35%,
            #171a36 0%,
            #090a15 55%,
            #060710 100%
          );
        }
        button {
          font: inherit;
        }
      `}
    />
  );
}
