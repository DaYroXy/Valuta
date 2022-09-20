
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const server = require('http').createServer(app)
const { sessionMiddleware, wrap } = require('./server/express-session');
const User = require('./classes/user');
const Major = require("./classes/major");
const Room = require("./classes/room");
const Post = require("./classes/post");
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
app.use(fileUpload({
    safeFileNames: true,
    preserveExtension: true
}));
app.use(sessionMiddleware);

// Reset all users status on startup
new User().resetAllUserStatus();

// Check if at least 1 major exists if not create 1
new Major().checkIfMajorExists();

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
app.get('/', async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    
    const page = "home"
    res.render('index', { user, page })
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
app.get('/rooms', async (req, res) => {
    const user = req.session.user
    
// Roomm, Major

    if (!user) {
        res.redirect('/entry')
        return;
    }
    const major = new Major();
    const room = new Room();
    let majors = await major.getRelated(user.major);
    let rooms = await room.getRelated(majors);

    res.render('rooms', { user, rooms })
})

// settings Page
app.get('/settings', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    
    let visitedUser = user;
    const page = "settings"

    res.render('settings', { user, visitedUser, page })
})

// Profie Page
app.get('/profile', (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    
    let visitedUser = user;
    const page = "profile"

    res.render('profile', { user, visitedUser, page })
})

// Profie Page
app.get('/post/:id', async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }

    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.redirect("/")
    }
    
    
    let post = new Post();
    await post.getPostById(req.params.id);
    let postData = await post.getPostById(req.params.id)

    let postUser = new User();
    let userData = await postUser.getUserById(postData.userId);
    if(!userData) {
        res.redirect("/")
    }
    const Rank = require('./models/Rank.model');
    let rank = await Rank.findOne({ userId: user.id });

    const PostInformation = {
        id: postData._id,
        content: postData.content,
        image: postData.image,
        createdAt: postData.createdAt,
        user: {
            id: userData._id,
            name: userData.name,
            username: userData.username,
            avatar: userData.avatar,
            bg_image: userData.bg_image,
            rank: rank.name
        }
    }
    console.log(PostInformation)

    let visitedUser = user;
    const page = "home"

    res.render('post', { user, PostInformation, page })
})


// get user profile
app.get("/profile/:username", async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }

    const username = req.params.username

    // check if user wants to access his own profile
    if(username == req.session.user.username) {
        res.redirect('/profile')
        return;
    }

    let userClass = new User()
    let visitedUser = await userClass.getUserByUsername(username);
    visitedUser.friends_count = await userClass.getFriendsCount()
    visitedUser.posts_count = await userClass.getUserPostsCount()
    if (visitedUser.status === "error") {
        res.redirect('/')
        return;
    }

    let me = new User();
    await me.getUserById(user.id);
    let friendStatus = await me.friendStatus(username);
    if(friendStatus.status === "error") {
        if(friendStatus.message !== "You are not friends with this user") {
            res.redirect(`/?error=${friendStatus.message}`)
            return;
        }
    }

    let isFriend = friendStatus.status;

    const page = "visit"
    // Render
    res.render('profile', { user, visitedUser, page, isFriend })
})

// APIS
app.use("/api/v1", require("./routes/api.routes"));
app.get('/entry', async (req, res) => {
    const error = req.query;
    let MajorsList = await new Major().getAll();
    res.render('entry', {error, MajorsList})
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
        io.emit("user-disconnected", await user.getUserById(userSession.id));
        await user.removeSocket(socket.id)
        
    })

    // User connected
    io.emit("user-connected", await user.getUserById(userSession.id));
    await user.addSocket(socket.id);
});

// Server Listener
server.listen(PORT, () => {
    console.log(`
\u001b[1;31m██╗░░░██╗░█████╗░██╗░░░░░██╗░░░██╗████████╗░█████╗░
██║░░░██║██╔══██╗██║░░░░░██║░░░██║╚══██╔══╝██╔══██╗
╚██╗░██╔╝███████║██║░░░░░██║░░░██║░░░██║░░░███████║
░╚████╔╝░██╔══██║██║░░░░░██║░░░██║░░░██║░░░██╔══██║
░░╚██╔╝░░██║░░██║███████╗╚██████╔╝░░░██║░░░██║░░██║
░░░╚═╝░░░╚═╝░░╚═╝╚══════╝░╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝\u001b[0m

Server Started on port: \u001b[1;31m${PORT}\u001b[0m
Host: \u001b[1;36mhttp://localhost:${PORT}/\u001b[0m
    `)
})