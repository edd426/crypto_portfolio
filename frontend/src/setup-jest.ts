import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Mock global objects
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve())
  }
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:4200',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});