// Export the WASM loader
export { default as BarcodeScanner } from "./utils/barcode-scanner-opt.js";

// Export the React custom hook
export { useBarcodeScanner } from "./useBarcodeScanner.js";

// Export the vanilla JavaScript scanner
export { VanillaBarcodeScanner, createBarcodeScanner } from "./vanilla-scanner.js";

// Default export is the React hook (for backward compatibility)
export { default } from "./useBarcodeScanner.js";
