/**
 * Axiom Studio — Server Entry Point
 * Express server with agent API routes.
 * 
 * DarkWave Studios LLC — Copyright 2026
 */

import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerAgentRoutes } from "./agent-routes.js";
import { registerStripeRoutes } from "./stripe-routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS for dev
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (_req.method === "OPTIONS") { res.sendStatus(200); return; }
  next();
});

// Register API routes
registerAgentRoutes(app);
registerStripeRoutes(app);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "axiom-studio",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicDir = path.resolve(__dirname, "../public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const PORT = parseInt(process.env.PORT || "5101");
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║     AXIOM STUDIO — v1.0.0            ║`);
  console.log(`  ║     DarkWave Studios LLC              ║`);
  console.log(`  ║     http://localhost:${PORT}             ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
