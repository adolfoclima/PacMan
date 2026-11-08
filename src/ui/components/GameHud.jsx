import styled from "@emotion/styled";

export function GameHud({ i18n, hud, children }) {
  return (
    <Layout>
      <ScoreCard aria-live="polite">
        <Label>{i18n.t("points")}</Label>
        <Score>{String(hud.score).padStart(5, "0")}</Score>
        <PhaseLabel>{i18n.t("phase", { level: hud.level })}</PhaseLabel>
      </ScoreCard>
      {children}
      <LivesCard>
        <Label>{i18n.t("lives")}</Label>
        <Lives
          aria-label={i18n.t("livesCount", { count: hud.lives })}
          aria-live="polite"
        >
          {Array.from({ length: hud.lives }, (_, index) => (
            <Life key={index} />
          ))}
        </Lives>
      </LivesCard>
    </Layout>
  );
}

const Layout = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 105px min(504px, calc(100vw - 260px)) 105px;
  gap: 12px;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
    column-gap: 8px;
    row-gap: 8px;
  }
`;
const Card = styled.aside`
  align-self: start;
  margin-top: 18px;
  text-align: center;
  @media (max-width: 768px) {
    grid-row: 1;
    margin: 0;
    min-height: 55px;
    align-self: stretch;
    border: 1px solid rgba(125, 129, 159, 0.16);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
    padding: 8px 10px;
  }
`;
const ScoreCard = styled(Card)`
  @media (max-width: 768px) {
    grid-column: 1;
    text-align: left;
  }
`;
const LivesCard = styled(Card)`
  @media (max-width: 768px) {
    grid-column: 2;
    text-align: right;
  }
`;
const Label = styled.span`
  display: block;
  color: #7d819f;
  font-size: 11px;
  letter-spacing: 2px;
  margin-bottom: 9px;
  @media (max-width: 768px) {
    margin-bottom: 5px;
  }
`;
const Score = styled.strong`
  color: #ffe438;
  font-family: "Press Start 2P", monospace;
  font-size: 13px;
`;
const PhaseLabel = styled(Label)`
  margin-top: 16px;
  color: #ffe438;
  @media (max-width: 768px) {
    display: inline-block;
    margin: 5px 0 0 8px;
  }
`;
const Lives = styled.div`
  display: flex;
  gap: 7px;
  justify-content: center;
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;
const Life = styled.span`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: conic-gradient(#ffe438 0 310deg, transparent 310deg);
  @media (max-width: 768px) {
    width: 15px;
    height: 15px;
  }
`;
