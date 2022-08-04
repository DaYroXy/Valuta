const session = require("express-session");

const day = 1000 * 60 * 60 * 24;

const sessionMiddleware = session({
    secret: "asdklawjfdio2jnioamndlk2",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: day * 30
    }
});




const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

module.exports = {sessionMiddleware, wrap};