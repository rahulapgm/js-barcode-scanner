import React from "react";
import { createRoot } from "react-dom/client";
import { useBarcodeScanner } from "../index.js";
import "./demo.css";

function App() {
  const { result, scannerState, toggleScanning, canvasRef, playerRef } =
    useBarcodeScanner();

  // Print result to console whenever it changes
  React.useEffect(() => {
    if (result) {
      console.log("Barcode detected:", result);
    }
  }, [result]);

  return (
    <div>
      <h2>Barcode Scanner implemented through webassembly</h2>
      <input
        className={scannerState ? "btn-stop" : "btn-start"}
        type="button"
        value={scannerState ? "Stop Scanning" : "Start Scanning"}
        onClick={toggleScanning}
      />
      <h3>
        Result: <strong style={{ color: "blue" }}>{result}</strong>
      </h3>
      {scannerState ? (
        <>
          <canvas
            ref={canvasRef}
            id="canvas"
            width="320"
            height="240"
            style={{ display: "none" }}
          ></canvas>
          <video
            ref={playerRef}
            id="player"
            preload="true"
            autoPlay
            muted
          ></video>
          <br />
        </>
      ) : null}
    </div>
  );
}

// Create root element if it doesn't exist
if (!document.getElementById('root')) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Render using createRoot (React 18+)
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
