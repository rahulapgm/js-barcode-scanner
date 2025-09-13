# Barcode Scanner WASM JS

A WebAssembly barcode scanner that works with React, Vue, Angular, and vanilla JavaScript applications.

## Features

- Real-time barcode scanning via webcam
- WebAssembly-powered performance
- React custom hook for easy integration
- Vanilla JavaScript class for framework-agnostic usage
- Supports various barcode formats
- TypeScript support included

## Installation

```bash
npm install js-barcode-scanner
```

## Requirements

- Modern browser with WebAssembly support
- Camera access (HTTPS required in production)
- React >= 16.8.0 (for React hook usage only)

## Usage

### React Hook

```jsx
import React from 'react';
import { useBarcodeScanner } from 'js-barcode-scanner';

function BarcodeScannerApp() {
  const { 
    result, 
    scannerState, 
    startScanning, 
    stopScanning, 
    toggleScanning,
    canvasRef,
    playerRef
  } = useBarcodeScanner();

  return (
    <div>
      <h1>Barcode Scanner</h1>
      
      <div>
        <button onClick={startScanning} disabled={scannerState}>
          Start Scanning
        </button>
        <button onClick={stopScanning} disabled={!scannerState}>
          Stop Scanning
        </button>
        <button onClick={toggleScanning}>
          {scannerState ? 'Stop' : 'Start'} Scanning
        </button>
      </div>
      
      <div>
        <video ref={playerRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <div>
        <h2>Result:</h2>
        <p>{result || 'No barcode detected yet...'}</p>
      </div>
    </div>
  );
}

export default BarcodeScannerApp;
```

### Vanilla JavaScript

```javascript
import { createBarcodeScanner } from 'js-barcode-scanner';

// Create scanner instance
const scanner = createBarcodeScanner({
  onDetected: (barcodeData) => {
    console.log('Barcode detected:', barcodeData);
    document.getElementById('result').textContent = barcodeData;
  },
  onError: (error) => {
    console.error('Scanner error:', error);
  }
});

// Initialize the scanner
scanner.init().then(() => {
  console.log('Scanner initialized');
}).catch((error) => {
  console.error('Initialization failed:', error);
});

// Start scanning
scanner.startScanning();

// Stop scanning
scanner.stopScanning();

// Toggle scanning
scanner.toggleScanning();

// Check scanner state
const isActive = scanner.getScannerState();

// Cleanup when done
scanner.destroy();
```

### Vue.js Example

```vue
<template>
  <div>
    <h1>Barcode Scanner</h1>
    <button @click="startScanning" :disabled="isScanning">Start</button>
    <button @click="stopScanning" :disabled="!isScanning">Stop</button>
    <video ref="video" autoplay muted playsinline></video>
    <canvas ref="canvas" style="display: none;"></canvas>
    <div>Result: {{ result }}</div>
  </div>
</template>

<script>
import { createBarcodeScanner } from 'js-barcode-scanner';

export default {
  data() {
    return {
      scanner: null,
      result: '',
      isScanning: false
    };
  },
  mounted() {
    this.scanner = createBarcodeScanner({
      video: this.$refs.video,
      canvas: this.$refs.canvas,
      onDetected: (data) => {
        this.result = data;
      },
      onError: (error) => {
        console.error(error);
      }
    });
    
    this.scanner.init();
  },
  methods: {
    startScanning() {
      this.scanner.startScanning();
      this.isScanning = true;
    },
    stopScanning() {
      this.scanner.stopScanning();
      this.isScanning = false;
    }
  },
  beforeDestroy() {
    this.scanner.destroy();
  }
};
</script>
```

### Angular Example

```typescript
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { createBarcodeScanner } from 'js-barcode-scanner';

@Component({
  selector: 'app-barcode-scanner',
  template: `
    <div>
      <h1>Barcode Scanner</h1>
      <button (click)="startScanning()" [disabled]="isScanning">Start</button>
      <button (click)="stopScanning()" [disabled]="!isScanning">Stop</button>
      <video #video autoplay muted playsinline></video>
      <canvas #canvas style="display: none;"></canvas>
      <div>Result: {{ result }}</div>
    </div>
  `
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoRef: ElementRef;
  @ViewChild('canvas') canvasRef: ElementRef;
  
  private scanner: any;
  result = '';
  isScanning = false;

  async ngOnInit() {
    this.scanner = createBarcodeScanner({
      video: this.videoRef.nativeElement,
      canvas: this.canvasRef.nativeElement,
      onDetected: (data: string) => {
        this.result = data;
      },
      onError: (error: Error) => {
        console.error(error);
      }
    });
    
    await this.scanner.init();
  }

  startScanning() {
    this.scanner.startScanning();
    this.isScanning = true;
  }

  stopScanning() {
    this.scanner.stopScanning();
    this.isScanning = false;
  }

  ngOnDestroy() {
    this.scanner.destroy();
  }
}
```

## API

### React Hook API

#### useBarcodeScanner()

Returns an object with the following properties:

- `result` (string): The detected barcode text
- `scannerState` (boolean): Whether the scanner is currently active
- `isScanning` (boolean): Whether the scanner is in scanning mode
- `startScanning()` (function): Start the barcode scanner
- `stopScanning()` (function): Stop the barcode scanner
- `toggleScanning()` (function): Toggle the scanner on/off
- `canvasRef` (React.RefObject): Reference for the canvas element
- `playerRef` (React.RefObject): Reference for the video element

### Vanilla JavaScript API

#### createBarcodeScanner(options)

Creates a new barcode scanner instance.

**Options:**
- `canvas` (HTMLCanvasElement, optional): Canvas element for processing
- `video` (HTMLVideoElement, optional): Video element for camera feed
- `onDetected` (function, optional): Callback when barcode is detected
- `onError` (function, optional): Callback when error occurs

#### VanillaBarcodeScanner Class

**Methods:**
- `init(): Promise<boolean>` - Initialize the scanner
- `startScanning(): Promise<void>` - Start scanning
- `stopScanning(): void` - Stop scanning
- `toggleScanning(): void` - Toggle scanning on/off
- `getIsScanning(): boolean` - Get scanning state
- `getScannerState(): boolean` - Get scanner active state
- `appendTo(container): void` - Append video/canvas to DOM container
- `destroy(): void` - Cleanup and destroy scanner

**Properties:**
- `isScanning` (boolean, readonly): Scanning state
- `scannerState` (boolean, readonly): Scanner active state

## Browser Support

- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 79+

## Notes

- Camera access requires HTTPS in production environments
- The package uses WebAssembly for high-performance barcode detection
- React is optional - the package works with any JavaScript framework or vanilla JS
- TypeScript definitions are included for both React and vanilla JS APIs

## License

MIT
