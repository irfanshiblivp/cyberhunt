import { db } from '../db.js';

const COLOR_PALETTE = ['cyan', 'red', 'lime', 'purple', 'orange', 'yellow', 'pink', 'blue', 'green', 'white', 'black', 'brown'];

let lobbyPlayers = {};

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Join team or admin room
    socket.on('join:room', ({ role, teamId }) => {
      if (role === 'admin') {
        socket.join('admin_room');
      } else if (teamId) {
        socket.join(`team_${teamId}`);
      }
    });

    // Among Us Lobby Join & Synchronized Movement
    socket.on('lobby:join', (playerData) => {
      socket.join('lobby_room');
      if (playerData && playerData.teamId) {
        // Remove old socket for same team if any
        Object.keys(lobbyPlayers).forEach(sid => {
          if (lobbyPlayers[sid].teamId === playerData.teamId) {
            delete lobbyPlayers[sid];
          }
        });

        // Pick distinct color based on active team count
        const activeCount = Object.keys(lobbyPlayers).length;
        const assignedColor = playerData.color && playerData.color !== 'cyan' 
          ? playerData.color 
          : COLOR_PALETTE[activeCount % COLOR_PALETTE.length];

        lobbyPlayers[socket.id] = {
          socketId: socket.id,
          teamId: playerData.teamId,
          teamCode: playerData.teamCode || 'TEAM',
          teamName: playerData.teamName || 'Crewmate',
          color: assignedColor,
          x: playerData.x || (20 + Math.random() * 60),
          y: playerData.y || (20 + Math.random() * 60)
        };
        io.to('lobby_room').emit('lobby:players_update', Object.values(lobbyPlayers));
      }
    });

    socket.on('lobby:move', ({ x, y }) => {
      if (lobbyPlayers[socket.id]) {
        lobbyPlayers[socket.id].x = Math.max(5, Math.min(95, x));
        lobbyPlayers[socket.id].y = Math.max(15, Math.min(88, y));
        io.to('lobby_room').emit('lobby:players_update', Object.values(lobbyPlayers));
      }
    });

    // Client requests current game state sync
    socket.on('game:sync_request', () => {
      const state = db.getGameState();
      socket.emit('game:state_sync', state);
    });

    socket.on('disconnect', () => {
      if (lobbyPlayers[socket.id]) {
        delete lobbyPlayers[socket.id];
        io.to('lobby_room').emit('lobby:players_update', Object.values(lobbyPlayers));
      }
    });
  });
}
