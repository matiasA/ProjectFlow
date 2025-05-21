// jest.setup.js
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // This will polyfill fetch, Request, Response, etc. globally

// Polyfill TextEncoder and TextDecoder for JSDOM environment or older Node versions
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock BroadcastChannel if not present (for msw/ws)
if (typeof BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class {
    constructor(name) {
      this.name = name;
    }
    postMessage(message) {}
    close() {}
    onmessageerror() {}
    onmessage() {}
    addEventListener(type, listener) {}
    removeEventListener(type, listener) {}
    dispatchEvent(event) { return true; }
  };
}
