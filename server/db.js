import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateUniqueFlag, generateTeamTaskPayload } from './utils/flagGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// CYBER HUNT '26 — THE BANK ROBBERY TASK DEFINITIONS
const initialSchema = {
  game_state: {
    id: 1,
    status: 'WAITING',
    started_at: null,
    paused_at: null,
    ended_at: null,
    total_pause_duration: 0,
    countdown_start: null,
    is_leaderboard_visible: true
  },
  tasks: [
    {
      id: 1,
      number: 1,
      title: 'The Torn Message',
      subtitle: 'Evidence #1: Crime Scene Jigsaw',
      description: 'Twelve pieces of a torn photo/document were recovered from the bank crime scene. Reconstruct the 12 jigsaw pieces to reveal the key word.',
      points: 50,
      difficulty: 'Easy'
    },
    {
      id: 2,
      number: 2,
      title: 'The Encoded Word',
      subtitle: 'Evidence #2: Encoded Key Stream',
      description: 'The keyword from the torn message leads to a second piece of evidence containing an encoded message. Identify the encoding to reveal the flag.',
      points: 60,
      difficulty: 'Easy'
    },
    {
      id: 3,
      number: 3,
      title: 'The Decoded Text',
      subtitle: 'Evidence #3: Visit /K7mQ-4vNp-X2',
      description: 'The decoded key from Task 2 directs you to open page /K7mQ-4vNp-X2. Open the page and inspect its HTML source code to uncover the hidden clue.',
      points: 70,
      difficulty: 'Easy'
    },
    {
      id: 4,
      number: 4,
      title: 'The Hidden Archive',
      subtitle: 'Evidence #4: Web Discovery & robots.txt',
      description: 'The HTML clue leads to a hidden location. Inspect /robots.txt to discover the disallow directory hiding the bank\'s auxiliary vault evidence.',
      points: 80,
      difficulty: 'Easy-Medium'
    },
    {
      id: 5,
      number: 5,
      title: 'The Bank Statement',
      subtitle: 'Evidence #5: Obfuscated Transaction Log',
      description: 'Inside the auxiliary vault, an intercepted transaction payload has been multi-encoded to conceal the key stream. Analyze and reverse the transformation layers to extract the Task 5 flag.',
      points: 90,
      difficulty: 'Medium'
    },
    {
      id: 6,
      number: 6,
      title: 'The Security Camera',
      subtitle: 'Evidence #6: Image Timestamp Analysis',
      description: 'Analyze security photo image.jpg recovered from the bank security system. Download image.jpg and find the exact time the photo was taken (HH:MM:SS).',
      points: 100,
      difficulty: 'Medium'
    },
    {
      id: 7,
      number: 7,
      title: 'The Bank\'s Login System',
      subtitle: 'Evidence #7: Authentication Logic Analysis',
      description: 'The robbers managed to access the bank\'s internal system. Access /login and inspect the HTTP request/response flow using Chrome/Edge DevTools (Network tab) to discover how the authentication logic was bypassed.',
      points: 120,
      difficulty: 'Hard'
    },
    {
      id: 8,
      number: 8,
      title: 'The Visitor That Never Existed',
      subtitle: 'Evidence #8: Campus Visitor Logic Analysis',
      description: 'Investigate transaction logs showing visitor COLLEGE-WEB at 03:17:42. Open /college, check visitor VST-4821, analyze request transformations, and locate archive ARCH-27 to restore the record and recover the Task 8 flag.',
      points: 150,
      difficulty: 'Hard'
    },
    {
      id: 9,
      number: 9,
      title: 'The Vanishing Employee',
      subtitle: 'Evidence #9: Browser Storage & State Transition',
      description: 'Investigate missing employee EMP-4817 at /employees. Analyze browser Local Storage state transitions (directory_mode = archive) and execute recovery code R4-91-X to restore the record and extract the Task 9 flag.',
      points: 180,
      difficulty: 'Hard+'
    },
    {
      id: 10,
      number: 10,
      title: 'The Robbers\' Vault Core',
      subtitle: 'Evidence #10: Multi-Layer Cryptographic & Forensic Analysis',
      description: 'Reconstruct the 10-stage cyber investigation. Triangulate primary evidence parameters (Task 5 TX ID, Task 8 Transfer/Archive ID, Task 9 Case Ref), perform double-Base64 decoding, XOR key stream extraction, and Master Access Code override to unlock BLACK_BOX_10.',
      points: 250,
      difficulty: 'Extreme Final'
    }
  ],
  teams: [],
  team_tasks: [],
  submissions: [],
  admin: {
    username: process.env.ADMIN_USER || 'cyb_26',
    password: process.env.ADMIN_PASSWORD || 'CeMCyb@26'
  }
};

// ----------------------------------------------------
// FIREBASE INITIALIZATION ENGINE
// ----------------------------------------------------
let firestoreDb = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    firestoreDb = getFirestore();
    console.log('[FIREBASE] Connected to Firebase Firestore successfully via FIREBASE_SERVICE_ACCOUNT.');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    firestoreDb = getFirestore();
    console.log('[FIREBASE] Connected to Firebase Firestore successfully via Environment Credentials.');
  } else {
    console.log('[DB] Firebase environment variables not set. Using local database.json storage.');
  }
} catch (err) {
  console.error('[FIREBASE] Initialization Failed:', err.message);
  firestoreDb = null;
}

class HybridDB {
  constructor() {
    this.data = this.load();
    this.data.tasks = initialSchema.tasks;
    if (this.data.admin) {
      this.data.admin.username = process.env.ADMIN_USER || 'cyb_26';
      this.data.admin.password = process.env.ADMIN_PASSWORD || 'CeMCyb@26';
    }
    this.migrateTasks();
    this.save();
    if (firestoreDb) {
      this.syncFromFirebase();
    }
  }

  async syncFromFirebase() {
    if (!firestoreDb) return;
    try {
      const stateSnap = await firestoreDb.collection('game_state').doc('current').get();
      if (stateSnap.exists) {
        this.data.game_state = stateSnap.data();
      }

      const teamsSnap = await firestoreDb.collection('teams').get();
      if (!teamsSnap.empty) {
        this.data.teams = teamsSnap.docs.map(doc => doc.data());
      }

      const teamTasksSnap = await firestoreDb.collection('team_tasks').get();
      if (!teamTasksSnap.empty) {
        this.data.team_tasks = teamTasksSnap.docs.map(doc => doc.data());
      }

      const subSnap = await firestoreDb.collection('submissions').get();
      if (!subSnap.empty) {
        this.data.submissions = subSnap.docs.map(doc => doc.data());
      }

      this.migrateTasks();
      this.save();
      console.log('[FIREBASE] Synced state & teams from Firestore.');
    } catch (e) {
      console.error('[FIREBASE] Sync error:', e.message);
    }
  }

  migrateTasks() {
    this.data.tasks = initialSchema.tasks;
    if (!this.data.teams) this.data.teams = [];
    if (!this.data.team_tasks) this.data.team_tasks = [];
    this.data.teams.forEach(team => {
      this.data.tasks.forEach((task, idx) => {
        const flag = generateUniqueFlag(team.team_code, task.number);
        const dynamicData = generateTeamTaskPayload(team.team_code, task.number, flag);
        const taskFlag = dynamicData.flag || flag;

        let existing = this.data.team_tasks.find(tt => tt.team_id === team.id && tt.task_id === task.number);
        if (!existing) {
          const newTt = {
            id: `tt_${team.id}_${task.number}`,
            team_id: team.id,
            task_id: task.number,
            unique_flag: taskFlag,
            dynamic_data: dynamicData,
            unlocked_at: (idx === 0 || task.number === 6) ? new Date().toISOString() : null,
            completed_at: null,
            attempt_count: 0,
            score: 0
          };
          this.data.team_tasks.push(newTt);
          if (firestoreDb) {
            firestoreDb.collection('team_tasks').doc(newTt.id).set(newTt, { merge: true }).catch(() => {});
          }
        } else {
          existing.unique_flag = taskFlag;
          existing.dynamic_data = dynamicData;
          if (task.number === 6 && !existing.unlocked_at) {
            existing.unlocked_at = new Date().toISOString();
          }
          if (firestoreDb) {
            firestoreDb.collection('team_tasks').doc(existing.id).set(existing, { merge: true }).catch(() => {});
          }
        }
      });
    });
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed to load DB file:', err.message);
    }
    this.save(initialSchema);
    return JSON.parse(JSON.stringify(initialSchema));
  }

  save(dataToSave = this.data) {
    try {
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to write DB file:', err.message);
    }
  }

  getGameState() {
    return this.data.game_state;
  }

  updateGameState(updates) {
    this.data.game_state = { ...this.data.game_state, ...updates };
    this.save();
    if (firestoreDb) {
      firestoreDb.collection('game_state').doc('current').set(this.data.game_state, { merge: true }).catch(() => {});
    }
    return this.data.game_state;
  }

  getTasks() {
    return this.data.tasks;
  }

  updateTask(taskId, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === Number(taskId));
    if (idx !== -1) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
      this.save();
      return this.data.tasks[idx];
    }
    return null;
  }

  getTeams() {
    return this.data.teams;
  }

  getTeamById(id) {
    return this.data.teams.find(t => t.id === id);
  }

  getTeamByCode(teamCode) {
    return this.data.teams.find(t => t.team_code.toUpperCase() === teamCode.toUpperCase());
  }

  createTeam(teamData) {
    this.data.teams.push(teamData);
    this.save();
    if (firestoreDb) {
      firestoreDb.collection('teams').doc(teamData.id).set(teamData).catch(() => {});
    }
    return teamData;
  }

  updateTeam(id, updates) {
    const idx = this.data.teams.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.teams[idx] = { ...this.data.teams[idx], ...updates };
      this.save();
      if (firestoreDb) {
        firestoreDb.collection('teams').doc(id).set(this.data.teams[idx], { merge: true }).catch(() => {});
      }
      return this.data.teams[idx];
    }
    return null;
  }

  deleteTeam(id) {
    this.data.teams = this.data.teams.filter(t => t.id !== id);
    this.data.team_tasks = this.data.team_tasks.filter(tt => tt.team_id !== id);
    this.data.submissions = this.data.submissions.filter(s => s.team_id !== id);
    this.save();
    if (firestoreDb) {
      firestoreDb.collection('teams').doc(id).delete().catch(() => {});
    }
  }

  getTeamTasks(teamId) {
    return this.data.team_tasks.filter(tt => tt.team_id === teamId);
  }

  getTeamTask(teamId, taskId) {
    return this.data.team_tasks.find(tt => tt.team_id === teamId && tt.task_id === Number(taskId));
  }

  createTeamTask(teamTaskData) {
    this.data.team_tasks.push(teamTaskData);
    this.save();
    if (firestoreDb) {
      firestoreDb.collection('team_tasks').doc(teamTaskData.id).set(teamTaskData).catch(() => {});
    }
    return teamTaskData;
  }

  updateTeamTask(teamId, taskId, updates) {
    const idx = this.data.team_tasks.findIndex(tt => tt.team_id === teamId && tt.task_id === Number(taskId));
    if (idx !== -1) {
      this.data.team_tasks[idx] = { ...this.data.team_tasks[idx], ...updates };
      this.save();
      if (firestoreDb) {
        firestoreDb.collection('team_tasks').doc(this.data.team_tasks[idx].id).set(this.data.team_tasks[idx], { merge: true }).catch(() => {});
      }
      return this.data.team_tasks[idx];
    }
    return null;
  }

  getSubmissions(teamId = null) {
    if (teamId) {
      return this.data.submissions.filter(s => s.team_id === teamId);
    }
    return this.data.submissions;
  }

  addSubmission(submissionData) {
    this.data.submissions.push(submissionData);
    this.save();
    if (firestoreDb) {
      firestoreDb.collection('submissions').doc(submissionData.id).set(submissionData).catch(() => {});
    }
    return submissionData;
  }

  getAdmin() {
    return this.data.admin;
  }

  async resetAllData() {
    this.data = JSON.parse(JSON.stringify(initialSchema));
    this.save();

    if (firestoreDb) {
      try {
        await firestoreDb.collection('game_state').doc('current').set(initialSchema.game_state);
        
        const deleteCollection = async (collName) => {
          const snap = await firestoreDb.collection(collName).get();
          const batch = firestoreDb.batch();
          snap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        };

        await deleteCollection('teams');
        await deleteCollection('team_tasks');
        await deleteCollection('submissions');
        console.log('[FIREBASE] Purged all Firebase Firestore collections for game reset.');
      } catch (err) {
        console.error('[FIREBASE] Reset error:', err.message);
      }
    }
  }
}

export const db = new HybridDB();
