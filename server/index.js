import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { router as apiRouter } from './routes/api.js';
import { setupSocketHandlers } from './sockets/gameHandler.js';
import { db } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach Socket.IO instance to HTTP requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 1. Mount REST API routes at /api
app.use('/api', apiRouter);

// 2. Fallback for unhandled /api/* routes (ALWAYS return JSON, never HTML!)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});

// 2.5 Evidence Page Route for Task 3: /K7mQ-4vNp-X2
app.get('/K7mQ-4vNp-X2', (req, res) => {
  let teamId = req.headers['x-team-id'] || req.query.team_id;
  if (!teamId) {
    const teams = db.getTeams();
    if (teams && teams.length > 0) {
      teamId = teams[teams.length - 1].id;
    }
  }
  let flag = '3352-8A31-8A18';
  if (teamId) {
    const teamTask = db.getTeamTask(teamId, 3);
    if (teamTask && teamTask.unique_flag) {
      flag = teamTask.unique_flag;
    }
  }
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bank Investigation</title>
  </head>
  <body style="background:#080b12;color:#ffffff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
    <!-- BANK EVIDENCE CONTINUES AT: /robots.txt | CLUE KEY: ${flag} -->
    <h1 style="font-size:28px;font-weight:600;letter-spacing:1px;color:#f1f5f9;">something hidden here</h1>
  </body>
</html>`);
});

// 2.6 Evidence Page Route for Task 4: /robots.txt
app.get('/robots.txt', (req, res) => {
  let teamId = req.headers['x-team-id'] || req.query.team_id;
  if (!teamId) {
    const teams = db.getTeams();
    if (teams && teams.length > 0) {
      teamId = teams[teams.length - 1].id;
    }
  }
  let flag = '5971-D1C0-4BED';
  if (teamId) {
    const teamTask = db.getTeamTask(teamId, 4);
    if (teamTask && teamTask.unique_flag) {
      flag = teamTask.unique_flag;
    }
  }
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Disallow: /admin/
Disallow: /config/
Disallow: /evidence-archive-vault/

# CYBER HUNT '26 BANK ROBBERY AUXILIARY VAULT
# RECOVERED TASK 4 FLAG: ${flag}
`);
});

// Setup WebSockets
setupSocketHandlers(io);

// 3. Serve static built frontend from dist folder
const distPath = path.join(__dirname, '../dist');
const distIndex = path.join(distPath, 'index.html');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Cyber Hunt '26</title></head>
      <body style="background:#080b12;color:#00f3ff;font-family:sans-serif;text-align:center;padding:50px;">
        <h1>Cyber Hunt '26 Backend Active on Port 3001</h1>
        <p>Run Vite frontend on port 3000 or run <code>npm run build</code> to serve static bundle.</p>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  [PORT CONFLICT] Port ${PORT} is already in use by another running Node process.`);
    console.error(`👉 Run 'Stop-Process -Name node -Force' in PowerShell to close lingering servers.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(PORT, HOST, () => {
  console.log(`
======================================================
CYBER HUNT '26 MISSION CONTROL SERVER ONLINE
======================================================
Express API & WebSockets: http://localhost:${PORT}
Vite Proxy Target:        http://localhost:3000 -> 3001
======================================================
  `);
});
