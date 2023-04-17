const dotenv = require('dotenv');
dotenv.config({ silent: true });
// if (env.error) throw env.error;
var express = require('express');
const http = require("http");
var createError = require('http-errors');
// const asyncErrors = require('express-async-errors');
require('express-async-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
// middleware for logging HTTP requests
var morgan = require('morgan');
// winston for log different types of data to different destinations
const csrf = require('csurf');
const csrfProtection = csrf();

const app = express();

// Connect to MongoDB
const configureMongoDB = require('@config/mongodb.config');
configureMongoDB(process.env.MONGODB_DEV_URI, { useNewUrlParser: true, useUnifiedTopology: true })
// Connect to SocketIO
const configureSocketIO = require("@config/socketio.config");
const server = http.createServer(app);
const io = configureSocketIO(server);
// logging REST APIs
app.use(morgan('combined'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Cookies
app.use(cookieParser());
// session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
// CSRF
app.use(csrfProtection, (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
// app.use(asyncErrors);
const { errorHandler } = require('@middlewares/errors.middleware')
app.use(errorHandler)

const authRestMiddleware = require("@middlewares/auth.rest.middleware");
const authSocketMiddleware = require("@middlewares/auth.socket.middleware");
// Requiring REST Routes
var adminRouter = require('@routes/admin.routes');
var privateRouter = require('@routes/private.routes');
var publicRouter = require('@routes/public.routes');
// Using REST Routes
app.use('/api/admin', adminRouter);
app.use('/api/private', privateRouter);
app.use('/api/public', publicRouter);

// Requiring Socket Routes
io.of("/admin").use(authSocketMiddleware)
io.of("/private").use(authSocketMiddleware)
io.of("/public")
require("@services/third/socket/admin.socket.service")(io.of("/admin"));
require("@services/third/socket/private.socket.service.js")(io.of("/private"));
require("@services/third/socket/public.socket.service.js")(io.of("/public"));
// Alternative: to define them before using
// adminSocketService(io.of("/admin"));
// privateSocketService(io.of("/private"));
// publicSocketService(io.of("/public"));

const Logger = require('@services/third/winston/winston.service');
const logger = new Logger('app');

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server listening: ${PORT}`));

module.exports = app