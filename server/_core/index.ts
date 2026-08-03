import "./envLoader";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// import { registerOAuthRoutes } from "./oauth"; // OAuth disabled - using local auth
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const APP_BASE_PATH = (process.env.APP_BASE_PATH || "").replace(/\/+$/, "");

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // registerOAuthRoutes(app); // OAuth disabled - using local auth
  // tRPC API
  const trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext,
  });
  app.use("/api/trpc", trpcMiddleware);
  if (APP_BASE_PATH) {
    app.use(`${APP_BASE_PATH}/api/trpc`, trpcMiddleware);
  }
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Passenger/cPanel injects the endpoint through PORT. The application must
  // bind to that exact endpoint or Passenger will return 503.
  const configuredPort = process.env.PORT || "3000";
  const port = /^\d+$/.test(configuredPort)
    ? Number(configuredPort)
    : configuredPort;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
