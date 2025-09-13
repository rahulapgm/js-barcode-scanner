import { useState, useRef, useEffect, useCallback } from "react";
import BarcodeScanner from '../utils/barcode-scanner-opt';

const BarcodeScannerPromise = BarcodeScanner({
  noInitialRun: true,
  noExitRuntime: true,
});

export function useBarcodeScanner() {
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const [result, setResult] = useState("");
  const [scannerState, setScannerState] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (scannerState) {
      BarcodeScannerPromise.then((Module) => {
        // wrap all C functions using cwrap. Note that we have to provide crwap with the function signature.
        const api = {
          scan_image: Module.cwrap("scan_image", "", [
            "number",
            "number",
            "number",
          ]),
          create_buffer: Module.cwrap("create_buffer", "number", [
            "number",
            "number",
          ]),
          destroy_buffer: Module.cwrap("destroy_buffer", "", ["number"]),
        };

        const video = playerRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // settings for the getUserMedia call
        const constraints = {
          advanced: [
            {
              facingMode: "environment",
            },
          ],
        };

        // open the webcam stream
        navigator.mediaDevices
          .getUserMedia({ video: constraints })
          .then((stream) => {
            setIsScanning(true);
            // stream is a MediaStream object
            video.srcObject = stream;
            video.play();

            // tell the canvas which resolution we ended up getting from the webcam
            const track = stream.getVideoTracks()[0];
            const actualSettings = track.getSettings();
            // console.log(actualSettings.width, actualSettings.height)
            canvas.width = actualSettings.width;
            canvas.height = actualSettings.height;

            // every k milliseconds, we draw the contents of the video to the canvas and run the detector.
            const timer = setInterval(detectSymbols, 250);
          })
          .catch((e) => {
            setIsScanning(false);
            throw e;
          });

        function detectSymbols() {
          // grab a frame from the media source and draw it to the canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // get the image data from the canvas
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // convert the image data to grayscale
          const grayData = [];
          const d = image.data;
          for (var i = 0, j = 0; i < d.length; i += 4, j++) {
            grayData[j] =
              (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
          }

          // put the data into the allocated buffer on the wasm heap.
          const p = api.create_buffer(image.width, image.height);
          Module.HEAP8.set(grayData, p);

          // call the scanner function
          api.scan_image(p, image.width, image.height);

          // clean up
          //(this is not really necessary in this example as we could reuse the buffer, but is used to demonstrate how you can manage Wasm heap memory from the js environment)
          api.destroy_buffer(p);
        }

        // set the function that should be called whenever a barcode is detected
        Module["processResult"] = (symbol, data) => {
          setResult(data);
        };
      });
    }
  }, [scannerState]);

  const startScanning = useCallback(() => {
    if (!scannerState) {
      const constraints = {
        advanced: [
          {
            facingMode: "environment",
          },
        ],
      };
      navigator.mediaDevices
        .getUserMedia({ video: constraints })
        .then((stream) => {
          playerRef.current.srcObject = stream;
        });
      setScannerState(true);
    }
  }, [scannerState]);

  const stopScanning = useCallback(() => {
    if (scannerState && playerRef.current.srcObject) {
      playerRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      setScannerState(false);
      setIsScanning(false);
    }
  }, [scannerState]);

  const toggleScanning = useCallback(() => {
    if (scannerState) {
      stopScanning();
    } else {
      startScanning();
    }
  }, [scannerState, startScanning, stopScanning]);

  return {
    result,
    isScanning,
    scannerState,
    startScanning,
    stopScanning,
    toggleScanning,
    canvasRef,
    playerRef
  };
}

export default useBarcodeScanner;
