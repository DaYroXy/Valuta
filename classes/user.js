let ObjectId = require('mongoose').Types.ObjectId;
const User = require("../models/User.model");
const userModel = require("../models/User.model");
const postModel = require("../models/Post.model");
const rankModel = require("../models/Rank.model");

const bcrypt = require("bcrypt");
const { default: mongoose } = require('mongoose');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


class user {

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
            sockets_id: this.user.sockets_id,
            friends_count: 0,
            posts_count: 0
        }
        return user;
    }

    async getUserRank() {
        return await rankModel.findOne({id: this.user.rank});
    }

    async getUserByUsername(username) {
        let user = await User.findOne({username: username}, {"sockets_id":0, "password":0, "email":0});
        if(!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }
        
        this.user = user;
        return user;
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

    async register({name, username, password, email, bio, socket_id}) {
        if(await this.userExists(username)) {
            return {
                status: "error",
                message: "Username is already taken"
            };
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

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

        let rank = await rankModel.findOne({access: 0});
        if(!rank) {
            rank = await rankModel.create({
                name: "student",
                access: 0})
        }
        

        await User.create({
            avatar: userImage,
            bg_image: backgroundImage,
            name: name,
            username: username,
            password: hashedPassword,
            email: email,
            rank: rank._id,
            bio: bio,
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

    async logout(username) {
        let user = await this.userExists(username);
        if(!user) {
            return false;
        }

        user.sockets_id = [];
        await user.save();
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
            }}
            
          ]).sort({"createdAt":1}).limit(10);
        return posts;
    }

    async resetAllUserStatus() {
        await User.updateMany({}, {$set: {sockets_id: []}});
        return true;
    }

}

module.exports = user;