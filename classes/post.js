

class Post {

    constructor({user_id, content, image, createdAt}) {
        this.user_id = user_id;
        this.content = content;
        this.image = image;
        this.createdAt = createdAt;
    }

    isValid() {

        // if content is empty
        if(this.user_id === "") {
            return false;
        }
        if(this.content === "") {
            return false;
        }
        if(this.createdAt === "") {
            return false;
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