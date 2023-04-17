const Logger = require('../winston/winston.service');
const logger = new Logger('admin.socket.service');

function adminSocket(io) {
    io.on("connection", (socket) => {
        logger.info("Admin user connected");

        socket.on("disconnect", () => { });
        socket.on("join-auction-room", () => { })
        socket.on("leave-auction-room", () => { })
        socket.on("new-auction", () => { })
        socket.on("update-auction", () => { })
        socket.on("delete-auction", () => { })
    });
}

module.exports = adminSocket;