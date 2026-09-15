# 🛸 CYBER HUNT ’26 — Complete Event Web Application

**A Beginner-to-Advanced Cybersecurity Competition Platform inspired by Among Us**

Designed for 100% offline, local network (LAN) execution during college/event cybersecurity competitions on Windows machines.

---

## 🌟 Key Features

1. **Among Us Spaceship Aesthetic**: Dark space atmosphere, animated starfields, custom vector crewmate avatars, futuristic mission control panels, and synthesized Web Audio API sound effects.
2. **10 Sequential Missions**:
   - **Task 1**: The First Trace (*Base64 Decoding*)
   - **Task 2**: The Broken Program (*C Debugging & Virtual Compiler Sandbox*)
   - **Task 3**: What the Page Doesn't Show (*HTML DOM Source Inspection*)
   - **Task 4**: The Forgotten Door (*robots.txt Web Discovery*)
   - **Task 5**: The Broken Note (*Hex Dump Conversion*)
   - **Task 6**: The Photograph (*Image EXIF Metadata Forensics*)
   - **Task 7**: The Silent Request (*Advanced HTTP Header Analysis*)
   - **Task 8**: The Race Against the Ledger (*Stateful Business Logic & Race Condition*)
   - **Task 9**: The Database Maze (*Blind Boolean-Based SQL Injection*)
   - **Task 10**: The Black Box (*Multi-Stage Chained Evidence Portal*)
3. **Anti-Cheating Design**:
   - Cryptographically randomized flags generated per team per task (`CYBER{XXXX-XXXX-XXXX}`).
   - Stateful dynamic account IDs, passcodes, and transaction payloads for Tasks 8–10 (preventing flag sharing across teams).
   - Strict server-side task unlock sequence enforcement.
4. **Server Game Controls & Timer Sync**:
   - Master **START GAME**, **PAUSE**, **RESUME**, and **END** controls from Admin.
   - Synchronized 3-2-1 **MISSION STARTING** countdown broadcast globally to all team screens.
   - Server-calculated official competition clock (`started_at`, `total_pause_duration`).
5. **Real-Time Admin Dashboard**:
   - Live WebSocket monitoring of team progress, scores, rankings, and submission timestamps.
   - Detailed team submission history drawers ($T_{start} \to T_{sub}$ and $T_{n-1} \to T_n$).
   - One-click **CSV Export** for official leaderboard reporting.

---

## 🚀 Quick Start Guide (Windows Localhost / LAN)

### Step 1: Install Dependencies

Open PowerShell or Command Prompt in the project folder and run:

```bash
npm install
```

### Step 2: Start the Event Server

Run the development server:

```bash
npm run dev
```

The Express API + WebSockets backend will launch on `http://localhost:3001`, and the Vite frontend will run on `http://localhost:3000`.

---

## 🌐 Local Network (LAN) Setup for Participants

To allow student laptops on the same Wi-Fi or LAN switch to connect:

1. Open PowerShell on the host Windows machine and find your LAN IP:
   ```powershell
   ipconfig
   ```
   Look for your **IPv4 Address** (e.g. `192.168.1.100`).

2. Share the event URL with students:
   ```text
   http://192.168.1.100:3000
   ```

*No student tools (Kali Linux, Wireshark, Burp Suite, Python) are required! Students only need Chrome or Edge.*

---

## 🔑 Admin Login Credentials

- **Username**: `admin`
- **Password**: `cyberhunt26!`

---

## 📋 Organizer Event Workflow

1. **Admin Login**: Log into the Admin Panel tab using the credentials above.
2. **Team Registration**: Have teams register their Team Name and up to 3 Member Names on their browser tabs. Save their generated **Team ID** and **Access Code**.
3. **Waiting Lobby**: Teams enter the Among Us Spaceship Lobby (`WAITING FOR GAME START...`).
4. **Start Competition**: In the Admin Control Center, click **START GAME**.
5. **3-2-1 Countdown**: All connected teams hear the countdown beep and automatically transition to **GAME STARTED**.
6. **Live Submissions**: Monitor team progress, task completion times, and leaderboard in real-time.
7. **Pause / Resume**: Click **PAUSE GAME** if an announcement is needed; timers will freeze until **RESUME GAME** is clicked.
8. **End & Export**: Click **END COMPETITION** and click **EXPORT RESULTS CSV** to download complete event statistics.
