
const postClass = require('../models/Post.model');
const User = require('../classes/user.js');

class Post {

    constructor({user_id, content, image, createdAt}) {
        this.user_id = user_id;
        this.content = content;
        this.image = image;
        this.createdAt = createdAt;
    }

    async isValid() {

        // if content is empty
        let user = await new User().getUserById("asd");
        if(!user) {
            return {
                status: "error",
                message: "User not found"
            }
        }

        if(this.content === "") {
            return {
                status: "error",
                message: "Content is empty"
            }
        }

        return true;
    }

    // Post to DB
    post() {
        if(!this.isValid()) {
            return false;
        }
        // database
        return {
            user_id: this.user_id,
            content: this.content,
            image: this.image,
            createdAt: this.createdAt
        }
    }

    getPost() {
        return {
            user_id: this.user_id,
            content: this.content,
            image: this.image,
            createdAt: this.createdAt
        }
    }
}

module.exports = Post