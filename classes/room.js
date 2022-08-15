
const roomModel = require('../models/room.model.js');

class Room {

    // Set this to room
    setRoom(room) {
        this.room = room
    }

    // Get room from db
    async getRoom() {
        return await this.exists(this.room);
    }

    // find room by id
    async findById(id) {
        return await roomModel.findById(id);
    }

    // find multi year room
    async findMany(name) {
        let regex = new RegExp(`^${name}`, "i");
        return await roomModel.find({name: regex});
    }

    // get all rooms
    async getAll() {
        return await roomModel.find({});
    }

    // room exists
    async exists(name) {
        let regex = new RegExp(`^${name}`, "i");
        return await roomModel.findOne({name: regex});
    }

    // add room
    async create(name, description, major, moderators) {
        if((await this.exists(name))) {
            throw new Error("room already exists");
        }

        return await roomModel.create({
            name: name,
            description: description,
            major: major,
            moderators: moderators
        })

    }

    // find room by id
    // async getRelated(id) {
    //     return await roomModel.find({major: id});
    // }

    // get rooms by major ids
    async getRelated(ids) {
        return await roomModel.find({$or:[{major: {$in: ids}}, {name: "Universal"}]});
    }

}

module.exports = Room;