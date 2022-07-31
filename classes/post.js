
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
            console.log("no user")
            return {
                status: "error",
                message: "User not found"
            }
        }

        if(this.content === "" || this.content === undefined) {
            console.log("no content")
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

        console.log("readying" + this.content)
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