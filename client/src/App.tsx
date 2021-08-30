import { makePortal } from "./makePortal";

const BreakPointsPortal = makePortal("#breakpoints .modal__content");

function App() {
  return (
    <>
      <BreakPointsPortal>
        <div>Hello World</div>
      </BreakPointsPortal>
    </>
  );
}

export default App;
