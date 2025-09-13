"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VanillaBarcodeScanner = void 0;
exports.createBarcodeScanner = createBarcodeScanner;
exports.default = void 0;
var _barcodeScannerOpt = _interopRequireDefault(require("../utils/barcode-scanner-opt"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const BarcodeScannerPromise = (0, _barcodeScannerOpt.default)({
  noInitialRun: true,
  noExitRuntime: true
});
class VanillaBarcodeScanner {
  constructor(options = {}) {
    this.canvas = options.canvas || document.createElement('canvas');
    this.video = options.video || document.createElement('video');
    this.onDetected = options.onDetected || (() => {});
    this.onError = options.onError || (() => {});
    this.isScanning = false;
    this.scannerState = false;
    this.module = null;
    this.api = null;
    this.timer = null;
    this.stream = null;

    // Set default video attributes
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;

    // Hide canvas by default
    this.canvas.style.display = 'none';
  }
  async init() {
    try {
      this.module = await BarcodeScannerPromise;

      // Wrap C functions using cwrap
      this.api = {
        scan_image: this.module.cwrap("scan_image", "", ["number", "number", "number"]),
        create_buffer: this.module.cwrap("create_buffer", "number", ["number", "number"]),
        destroy_buffer: this.module.cwrap("destroy_buffer", "", ["number"])
      };

      // Set the function that should be called whenever a barcode is detected
      this.module["processResult"] = (symbol, data) => {
        this.onDetected(data);
      };
      return true;
    } catch (error) {
      this.onError(error);
      return false;
    }
  }
  async startScanning() {
    if (this.scannerState) return;
    try {
      if (!this.module) {
        await this.init();
      }
      const constraints = {
        advanced: [{
          facingMode: "environment"
        }]
      };
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: constraints
      });
      this.video.srcObject = this.stream;
      await this.video.play();

      // Set canvas resolution based on video track settings
      const track = this.stream.getVideoTracks()[0];
      const actualSettings = track.getSettings();
      this.canvas.width = actualSettings.width;
      this.canvas.height = actualSettings.height;
      this.scannerState = true;
      this.isScanning = true;

      // Start scanning loop
      this.startScanningLoop();
    } catch (error) {
      this.onError(error);
    }
  }
  startScanningLoop() {
    if (!this.scannerState) return;
    const ctx = this.canvas.getContext("2d");
    const detectSymbols = () => {
      if (!this.scannerState) return;
      try {
        // Grab a frame from the media source and draw it to the canvas
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Get the image data from the canvas
        const image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Convert the image data to grayscale
        const grayData = [];
        const d = image.data;
        for (var i = 0, j = 0; i < d.length; i += 4, j++) {
          grayData[j] = d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096 >> 8;
        }

        // Put the data into the allocated buffer on the wasm heap
        const p = this.api.create_buffer(image.width, image.height);
        this.module.HEAP8.set(grayData, p);

        // Call the scanner function
        this.api.scan_image(p, image.width, image.height);

        // Clean up
        this.api.destroy_buffer(p);
      } catch (error) {
        console.error('Error during barcode detection:', error);
      }

      // Schedule next detection
      this.timer = setTimeout(detectSymbols, 250);
    };
    detectSymbols();
  }
  stopScanning() {
    if (!this.scannerState) return;
    this.scannerState = false;
    this.isScanning = false;

    // Stop the scanning loop
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Stop the video stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }

    // Clear video source
    if (this.video.srcObject) {
      this.video.srcObject = null;
    }
  }
  toggleScanning() {
    if (this.scannerState) {
      this.stopScanning();
    } else {
      this.startScanning();
    }
  }

  // Getters for state
  getIsScanning() {
    return this.isScanning;
  }
  getScannerState() {
    return this.scannerState;
  }

  // Method to append elements to DOM if needed
  appendTo(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (container && container.appendChild) {
      container.appendChild(this.canvas);
      container.appendChild(this.video);
    }
  }

  // Cleanup method
  destroy() {
    this.stopScanning();

    // Remove elements from DOM if they were appended
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.video.parentNode) {
      this.video.parentNode.removeChild(this.video);
    }
  }
}

// Factory function for easier usage
exports.VanillaBarcodeScanner = VanillaBarcodeScanner;
function createBarcodeScanner(options) {
  return new VanillaBarcodeScanner(options);
}

// Default export
var _default = exports.default = VanillaBarcodeScanner;