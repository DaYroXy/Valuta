
const postModel = require('../models/Post.model');
const userModel = require('../models/User.model');
const User = require('../classes/user.js');


class Post {
    
    async postData({content, image, file}) {
        this.content = content;
        this.image = image;
        this.file = file;
    }

    async isValid() {

        // if content is empty
        if(!this.user || this.user === undefined) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        if(this.content === "" || this.content === undefined) {
            return {
                status: "error",
                message: "Content is empty"
            }
        }

        return {
            status: "success",
            message: "Data is valid"
        }
    }
    
    async setUserById(userId) {
        let user = await new User().getUserById(userId);
        this.user = user;
        return user;
    }

    // Post to DB
    async post() {
        if((await this.isValid()).status !== "success") {
            return {
                status: "error",
                message: "Data is not valid"
            };
        }

        let post = await postModel.create({
            userId: this.user._id,
            content: this.content,
            image: this.image,
            file: this.file,
        });

        if(!post) {
            return {
                status: "error",
                message: "Post not created"
            }
        }

        return {
            status: "sucess",
            message: "Post created",
            data : post
        }

    }

    async getPosts() {
        // db.posts.aggregate([
        //     { $lookup:
        //         { 
        //             from: "users",
        //             localField: "userId",
        //             foreignField: "_id",
        //             as: "user"
        //         }
        //     }, { 
        //         $unwind: "$user"
        //     }, { 
        //         $project: { 
        //             "user.id":1,
        //             "user.name":1,
        //             "user.avatar":1,
        //             "user.username":1,
        //             "user.rank":1, id:1, content:1, image:1, file:1, createdAt: 1}}])
        const posts = await userModel.aggregate([
            {
              "$lookup": {
                "from": "posts",
                "localField": "_id",
                "foreignField": "userId",
                "as": "post"
              }
            },
            {"$unwind": "$post"},
            {"$project": {
                "_id":1,
                "name": 1,
                "avatar": 1,
                "username": 1,
                "rank" : 1, 
                "post._id": 1,
                "post.content": 1,
                "post.image": 1,
                "post.file": 1,
                "post.createdAt": 1,
            }}
          ]).limit(10);
        return posts;
    }
}

module.exports = Post