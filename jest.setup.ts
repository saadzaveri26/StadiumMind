import "@testing-library/jest-dom";

// Polyfill Request and Response globals in Jest JSDom environment
if (typeof global.Request === "undefined") {
  // @ts-ignore
  global.Request = globalThis.Request;
}

if (typeof global.Response === "undefined") {
  // @ts-ignore
  global.Response = globalThis.Response;
}
