
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const server = require('http').createServer(app)
const { sessionMiddleware, wrap } = require('./server/express-session');
const User = require('./classes/user');
const PORT = 4200;


// MongoDb Setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Valuta', { useNewUrlParser: true });

// Socket.io Setup
const io = require('socket.io')(server);

// Add packages to app
app.use(cors());
app.set("io", io);
app.set('server', server);
app.use(fileUpload());
app.use(sessionMiddleware);

// Setup view engine as .ejs files
app.set('view engine', 'ejs')

// Body Parsers, to enable JSON and url params
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));

// If json is invalid, return a 400 error
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json(
            {
                "status": "error",
                "message": "JSON syntax error"
            }
        );
    }
});

// make public folder as public to allow styles/scripts to be accessable
app.use(express.static('public'));
app.use('/styles', express.static(__dirname + "public/styles"))

// Home Page
app.get('/', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    res.render('index', { user })
})

// Messages Page
app.get('/messages', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    res.render('messages', { user })
})

// Rooms Page
app.get('/rooms', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    res.render('rooms', { user })
})

// Profie Page
app.get('/profile', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    let visitedUser = user;
    res.render('profile', { user, visitedUser })
})

// get user profile
app.get("/profile/:username", async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }

    const username = req.params.username
    var visitedUser = await new User().getUserByUsername(username);

    if (visitedUser.status === "error") {
        res.redirect('/')
        return;
    }

    // Render
    res.render('profile', { user, visitedUser })
})

// APIS
app.use("/api/v1", require("./routes/api.routes"));
app.get('/entry', (req, res) => {
    const error = req.query;
    res.render('entry', error)
})

// Allow socket to use session Middle ware
io.use(wrap(sessionMiddleware));

// make sure to check if user is connected before allowing socket
io.use((socket, next) => {
    const session = socket.request.session;
    if (session && session.user) {
        next();
    } else {
        next(new Error("unauthorized"));
    }
});

// Socket Connection
io.on("connection", async (socket) => {

    // Get use data
    let userSession = await socket.request.session.user
    let user = new User();

    // User disconnected
    socket.on("disconnect", async (data) => {
        await user.getUserById(userSession.id);
        await user.removeSocket(socket.id)
        console.log(userSession.username + ": disconnected")
    })

    // User connected
    console.log(userSession.username + ": connected")
    await user.getUserById(userSession.id);
    await user.addSocket(socket.id);
});

// Server Listener
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})