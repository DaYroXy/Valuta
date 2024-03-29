let ObjectId = require('mongoose').Types.ObjectId;
const User = require("../models/User.model");
const postModel = require("../models/Post.model");
const rankModel = require("../models/Rank.model");

// Extends to multiple classes libary
const Many = require('ts-mixer')

const Friend = require("./friend.js");
const Message = require("./message.js");


const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


class user extends Many.Mixin(Friend,Message) {

    getUser() {
        const user = {
            id: this.user._id,
            avatar: this.user.avatar,
            bg_image: this.user.bg_image,
            name: this.user.name,
            username: this.user.username,
            email: this.user.email,
            rank: this.user.rank,
            bio: this.user.bio,
            createdAt: this.user.createdAt,
            major: this.user.major,
            sockets_id: this.user.sockets_id,
            friends_count: 0,
            posts_count: 0
        }
        return user;
    }

    async getUserRank() {
        return await rankModel.findById(this.user.rank);
    }

    async getUserByUsername(username) {
        let user = await User.findOne({"username": username}, {"sockets_id":0, "password":0, "email":0});
        if(!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }
        this.user = user;
        return user.toObject();
    }

    async returnUserByUsername(username) {
        let user = await User.findOne({username: username}, {"sockets_id":0, "password":0, "email":0});
        if(!user) {
            return;
        }
        return user
    }


    async userExists(username) {
        let user = await User.findOne({$or:[{'email':username},{'username':username}]});
        this.user = user;
        return user;
    }

    async getUserById(userId) {
        if(!ObjectId.isValid(userId)) {
            return {
                status: "error",
                message: "Invalid user id"
            }
        }

        let user = await User.findById(userId);
        this.user = user;
        return user;
    }

    async returnUserById(userId) {
        if(!ObjectId.isValid(userId)) {
            return {
                status: "error",
                message: "Invalid user id"
            }
        }

        let user = await User.findById(userId);
        return user;
    }


    async addSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, {$push: {sockets_id: [ socket_id ] }})
        this.user = user;
        return true;
    }

    async removeSocket(socket_id) {
        await User.updateOne({ _id: this.user._id}, { $pull: {sockets_id: socket_id }})
        this.user = user;
        return true;
    }


    async register({name, username, password, email, bio, major, socket_id}) {
        if(await this.userExists(username)) {
            return {
                status: "error",
                message: "Username is already taken"
            };
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        username = username.toLowerCase();
        var backgroundImage;
        try  {
            const Url = await fetch("https://picsum.photos/800")   
            backgroundImage = Url.url
    
        } catch(err) {
            backgroundImage = "anas-bg.jpeg"
        }

        var userImage;
        try  {
            let rngBGcolor = (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            let seed = Math.round(Math.random()*Math.pow(2,64)).toString(36)
            const Url = await fetch(`https://avatars.dicebear.com/api/bottts/${seed}.png?background=%23${rngBGcolor}`)   
            
            userImage = Url.url
    
        } catch(err) {
            userImage = "anas.jpeg"
        }

        let rank = await rankModel.findOne({name: "student"});
        if(!rank) {
            rank = await rankModel.create({
                name: "student",
                access: 0})
        }
        
        console.log(major)
        await User.create({
            avatar: userImage,
            bg_image: backgroundImage,
            name: name,
            username: username,
            password: hashedPassword,
            email: email,
            rank: rank._id,
            bio: bio,
            major: major,
            sockets_id: socket_id
        })
        this.user = await this.userExists(username);
        return {
            "status": "success",
            "message": "Account created successfully"
        };
    }

    async login(username, password) {
        let user = await this.userExists(username);
        if(!user) {
            return false;
        }

        if(await bcrypt.compare(password, user.password)) {
            this.user = user;
            return true;
        } else {
            return false;
        }
    }

    async logout() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        await User.updateOne({_id: this.user._id}, {$set: {sockets_id: []}});
        return true;
    }

    async Posts() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
    
        const posts = await postModel.aggregate([
            {
                $match: {
                    "userId" : mongoose.Types.ObjectId(this.user.id)
                }
            },
            {
                "$lookup": {
                  "from": "users",
                  "localField": "userId",
                  "foreignField": "_id",
                  "as": "user"
                }
              },
              {
                "$unwind": "$user"
              },
              {
                "$lookup": {
                    "from": "ranks",
                    "localField": "user.rank",
                    "foreignField": "_id",
                    "as": "rank"
                }
              },
              {
                "$unwind": "$rank"      
              },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "postId",
                    as: "likes"
                }
            },
              {"$project": {
                "_id":1,
                "content":1,
                "image":1,
                "file":1,
                "createdAt": 1,
                "user.name": 1,
                "user.avatar": 1,
                "user.username": 1,
                "rank.name" : 1, 
                "likes.userId": 1,
            }}
            
          ]).sort({"createdAt":-1}).limit(10);
        return posts;
    }

    async resetAllUserStatus() {
        await User.updateMany({}, {$set: {sockets_id: []}});
        return true;
    }

    async getUserPostsCount() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        let posts = await postModel.find({userId: this.user._id});
        return posts.length;
    }

    async getUserSockets() {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        return (await User.findById(this.user._id, {_id:0, sockets_id: 1})).sockets_id;
    }

    async updateUser(name, username, avatar, bg_image, bio) {
        if(!this.user) {
            return({
                status: "error",
                message: "User not found"
            })
        }
        username = username.toLowerCase();
        await User.updateOne({_id: this.user._id}, {$set: {name: name, username: username, avatar: avatar, bg_image: bg_image, bio: bio}});
        this.user = await this.userExists(username);
        return true;
    }

    async updateUserRank(rankName) {
        let rank = await rankModel.findOne({name: rankName});
        if(!rank) {
            return false;
        }
        await User.updateOne({_id: this.user._id}, {$set: {rank: rank._id}});
    }
}

module.exports = user;