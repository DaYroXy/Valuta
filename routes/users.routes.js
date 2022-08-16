const express = require ("express");
const router = express.Router();
const User = require("../classes/user");

router.get("/refresh", async (req, res) => {
    const user = req.session.user
    if(!user) {
        res.redirect("/entry")
        return;
    }

    const {username} = req.params;
    let me = new User();
    await me.getUserById(user.id);
    req.session.user = me.getUser();
    req.session.user.rank = (await me.getUserRank()).name;
    req.session.user.posts_count = await me.getUserPostsCount();
    req.session.user.friends_count = await me.getFriendsCount();
    
    res.json({
        status: "success",
        message: "Refreshed",
    })
})


// update user settings
router.put("/settings", async (req, res) => {
    // console.log(req.files)
    const user = req.session.user
    if(!user) {
        res.redirect("/entry");
    }

    const me = new User();
    await me.getUserById(user.id);

    // Retrieve old info
    let myInfo = me.getUser();
    
    let files = req.files

    // username, name
    let username = req.body["username-change"]
    let name = req.body["name-change"]
    let bio = req.body["bio-change"]


    if(username.length < 6 || !/^[a-zA-Z0-9."-]+$/.test(username)) {
        res.json({
            status: "error",
            message: "Username is invalid"
        })
        return;
    }

    if(name.length < 8 || !/^[a-zA-Z0-9 ."-]+$/.test(name)) {
        res.json({
            status: "error",
            message: "Name is invalid"
        })
        return;
    }

    // user data
    let userData = {
        name: name,
        username: username,
        avatar: myInfo.avatar,
        bg_image: myInfo.bg_image,
        bio: bio,
    }
    
    
    let avatar;
    let bgImage;
    if(files) {
        if(files["avatar-image-input"]) {
            avatar = files["avatar-image-input"];
            if(avatar.mimetype.includes("image")) {
                let filterdImage = avatar.name.split(".");
                let md5Name = `${avatar.md5}.${filterdImage[filterdImage.length - 1]}`;
                userData.avatar = md5Name;
                console.log(md5Name)
                req.files["avatar-image-input"].mv(`public/uploads/${md5Name}`, async (err) => {
                    if(err) {
                        res.json(err)
                        return;
                    }
                })    
            } else {
                res.json({
                    status: "error",
                    message: "must send an image"
                })
                return;
            }
        }

        if(files["bg-image"]) {
            bgImage = files["bg-image"];
            if(bgImage.mimetype.includes("image")) {
                let filterdImage = bgImage.name.split(".");
                let md5Name = `${avatar.md5}.${filterdImage[filterdImage.length - 1]}`;
                userData.bg_image = md5Name;
                req.files["bg-image"].mv(`public/uploads/${md5Name}`, async (err) => {
                    if(err) {
                        res.json(err)
                        return;
                    }
                })    
            } else {
                res.json({
                    status: "error",
                    message: "must send an image"
                })
                return;
            }
        }
    }


    console.log(await me.updateUser(userData.name, userData.username, userData.avatar, userData.bg_image, userData.bio));
    res.json({
        "status": "success",
        "message": "Updated"
    })
})

module.exports=router;