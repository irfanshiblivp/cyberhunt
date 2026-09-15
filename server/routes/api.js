import express from 'express';
import { db } from '../db.js';
import {
  generateTeamCode,
  generateAccessCode,
  generateUniqueFlag,
  generateTeamTaskPayload
} from '../utils/flagGenerator.js';
import {
  handleTask2Compile,
  handleTask4Robots,
  handleTask4SecretRoute,
  handleTask7Request,
  handleTask8GetLedger,
  handleTask8Transfer,
  handleTask9Query,
  handleTask10Verify
} from '../challenges/index.js';

export const router = express.Router();

const TEAM_COLORS = ['cyan', 'red', 'lime', 'yellow', 'purple', 'orange', 'pink'];

function getElapsedString(startTimestamp, currentTimestamp = Date.now(), totalPauseDuration = 0) {
  if (!startTimestamp) return '00:00:00';
  const elapsedMs = Math.max(0, currentTimestamp - startTimestamp - totalPauseDuration);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Always ensure JSON content-type header for API responses
router.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Single-Device Session Enforcement Middleware
function teamAuthSession(req, res, next) {
  const teamId = req.headers['x-team-id'];
  const sessionToken = req.headers['x-session-token'];

  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const team = db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  if (team.active_session_token && team.active_session_token !== sessionToken) {
    return res.status(403).json({
      error: 'SESSION TERMINATED: Another device has logged into this team account. Only one device can be active at a time.',
      sessionTerminated: true
    });
  }
  next();
}

function adminAuth(req, res, next) {
  const token = req.headers['authorization'];
  if (token === 'admin_session_valid_cyberhunt26') {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized admin access.' });
}

// ----------------------------------------------------
// 1. PUBLIC & AUTH ENDPOINTS
// ----------------------------------------------------

router.post('/auth/team/register', (req, res) => {
  const { team_name, member1, member2, member3 } = req.body;

  if (!team_name || !member1 || !member2 || !member3) {
    return res.status(400).json({ error: 'Team Name and all 3 Member names are mandatory.' });
  }

  const existingTeams = db.getTeams();
  if (existingTeams.some(t => t.team_name.toLowerCase() === team_name.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Team name is already registered.' });
  }

  const teamId = `team_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const teamCode = generateTeamCode();
  const accessCode = generateAccessCode();
  const assignedColor = TEAM_COLORS[existingTeams.length % TEAM_COLORS.length];

  const sessionToken = `sess_${Date.now()}_${Math.floor(Math.random()*1000000)}`;

  const newTeam = {
    id: teamId,
    team_code: teamCode,
    access_code: accessCode,
    team_name: team_name.trim(),
    member1: member1.trim(),
    member2: member2 ? member2.trim() : '',
    member3: member3 ? member3.trim() : '',
    color: assignedColor,
    created_at: new Date().toISOString(),
    status: 'WAITING',
    active_session_token: sessionToken,
    score: 0
  };

  db.createTeam(newTeam);

  const tasks = db.getTasks();
  tasks.forEach((task, idx) => {
    const flag = generateUniqueFlag(teamCode, task.number);
    const dynamicData = generateTeamTaskPayload(teamCode, task.number, flag);
    
    db.createTeamTask({
      id: `tt_${teamId}_${task.number}`,
      team_id: teamId,
      task_id: task.number,
      unique_flag: dynamicData.flag || flag,
      dynamic_data: dynamicData,
      unlocked_at: idx === 0 ? new Date().toISOString() : null,
      completed_at: null,
      attempt_count: 0,
      score: 0
    });
  });

  if (req.io) {
    req.io.emit('team:registered', { team: newTeam, totalTeams: db.getTeams().length });
  }

  res.json({
    success: true,
    team_code: teamCode,
    access_code: accessCode,
    session_token: sessionToken,
    team: newTeam
  });
});

router.post('/auth/team/login', (req, res) => {
  const { team_code, access_code } = req.body;

  if (!team_code || !access_code) {
    return res.status(400).json({ error: 'Team ID and Access Code are required.' });
  }

  const team = db.getTeams().find(
    t => t.team_code.trim().toUpperCase() === team_code.trim().toUpperCase() &&
         t.access_code.trim().toUpperCase() === access_code.trim().toUpperCase()
  );

  if (!team) {
    return res.status(401).json({ error: 'Invalid Team ID or Access Code.' });
  }

  const sessionToken = `sess_${Date.now()}_${Math.floor(Math.random()*1000000)}`;
  db.updateTeam(team.id, { active_session_token: sessionToken });
  const updatedTeam = db.getTeamById(team.id);

  res.json({
    success: true,
    session_token: sessionToken,
    team: updatedTeam
  });
});

router.post('/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.getAdmin();

  const inputUser = String(username || '').trim().toLowerCase();
  const inputPass = String(password || '').trim();
  const expectedUser = String(admin.username || 'cyb_26').trim().toLowerCase();
  const expectedPass = String(admin.password || 'CeMCyb@26').trim();

  if (inputUser === expectedUser && inputPass === expectedPass) {
    res.json({
      success: true,
      token: 'admin_session_valid_cyberhunt26'
    });
  } else {
    res.status(401).json({ error: 'Invalid Admin credentials.' });
  }
});

router.get('/game/status', (req, res) => {
  const state = db.getGameState();
  const teams = db.getTeams();
  
  let currentElapsed = '00:00:00';
  if (state.status === 'RUNNING' && state.started_at) {
    currentElapsed = getElapsedString(state.started_at, Date.now(), state.total_pause_duration);
  } else if (state.status === 'PAUSED' && state.started_at && state.paused_at) {
    currentElapsed = getElapsedString(state.started_at, state.paused_at, state.total_pause_duration);
  } else if (state.status === 'ENDED' && state.started_at && state.ended_at) {
    currentElapsed = getElapsedString(state.started_at, state.ended_at, state.total_pause_duration);
  }

  res.json({
    ...state,
    total_teams: teams.length,
    elapsed_time: currentElapsed
  });
});

// ----------------------------------------------------
// 2. TEAM PLAYER ENDPOINTS
// ----------------------------------------------------

router.get('/team/me', teamAuthSession, (req, res) => {
  const teamId = req.headers['x-team-id'];
  const team = db.getTeamById(teamId);
  const teamTasks = db.getTeamTasks(teamId);
  const tasks = db.getTasks();
  const gameState = db.getGameState();

  const progress = teamTasks.map(tt => {
    const taskDef = tasks.find(t => t.number === tt.task_id);
    const timeFromStart = tt.time_from_start || (tt.completed_at && gameState.started_at ? getElapsedString(gameState.started_at, new Date(tt.completed_at).getTime(), gameState.total_pause_duration) : null);

    return {
      task_id: tt.task_id,
      number: taskDef.number,
      title: taskDef.title,
      subtitle: taskDef.subtitle,
      description: taskDef.description,
      difficulty: taskDef.difficulty,
      is_unlocked: tt.unlocked_at !== null,
      is_completed: tt.completed_at !== null,
      time_from_start: timeFromStart,
      unlocked_at: tt.unlocked_at,
      completed_at: tt.completed_at
    };
  });

  const completedCount = teamTasks.filter(tt => tt.completed_at !== null).length;

  res.json({
    team,
    completedCount,
    totalTasks: tasks.length,
    progress
  });
});

router.get('/tasks/:number', teamAuthSession, (req, res) => {
  const teamId = req.headers['x-team-id'];
  const taskNumber = Number(req.params.number);

  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const teamTask = db.getTeamTask(teamId, taskNumber);
  if (!teamTask) return res.status(404).json({ error: 'Task not found for team.' });

  if (!teamTask.unlocked_at) {
    const prevTask = taskNumber > 1 ? db.getTeamTask(teamId, taskNumber - 1) : null;
    if (taskNumber === 1 || taskNumber === 6 || taskNumber === 7 || taskNumber === 8 || taskNumber === 9 || (prevTask && prevTask.completed_at !== null)) {
      teamTask.unlocked_at = new Date().toISOString();
      db.updateTeamTask(teamId, taskNumber, { unlocked_at: teamTask.unlocked_at });
    }
  }

  if (!teamTask.unlocked_at) {
    return res.status(403).json({ error: 'Access Denied: Task is locked until previous tasks are solved.' });
  }

  const taskDef = db.getTasks().find(t => t.number === taskNumber);

  const payloadCopy = JSON.parse(JSON.stringify(teamTask.dynamic_data));
  if (teamTask.completed_at === null) {
    delete payloadCopy.flag;
    delete payloadCopy.secretKey;
  }

  res.json({
    task: taskDef,
    is_completed: teamTask.completed_at !== null,
    attempt_count: teamTask.attempt_count,
    unlocked_at: teamTask.unlocked_at,
    completed_at: teamTask.completed_at,
    payload: payloadCopy
  });
});

router.post('/tasks/:number/submit', teamAuthSession, (req, res) => {
  const teamId = req.headers['x-team-id'];
  const taskNumber = Number(req.params.number);
  const { flag } = req.body;

  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });
  if (!flag || typeof flag !== 'string') {
    return res.status(400).json({ error: 'Flag string is required.' });
  }

  const gameState = db.getGameState();
  if (gameState.status !== 'RUNNING') {
    return res.status(403).json({ error: 'Competition is not active or is currently paused.' });
  }

  const teamTask = db.getTeamTask(teamId, taskNumber);
  if (!teamTask) return res.status(404).json({ error: 'Task record not found.' });

  if (!teamTask.unlocked_at) {
    const prevTask = taskNumber > 1 ? db.getTeamTask(teamId, taskNumber - 1) : null;
    if (taskNumber === 1 || taskNumber === 6 || taskNumber === 7 || taskNumber === 8 || taskNumber === 9 || (prevTask && prevTask.completed_at !== null)) {
      teamTask.unlocked_at = new Date().toISOString();
      db.updateTeamTask(teamId, taskNumber, { unlocked_at: teamTask.unlocked_at });
    }
  }

  if (!teamTask.unlocked_at) {
    return res.status(403).json({ error: 'Task is locked.' });
  }

  if (teamTask.completed_at) {
    return res.json({
      success: true,
      alreadyCompleted: true,
      message: 'Task was already completed by your team!'
    });
  }

  const newAttempts = teamTask.attempt_count + 1;
  db.updateTeamTask(teamId, taskNumber, { attempt_count: newAttempts });

  let submittedClean = flag.trim();
  if (submittedClean.toUpperCase().startsWith('CYBER{') && submittedClean.endsWith('}')) {
    submittedClean = submittedClean.substring(6, submittedClean.length - 1).trim();
  }

  let expectedFlag = teamTask.unique_flag.trim();
  if (expectedFlag.toUpperCase().startsWith('CYBER{') && expectedFlag.endsWith('}')) {
    expectedFlag = expectedFlag.substring(6, expectedFlag.length - 1).trim();
  }

  let dynamicFlag = teamTask.dynamic_data?.flag ? String(teamTask.dynamic_data.flag).trim() : null;
  if (dynamicFlag && dynamicFlag.toUpperCase().startsWith('CYBER{') && dynamicFlag.endsWith('}')) {
    dynamicFlag = dynamicFlag.substring(6, dynamicFlag.length - 1).trim();
  }
  
  let isCorrect = submittedClean.toUpperCase() === expectedFlag.toUpperCase();
  if (!isCorrect && dynamicFlag && submittedClean.toUpperCase() === dynamicFlag.toUpperCase()) {
    isCorrect = true;
  }
  if (!isCorrect && taskNumber === 1 && (submittedClean === 'SzdtUS00dk5wLVgy' || submittedClean === 'SzdtUSO0dk5wLVgy' || submittedClean === 'INVESTIGATE')) {
    isCorrect = true;
  }
  if (!isCorrect && taskNumber === 2 && (
    submittedClean.toUpperCase() === 'K7MQ-4VNP-X2' ||
    submittedClean === 'SzdtUS00dk5wLVgy' ||
    submittedClean === 'SzdtUSO0dk5wLVgy' ||
    submittedClean === 'F96E-C2A9-F85F' ||
    submittedClean === 'K7mQ-4vNp-X2'
  )) {
    isCorrect = true;
  }
  if (!isCorrect && taskNumber === 6) {
    const norm = submittedClean.replace(/[\s\:\-\.]/g, '');
    if (norm === '115618' || submittedClean === '11:56:18' || submittedClean.toUpperCase() === 'CYBER{11:56:18}') {
      isCorrect = true;
    }
  }
  if (!isCorrect && taskNumber === 7 && (submittedClean.toUpperCase() === '40A7-3D08-FDD9' || submittedClean.toUpperCase() === '40A73D08FDD9')) {
    isCorrect = true;
  }
  if (!isCorrect && taskNumber === 8 && (submittedClean.toUpperCase() === 'Q7MP-82LX-K4' || submittedClean.toUpperCase() === 'Q7MP82LXK4')) {
    isCorrect = true;
  }
  if (!isCorrect && taskNumber === 9) {
    const norm9 = submittedClean.replace(/[\s\:\-\.]/g, '').toUpperCase();
    if (norm9 === 'K7PQ82LMX4' || submittedClean.toUpperCase() === 'K7PQ-82LM-X4' || submittedClean.toUpperCase() === 'CYBER{K7PQ-82LM-X4}') {
      isCorrect = true;
    }
  }
  if (!isCorrect && taskNumber === 10) {
    const norm10 = submittedClean.replace(/[\s\:\-\.]/g, '').toUpperCase();
    if (norm10 === 'K8Q4MP72X' || norm10 === 'X9Q7MK42PL8' || submittedClean.toUpperCase() === 'K8Q-4MP-72X' || submittedClean.toUpperCase() === 'CYBER{K8Q-4MP-72X}' || submittedClean.toUpperCase() === 'X9Q-7MK-42P-L8') {
      isCorrect = true;
    }
  }
  if (!isCorrect && taskNumber === 5) {
    let clean5 = submittedClean;
    if (clean5.toUpperCase().startsWith('TRANSACTION_FLAG:')) {
      clean5 = clean5.substring(17).trim();
    }
    try {
      const decodedOnce = Buffer.from(clean5, 'base64').toString('utf8');
      if (decodedOnce.toUpperCase().startsWith('TRANSACTION_FLAG:')) {
        clean5 = decodedOnce.substring(17).trim();
      } else if (decodedOnce === expectedFlag || (dynamicFlag && decodedOnce === dynamicFlag)) {
        clean5 = decodedOnce;
      }
    } catch (e) {}

    if (clean5 === expectedFlag || (dynamicFlag && clean5 === dynamicFlag) || submittedClean === 'TRT0ODIATLIOOFOOM' || submittedClean === 'VFJUMEODIATLIOOFOOM') {
      isCorrect = true;
    }
  }

  const now = Date.now();
  const timeFromStart = getElapsedString(gameState.started_at, now, gameState.total_pause_duration);

  const submissions = db.getSubmissions(teamId);
  const lastSub = submissions[submissions.length - 1];
  const timeFromPrev = lastSub ? getElapsedString(new Date(lastSub.submitted_at).getTime(), now, 0) : timeFromStart;

  db.addSubmission({
    id: `sub_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    team_id: teamId,
    task_id: taskNumber,
    submitted_flag: submittedClean,
    is_correct: isCorrect,
    submitted_at: new Date().toISOString(),
    time_from_start: timeFromStart,
    time_from_prev: timeFromPrev
  });

  if (!isCorrect) {
    return res.status(400).json({
      success: false,
      message: 'ACCESS DENIED: The submitted flag is incorrect.'
    });
  }

  db.updateTeamTask(teamId, taskNumber, {
    completed_at: new Date().toISOString(),
    time_from_start: timeFromStart
  });

  const team = db.getTeamById(teamId);

  let nextUnlockedTask = null;
  if (taskNumber < 10) {
    const nextNum = taskNumber + 1;
    db.updateTeamTask(teamId, nextNum, { unlocked_at: new Date().toISOString() });
    nextUnlockedTask = nextNum;
  }

  if (req.io) {
    req.io.emit('submission:correct', {
      teamId,
      teamName: team.team_name,
      taskNumber,
      timeFromStart,
      completedCount: db.getTeamTasks(teamId).filter(tt => tt.completed_at !== null).length,
      timestamp: new Date().toISOString()
    });
    req.io.emit('leaderboard:update', { leaderboard: calculateLeaderboard() });
  }

  res.json({
    success: true,
    message: 'TASK COMPLETE! MISSION DATA VERIFIED.',
    timeFromStart,
    nextUnlockedTask,
    completedAt: new Date().toISOString()
  });
});

// ----------------------------------------------------
// 3. TASK SANDBOX APIS
// ----------------------------------------------------

router.post('/tasks/2/compile', (req, res) => {
  const teamId = req.headers['x-team-id'];
  const { code } = req.body;
  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const result = handleTask2Compile(teamId, code);
  res.json(result);
});

router.get('/tasks/4/robots.txt', (req, res) => {
  const teamId = req.headers['x-team-id'];
  if (!teamId) return res.status(400).send('# Error: X-Team-Id missing');
  const txt = handleTask4Robots(teamId);
  res.header('Content-Type', 'text/plain').send(txt || '# robots.txt unavailable');
});

router.get('/tasks/4/chamber/:route', (req, res) => {
  const teamId = req.headers['x-team-id'];
  const routePath = `/secret-chamber-${req.params.route}`;
  const result = handleTask4SecretRoute(teamId, routePath);
  res.json(result);
});

const restoredCollegeArchives = new Set();

router.get('/api/college/status', (req, res) => {
  let teamId = req.headers['x-team-id'] || 'default';
  const isRestored = restoredCollegeArchives.has(`${teamId}_ARCH-27`);
  res.json({ isRestored });
});

router.post('/college/visitor-check', (req, res) => {
  let teamId = req.headers['x-team-id'] || req.body.team_id || 'default';
  const { visitor_id } = req.body;

  let teamTask = teamId !== 'default' ? db.getTeamTask(teamId, 8) : null;
  let flag = teamTask ? teamTask.unique_flag : 'Q7mP-82Lx-K4';

  const isRestored = restoredCollegeArchives.has(`${teamId}_ARCH-27`);

  if (isRestored) {
    return res.json({
      found: true,
      status: 'VERIFIED',
      case_reference: 'BANK-03',
      flag: flag || 'Q7mP-82Lx-K4',
      message: 'STATUS: VERIFIED — CASE REFERENCE: BANK-03 — INVESTIGATION FLAG: Q7mP-82Lx-K4'
    });
  }

  return res.json({
    found: true,
    visitor: 'Unknown',
    department: '—',
    last_access: '03:17:42',
    reference: 'ARCH-27',
    status: 'ARCHIVED_RECORD_UNRESTORED',
    message: 'VISITOR NOT FOUND IN ACTIVE SYSTEM. INTERNAL RECORD REF: ARCH-27 (UNRESTORED)'
  });
});

router.post('/college/restore-archive', (req, res) => {
  let teamId = req.headers['x-team-id'] || req.body.team_id || 'default';
  const { reference } = req.body;

  if (reference === 'ARCH-27' || String(reference).toUpperCase().includes('ARCH-27')) {
    restoredCollegeArchives.add(`${teamId}_ARCH-27`);
    return res.json({
      success: true,
      reference: 'ARCH-27',
      message: 'RECORD ARCH-27 RESTORED SUCCESSFULLY! Visitor system database updated.'
    });
  }

  return res.status(404).json({
    success: false,
    error: 'Archive reference not found or unrecognized.'
  });
});

router.post('/login', (req, res) => {
  let teamId = req.headers['x-team-id'] || req.body.team_id;
  const { employee_id, access_code, username, password, auth_state, role, bypass, override } = req.body;
  const headers = req.headers;

  if (!teamId) {
    const teams = db.getTeams();
    if (teams && teams.length > 0) {
      teamId = teams[teams.length - 1].id;
    }
  }

  let teamTask = teamId ? db.getTeamTask(teamId, 7) : null;
  let flag = teamTask ? teamTask.unique_flag : '40A7-3D08-FDD9';

  const empId = String(employee_id || username || '').trim();
  const code = String(access_code || password || '').trim();
  const stateVal = String(auth_state || '').toUpperCase();
  const roleVal = String(role || '').toUpperCase();

  // 1. Parameter State Manipulation / Escalation (Discovered via Network tab analysis)
  const isStateExploit = (
    stateVal === 'BYPASS' || stateVal === 'AUTHENTICATED' || stateVal === 'SYSTEM_ADMIN' || stateVal === 'OVERRIDE' || stateVal === 'BYPASS_APPROVED' ||
    roleVal === 'SYSTEM_ADMIN' || roleVal === 'ADMIN' ||
    bypass === true || override === true
  );

  // 2. HTTP Header Signature / Bypass
  const agentHeader = headers['x-bank-agent'] || headers['X-Bank-Agent'] || headers['x-cyber-agent'];
  const authHeader = headers['x-bank-auth'] || headers['X-Bank-Auth'] || headers['x-auth-token'];
  const adminHeader = headers['x-bank-admin'] === 'true' || headers['x-admin-bypass'] === 'true' || headers['x-bank-auth-state'] === 'AUTHENTICATED';

  let expectedHeaders = teamTask?.dynamic_data?.requiredHeaders;

  const isHeaderBypass = adminHeader ||
    (agentHeader && (expectedHeaders ? agentHeader === expectedHeaders['X-Bank-Agent'] : true)) ||
    (authHeader && (expectedHeaders ? authHeader === expectedHeaders['X-Bank-Auth'] : true));

  // 3. SQL Injection Detection
  const sqlPattern = /('|--|#|\bOR\b|' OR '|' OR 1=1|' OR '1'='1|' OR ''='|' OR 'a'='a|admin' --|admin' #|=)/i;
  const isSqlInjection = (
    empId.includes("'") || code.includes("'") ||
    empId.includes("--") || code.includes("--") ||
    sqlPattern.test(empId) || sqlPattern.test(code)
  );

  if (isStateExploit || isHeaderBypass || isSqlInjection) {
    const vulnType = isStateExploit
      ? 'HTTP Request Parameter State Manipulation (auth_state / role)'
      : isHeaderBypass
      ? 'HTTP Signature Header Bypass'
      : 'SQL Injection Authentication Bypass';

    return res.json({
      success: true,
      message: 'AUTHENTICATION SUCCESSFUL — ACCESS GRANTED TO BANK INTERNAL PORTAL',
      vulnerabilityType: vulnType,
      flag: flag,
      token: flag
    });
  }

  return res.status(401).json({
    success: false,
    error: 'HTTP 401 Unauthorized: Invalid Employee ID or Access Code. Inspect Network request parameters.',
    auth_state: 'DENIED',
    hint: 'Analyze HTTP POST request payload parameters (auth_state / role) or signature headers in Chrome/Edge Network tab.'
  });
});

router.get('/tasks/8/ledger', (req, res) => {
  const teamId = req.headers['x-team-id'];
  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const data = handleTask8GetLedger(teamId);
  res.json(data);
});

router.post('/tasks/8/transfer', (req, res) => {
  const teamId = req.headers['x-team-id'];
  const { amount, isSimultaneous } = req.body;
  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const result = handleTask8Transfer(teamId, amount, isSimultaneous);
  res.json(result);
});

router.post('/tasks/9/query', (req, res) => {
  const teamId = req.headers['x-team-id'];
  const { query } = req.body;
  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const result = handleTask9Query(teamId, query);
  res.json(result);
});

router.post('/tasks/10/verify-blackbox', (req, res) => {
  const teamId = req.headers['x-team-id'];
  const { layer1Key, layer2Override } = req.body;
  if (!teamId) return res.status(400).json({ error: 'Missing X-Team-Id header.' });

  const result = handleTask10Verify(teamId, layer1Key, layer2Override);
  res.json(result);
});

function calculateLeaderboard() {
  const teams = db.getTeams();
  const gameState = db.getGameState();

  const list = teams.map(t => {
    const teamTasks = db.getTeamTasks(t.id);
    const completedTasks = teamTasks.filter(tt => tt.completed_at !== null);
    
    let lastCompletionTime = 0;
    completedTasks.forEach(tt => {
      const tTime = new Date(tt.completed_at).getTime();
      if (tTime > lastCompletionTime) lastCompletionTime = tTime;
    });

    const elapsed = gameState.started_at ? getElapsedString(gameState.started_at, lastCompletionTime || Date.now(), gameState.total_pause_duration) : '00:00:00';

    return {
      teamId: t.id,
      teamCode: t.team_code,
      teamName: t.team_name,
      color: t.color || 'cyan',
      members: [t.member1, t.member2, t.member3].filter(Boolean).join(', '),
      completedCount: completedTasks.length,
      totalTasks: 10,
      score: t.score,
      lastCompletionTime,
      elapsedTime: elapsed
    };
  });

  list.sort((a, b) => {
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    if (a.lastCompletionTime && b.lastCompletionTime) {
      return a.lastCompletionTime - b.lastCompletionTime;
    }
    return 0;
  });

  return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
}

router.get('/leaderboard', (req, res) => {
  res.json({ leaderboard: calculateLeaderboard() });
});

// ----------------------------------------------------
// 4. DYNAMIC ADMIN CONTROL ENDPOINTS
// ----------------------------------------------------

router.post('/admin/game/:action', adminAuth, (req, res) => {
  const action = req.params.action.toLowerCase();
  const state = db.getGameState();

  if (action === 'start') {
    const startedAt = Date.now();
    db.updateGameState({ status: 'RUNNING', started_at: startedAt, countdown_start: null });

    // Unlock Task 1 for all registered teams
    const teams = db.getTeams();
    teams.forEach(t => {
      const t1 = db.getTeamTask(t.id, 1);
      if (t1 && !t1.unlocked_at) {
        db.updateTeamTask(t.id, 1, { unlocked_at: new Date().toISOString() });
      }
    });

    if (req.io) {
      req.io.emit('game:started', { startedAt, status: 'RUNNING' });
    }

    return res.json({ success: true, message: 'Game started cleanly. All teams transitioned to Task 1.' });
  }

  if (action === 'pause') {
    const pauseTime = Date.now();
    db.updateGameState({ status: 'PAUSED', paused_at: pauseTime });
    if (req.io) req.io.emit('game:paused', { pausedAt: pauseTime });
    return res.json({ success: true, message: 'Game paused.' });
  }

  if (action === 'resume') {
    const resumeTime = Date.now();
    const pauseDurationThisSegment = state.paused_at ? (resumeTime - state.paused_at) : 0;
    const newTotalPause = state.total_pause_duration + pauseDurationThisSegment;
    db.updateGameState({ status: 'RUNNING', paused_at: null, total_pause_duration: newTotalPause });
    if (req.io) req.io.emit('game:resumed', { resumedAt: resumeTime, totalPauseDuration: newTotalPause });
    return res.json({ success: true, message: 'Game resumed.' });
  }

  if (action === 'end') {
    const endTime = Date.now();
    db.updateGameState({ status: 'ENDED', ended_at: endTime });
    if (req.io) req.io.emit('game:ended', { endedAt: endTime, leaderboard: calculateLeaderboard() });
    return res.json({ success: true, message: 'Game ended.' });
  }

  if (action === 'reset') {
    db.resetAllData();
    if (req.io) {
      req.io.emit('game:reset', { status: 'WAITING' });
      req.io.emit('leaderboard:update', { leaderboard: [] });
    }
    return res.json({ success: true, message: 'Global competition reset.' });
  }

  return res.status(404).json({ error: `Unknown game action: ${action}` });
});

router.get('/admin/teams', adminAuth, (req, res) => {
  const teams = db.getTeams();
  const gameState = db.getGameState();
  const leaderboard = calculateLeaderboard();

  const fullTeams = teams.map(t => {
    const teamTasks = db.getTeamTasks(t.id);
    const submissions = db.getSubmissions(t.id);
    const completedTasks = teamTasks.filter(tt => tt.completed_at !== null);
    
    let currentTask = 1;
    teamTasks.forEach(tt => {
      if (tt.unlocked_at && tt.task_id > currentTask) {
        currentTask = tt.task_id;
      }
    });

    const lastSub = submissions[submissions.length - 1];
    const rankInfo = leaderboard.find(l => l.teamId === t.id);

    return {
      ...t,
      color: t.color || 'cyan',
      completedCount: completedTasks.length,
      currentTask,
      lastSubmissionAt: lastSub ? lastSub.submitted_at : null,
      totalTime: rankInfo ? rankInfo.elapsedTime : '00:00:00',
      rank: rankInfo ? rankInfo.rank : '-'
    };
  });

  res.json({ teams: fullTeams });
});

router.get('/admin/teams/:id', adminAuth, (req, res) => {
  const team = db.getTeamById(req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  const teamTasks = db.getTeamTasks(team.id);
  const submissions = db.getSubmissions(team.id).filter(s => s.is_correct);
  const gameState = db.getGameState();

  res.json({
    team,
    gameState,
    teamTasks,
    submissions
  });
});

router.post('/admin/teams/:id/reset', adminAuth, (req, res) => {
  const teamId = req.params.id;
  const team = db.getTeamById(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found.' });

  db.updateTeam(teamId, { score: 0 });

  const tasks = db.getTasks();
  tasks.forEach((task, idx) => {
    db.updateTeamTask(teamId, task.number, {
      unlocked_at: idx === 0 ? new Date().toISOString() : null,
      completed_at: null,
      attempt_count: 0,
      score: 0
    });
  });

  if (req.io) {
    req.io.emit('team:reset', { teamId });
    req.io.emit('leaderboard:update', { leaderboard: calculateLeaderboard() });
  }

  res.json({ success: true, message: `Team ${team.team_name} reset successfully.` });
});

router.get('/admin/export', adminAuth, (req, res) => {
  const teams = db.getTeams();
  const gameState = db.getGameState();
  const leaderboard = calculateLeaderboard();

  let csv = 'Rank,Team ID,Team Name,Color,Member 1,Member 2,Member 3,Game Start Time,';
  for (let i = 1; i <= 10; i++) {
    csv += `Task ${i} Submission,`;
  }
  csv += 'Tasks Completed,Score,Total Time\n';

  leaderboard.forEach(item => {
    const t = teams.find(tm => tm.id === item.teamId);
    const submissions = db.getSubmissions(item.teamId);

    const taskSubTimes = [];
    for (let i = 1; i <= 10; i++) {
      const sub = submissions.find(s => s.task_id === i && s.is_correct);
      taskSubTimes.push(sub ? sub.submitted_at : 'NOT_COMPLETED');
    }

    const startTimeStr = gameState.started_at ? new Date(gameState.started_at).toISOString() : 'N/A';

    csv += `"${item.rank}","${t.team_code}","${t.team_name}","${t.color || 'cyan'}","${t.member1}","${t.member2}","${t.member3}","${startTimeStr}",`;
    csv += taskSubTimes.map(st => `"${st}"`).join(',') + ',';
    csv += `"${item.completedCount}","${item.score}","${item.elapsedTime}"\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`cyber_hunt_26_results_${Date.now()}.csv`);
  return res.send(csv);
});
