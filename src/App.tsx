import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type Operation = "+" | "−" | "×" | "÷" | null;

function App() {
  const [current, setCurrent] = useState<string>("0");
  const [previous, setPrevious] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [resetNext, setResetNext] = useState<boolean>(false);

  const handleNumber = (num: string) => {
    if (resetNext) {
      setCurrent(num);
      setResetNext(false);
      return;
    }
    setCurrent(current === "0" ? num : current + num);
  };

  const handleDot = () => {
    if (resetNext) {
      setCurrent("0.");
      setResetNext(false);
      return;
    }
    if (!current.includes(".")) {
      setCurrent(current + ".");
    }
  };

  const handleOperation = async (op: Operation) => {
    if (operation && previous && !resetNext) {
      const result = await invoke<string>("calculate", {
        a: parseFloat(previous),
        b: parseFloat(current),
        op: operation
      });
      setCurrent(result);
      setPrevious(result);
    } else {
      setPrevious(current);
    }
    setOperation(op);
    setResetNext(true);
  };

  const handleEqual = async () => {
    if (operation && previous) {
      const result = await invoke<string>("calculate", {
        a: parseFloat(previous),
        b: parseFloat(current),
        op: operation
      });
      setCurrent(result);
      setPrevious(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setCurrent("0");
    setPrevious(null);
    setOperation(null);
    setResetNext(false);
  };

  const handlePercent = () => {
    setCurrent((parseFloat(current) / 100).toString());
  };

  const handleToggleSign = () => {
    setCurrent((parseFloat(current) * -1).toString());
  };

  return (
    <main className="app-container">
      <div className="calculator">
        <div className="display">
          <div className="previous">
            {previous} {operation}
          </div>
          <div className="current" id="display-value">{current}</div>
        </div>
        <div className="keypad">
          <button className="btn btn-action" onClick={handleClear}>AC</button>
          <button className="btn btn-action" onClick={handleToggleSign}>±</button>
          <button className="btn btn-action" onClick={handlePercent}>%</button>
          <button className="btn btn-operator" onClick={() => handleOperation("÷")}>÷</button>

          <button className="btn" onClick={() => handleNumber("7")}>7</button>
          <button className="btn" onClick={() => handleNumber("8")}>8</button>
          <button className="btn" onClick={() => handleNumber("9")}>9</button>
          <button className="btn btn-operator" onClick={() => handleOperation("×")}>×</button>

          <button className="btn" onClick={() => handleNumber("4")}>4</button>
          <button className="btn" onClick={() => handleNumber("5")}>5</button>
          <button className="btn" onClick={() => handleNumber("6")}>6</button>
          <button className="btn btn-operator" onClick={() => handleOperation("−")}>−</button>

          <button className="btn" onClick={() => handleNumber("1")}>1</button>
          <button className="btn" onClick={() => handleNumber("2")}>2</button>
          <button className="btn" onClick={() => handleNumber("3")}>3</button>
          <button className="btn btn-operator" onClick={() => handleOperation("+")}>+</button>

          <button className="btn btn-zero" onClick={() => handleNumber("0")}>0</button>
          <button className="btn" onClick={handleDot}>.</button>
          <button className="btn btn-equal" onClick={handleEqual}>=</button>
        </div>
      </div>
    </main>
  );
}

export default App;
