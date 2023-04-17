const socketio = require("socket.io");

function configureSocketIO(server) {
    const io = socketio(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    return io;
}

module.exports = configureSocketIO;