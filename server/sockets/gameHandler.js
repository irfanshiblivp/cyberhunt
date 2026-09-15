import { db } from '../db.js';

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

        lobbyPlayers[socket.id] = {
          socketId: socket.id,
          teamId: playerData.teamId,
          teamCode: playerData.teamCode || 'TEAM',
          teamName: playerData.teamName || 'Crewmate',
          color: playerData.color || 'cyan',
          x: playerData.x || (40 + Math.random() * 20),
          y: playerData.y || (50 + Math.random() * 20)
        };
        io.to('lobby_room').emit('lobby:players_update', Object.values(lobbyPlayers));
      }
    });

    socket.on('lobby:move', ({ x, y }) => {
      if (lobbyPlayers[socket.id]) {
        lobbyPlayers[socket.id].x = Math.max(12, Math.min(88, x));
        lobbyPlayers[socket.id].y = Math.max(22, Math.min(82, y));
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
