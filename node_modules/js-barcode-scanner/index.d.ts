import React from "react";

export interface BarcodeScannerProps {
  onDetected?: (result: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface BarcodeScannerModule {
  scan_image: (width: number, height: number, dataPtr: number) => void;
  create_buffer: (width: number, height: number) => number;
  destroy_buffer: (bufferPtr: number) => void;
}

export interface BarcodeScannerOptions {
  noInitialRun?: boolean;
  noExitRuntime?: boolean;
  locateFile?: (path: string) => string;
}

export interface BarcodeScannerLoader {
  (options: BarcodeScannerOptions): Promise<BarcodeScannerModule>;
}

export interface BarcodeScannerWASMProps {
  onDetected?: (result: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

declare const BarcodeScannerWASMComponent: React.FC<BarcodeScannerWASMProps>;
declare const BarcodeScannerLoader: BarcodeScannerLoader;

// export { default as BarcodeScanner } from "./utils/barcode-scanner-opt.js";
export function useBarcodeScanner(): UseBarcodeScannerResult;

export interface UseBarcodeScannerResult {
  result: string;
  isScanning: boolean;
  scannerState: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  toggleScanning: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  playerRef: React.RefObject<HTMLVideoElement>;
}

// Vanilla JavaScript Scanner
export interface VanillaBarcodeScannerOptions {
  canvas?: HTMLCanvasElement;
  video?: HTMLVideoElement;
  onDetected?: (result: string) => void;
  onError?: (error: Error) => void;
}

export declare class VanillaBarcodeScanner {
  constructor(options?: VanillaBarcodeScannerOptions);
  init(): Promise<boolean>;
  startScanning(): Promise<void>;
  stopScanning(): void;
  toggleScanning(): void;
  getIsScanning(): boolean;
  getScannerState(): boolean;
  appendTo(container: string | Element): void;
  destroy(): void;
  readonly isScanning: boolean;
  readonly scannerState: boolean;
}

export declare function createBarcodeScanner(options?: VanillaBarcodeScannerOptions): VanillaBarcodeScanner;

// Default export is the React hook (for backward compatibility)
export default useBarcodeScanner;
