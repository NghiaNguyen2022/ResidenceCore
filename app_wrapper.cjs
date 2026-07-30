// CloudLinux Node.js Selector/Passenger loads CommonJS startup files.
// Forward startup to the bundled ESM production server.
(() => import("./dist/index.js"))();
