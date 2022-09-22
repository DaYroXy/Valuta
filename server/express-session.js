const session = require("express-session");
const MongoStore = require("connect-mongo");

const day = 1000 * 60 * 60 * 24;

const sessionMiddleware = session({
    secret: "asdklawjfdio2jnioamndlk2",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: day * 30
    },
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/Valuta' })
});




const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

module.exports = {sessionMiddleware, wrap};