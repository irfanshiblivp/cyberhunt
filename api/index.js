import express from 'express';
import cors from 'cors';
import { router as apiRouter } from '../server/routes/api.js';
import { db } from '../server/db.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Team-Id', 'X-Session-Token', 'x-team-id', 'x-session-token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach mock Socket.IO emitter for Serverless environment
app.use((req, res, next) => {
  req.io = {
    emit: () => {},
    to: () => ({ emit: () => {} })
  };
  next();
});

// Evidence Page Route for Task 3: /K7mQ-4vNp-X2
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

// Evidence Page Route for Task 4: /robots.txt
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

// Mount API router
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
