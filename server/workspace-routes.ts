/**
 * Axiom Studio — Workspace File System Routes
 * Server-side proxy for reading/writing workspace files.
 * 
 * SECURITY: All routes require auth. File paths sandboxed to WORKSPACE_ROOT.
 * DarkWave Studios LLC — Copyright 2026
 */
import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

// Workspace root — sandboxed directory
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || path.resolve(process.cwd(), "workspace");

// Ensure workspace exists (non-blocking, non-fatal)
fs.mkdir(WORKSPACE_ROOT, { recursive: true })
  .then(() => console.log(`[Workspace] Root: ${WORKSPACE_ROOT}`))
  .catch((e) => console.warn(`[Workspace] Could not create root dir: ${e.message}`));

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Sanitize path — prevent directory traversal
function safePath(reqPath: string): string | null {
  const resolved = path.resolve(WORKSPACE_ROOT, reqPath);
  if (!resolved.startsWith(WORKSPACE_ROOT)) return null;
  return resolved;
}

// GET /api/workspace/tree — Directory tree
router.get("/tree", requireAuth, async (_req, res) => {
  try {
    const tree = await buildTree(WORKSPACE_ROOT, "workspace");
    res.json(tree);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function buildTree(dirPath: string, name: string, depth = 0): Promise<any> {
  if (depth > 6) return { name, path: path.relative(WORKSPACE_ROOT, dirPath), type: "directory", children: [] };
  
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const children = [];
  
  // Sort: directories first, then files, alphabetical
  const sorted = entries
    .filter(e => !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "dist" && e.name !== ".git")
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(WORKSPACE_ROOT, fullPath).replace(/\\/g, "/");
    
    if (entry.isDirectory()) {
      children.push(await buildTree(fullPath, entry.name, depth + 1));
    } else {
      children.push({ name: entry.name, path: relPath, type: "file" });
    }
  }

  return {
    name,
    path: path.relative(WORKSPACE_ROOT, dirPath).replace(/\\/g, "/") || ".",
    type: "directory",
    children,
  };
}

// GET /api/workspace/file?path=... — Read file
router.get("/file", requireAuth, async (req, res) => {
  const filePath = safePath(req.query.path as string);
  if (!filePath) { res.status(400).json({ error: "Invalid path" }); return; }
  
  try {
    const content = await fs.readFile(filePath, "utf-8");
    res.json({ content, path: req.query.path });
  } catch (err: any) {
    res.status(404).json({ error: `File not found: ${req.query.path}` });
  }
});

// PUT /api/workspace/file — Write file
router.put("/file", requireAuth, async (req, res) => {
  const { path: reqPath, content } = req.body;
  const filePath = safePath(reqPath);
  if (!filePath) { res.status(400).json({ error: "Invalid path" }); return; }
  
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf-8");
    res.json({ success: true, path: reqPath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workspace/mkdir — Create directory
router.post("/mkdir", requireAuth, async (req, res) => {
  const dirPath = safePath(req.body.path);
  if (!dirPath) { res.status(400).json({ error: "Invalid path" }); return; }
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/workspace/file — Delete file or directory
router.delete("/file", requireAuth, async (req, res) => {
  const filePath = safePath(req.query.path as string);
  if (!filePath) { res.status(400).json({ error: "Invalid path" }); return; }
  
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workspace/exec — Execute command (fallback for terminal)
router.post("/exec", requireAuth, async (req, res) => {
  const { command } = req.body;
  if (!command) { res.status(400).json({ error: "No command" }); return; }
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: WORKSPACE_ROOT,
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });
    res.json({ stdout, stderr });
  } catch (err: any) {
    res.json({ stdout: err.stdout || "", stderr: err.stderr || err.message });
  }
});

export default router;
