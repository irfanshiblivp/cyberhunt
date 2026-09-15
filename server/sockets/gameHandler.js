import { db } from '../db.js';

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

    // Client requests current game state sync
    socket.on('game:sync_request', () => {
      const state = db.getGameState();
      socket.emit('game:state_sync', state);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}
