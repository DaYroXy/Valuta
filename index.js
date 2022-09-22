
const express = require('express');
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const server = require('http').createServer(app)
const { sessionMiddleware, wrap } = require('./server/express-session');
const si = require('systeminformation');
const User = require('./classes/user');
const Major = require("./classes/major");
const Room = require("./classes/room");
const Logs = require("./classes/logs");
const Post = require("./classes/post");
const Like = require("./models/Like.model");
const serverConf = require("./classes/server");
const PORT = 4200;

// MongoDb Setup
const mongoose = require('mongoose');
const { application } = require('express');

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

// // Reset all users status on startup
// new User().resetAllUserStatus();

// // Check if at least 1 major exists if not create 1
// new Major().checkIfMajorExists();

new serverConf().setupSever();


// Setup view engine as .ejs files
app.set('view engine', 'ejs')

// Body Parsers, to enable JSON and url params
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));

// LOGS CATCEHR
app.use((req, res, next) => {
    let url = req.originalUrl;
    if(req.method === "GET") {
        if(url.includes("/scripts") || url.includes("/images") || url.includes("/api") || url.includes("/styles") || url.includes("/uploads") || url.includes("/apple")){
            next();
            return;
        }
    }
    
    let headers = JSON.stringify(req.headers);

    if(headers.includes("Google Chrome")) {
        headers = "Google Chrome"
    } else if(headers.includes("Firefox")) {
        headers = "Firefox"
    } else if(headers.includes("Safari")) {
        headers = "Safari"
    } else if(headers.includes("Opera")) {
        headers = "Opera"
    } else if(headers.includes("Edge")) {
        headers = "Edge"
    } else {
        headers = "Unknown"
    }

    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
    
    if(ip === "::1") {
        ip = "localhost"
    }

    if(ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "")
    }

    new Logs(ip, headers, req.method)
    next()
})

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
    const me = new User();
    await me.getUserById(user.id);
    const rank = await me.getUserRank();

    res.render('index', { user, page, rank })
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
    
    // push new global
    res.render('rooms', { user, rooms })
})

// settings Page
app.get('/settings', async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    
    let visitedUser = user;
    const page = "settings"
    
    const me = new User();
    await me.getUserById(user.id);
    const rank = await me.getUserRank();

    res.render('settings', { user, visitedUser, page, rank })
})

// Profie Page
app.get('/profile', async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry')
        return;
    }
    
    let visitedUser = user;
    const page = "profile"

    const me = new User();
    await me.getUserById(user.id);
    const rank = await me.getUserRank();


    res.render('profile', { user, visitedUser, page, rank })
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

    let postLikes = await Like.find({postId: postData._id}).count()
    let amILikes = await Like.find({$and: [{userId: user.id}, {postId: postData._id}]}).count()
    const PostInformation = {
        id: postData._id,
        content: postData.content,
        image: postData.image,
        createdAt: postData.createdAt,
        likes: postLikes,
        meLike: amILikes,
        user: {
            id: userData._id,
            name: userData.name,
            username: userData.username,
            avatar: userData.avatar,
            bg_image: userData.bg_image,
            rank: rank.name
        }
    }

    let visitedUser = user;
    const page = "home"

    let me = new User();
    await me.getUserById(user.id);
    rank = await me.getUserRank();

    res.render('post', { user, PostInformation, page, rank })
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

    await me.getUserById(user.id);
    const rank = await me.getUserRank();
    // Render
    res.render('profile', { user, visitedUser, page, isFriend, rank })
})

// Admin section
function convertToGB(bytes) {
    return Number((bytes / (1024 * 1024 * 1024)).toFixed(0));
}

function converToGbNoFixed(bytes) {
    return Number((bytes / (1024 * 1024 * 1024)));
}

// Dashboard Page
app.get("/dashboard", async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry');
        return;
    }

    if(user.rank !== "admin") {
        res.redirect("/");
        return;
    }

    const page = "dashboard";
    const adminRoom = await new Room().getAdminRoom();
    res.render('dashboard', {user, page, adminRoom})
})

// Majors Page
app.get("/majors", async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry');
        return;
    }

    if(user.rank !== "admin") {
        res.redirect("/");
        return;
    }

    const page = "majors";
    const adminRoom = await new Room().getAdminRoom();

    res.render('majors', {user, page, adminRoom})
})

// Server Page
app.get("/server", async (req, res) => {
    const user = req.session.user

    if (!user) {
        res.redirect('/entry');
        return;
    }

    if(user.rank !== "admin") {
        res.redirect("/");
        return;
    }

    let specs = {
        Cores: (await si.cpu()).cores,
        Memory: convertToGB((await si.mem()).total),
        Storage: convertToGB((await si.diskLayout())[0].size),
    }

    let cpuData = (await si.currentLoad());
    let memData = (await si.mem());
    let storageData = (await si.fsSize());

    let allStorage = {
        total: 0,
        used: 0,
    };
    
    storageData.map(d => {
        allStorage.used += d.used;
    })

    let usage = {
        CPU: {
            usage: Number(cpuData.currentLoad.toFixed(0)),
            idle: Number(cpuData.currentLoadIdle.toFixed(0))
        },
        Memory: {
            usage: Number(converToGbNoFixed(memData.used).toFixed(1)),
            idle: Number(converToGbNoFixed(memData.total).toFixed(1)),
            percentage: ((Number(converToGbNoFixed(memData.used).toFixed(1))/Number(converToGbNoFixed(memData.total).toFixed(1)))*100).toFixed(1)
        },
        Storage: {
            usage: Number(converToGbNoFixed(storageData[0].size).toFixed(2)),
            idle: Number(converToGbNoFixed(allStorage.used).toFixed(2)),
            percentage: ((Number(converToGbNoFixed(allStorage.used).toFixed(1))/Number(converToGbNoFixed(storageData[0].size).toFixed(1)))*100).toFixed(1)
        },
    }
    const page = "server";
    const adminRoom = await new Room().getAdminRoom();

    res.render('server', {user, specs, usage, page, adminRoom})
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

// keep usages updated
setInterval(async () => {
    let cpuData = (await si.currentLoad());
    let memData = (await si.mem());
    let storageData = (await si.fsSize());

    let allStorage = {
        total: 0,
        used: 0,
    };
    
    storageData.map(d => {
        allStorage.used += d.used;
    })

    let usage = {
        CPU: {
            usage: Number(cpuData.currentLoad.toFixed(0)),
            idle: Number(cpuData.currentLoadIdle.toFixed(0))
        },
        Memory: {
            usage: Number(converToGbNoFixed(memData.used).toFixed(1)),
            idle: Number(converToGbNoFixed(memData.total).toFixed(1)),
            percentage: Number(((Number(converToGbNoFixed(memData.used).toFixed(1))/Number(converToGbNoFixed(memData.total).toFixed(1)))*100).toFixed(1))
        },
        Storage: {
            usage: Number(converToGbNoFixed(storageData[0].size).toFixed(2)),
            idle: Number(converToGbNoFixed(allStorage.used).toFixed(2)),
            percentage: Number(((Number(converToGbNoFixed(allStorage.used).toFixed(1))/Number(converToGbNoFixed(storageData[0].size).toFixed(1)))*100).toFixed(1))
        },
    }

    io.emit("os-usages", usage);
}, 2500);

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