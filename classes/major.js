
const majorModel = require('../models/major.model.js');
const Room = require('./room.js');
const ObjectId = require('mongoose').Types.ObjectId;

class Major {

    // Set this to major
    setMajor(major) {
        this.major = major
    }

    // Get Major from db
    async getMajor() {
        return await this.exists(this.major);
    }

    // find major by id
    async findById(id) {
        return await majorModel.findById(id);
    }

    // find multi year major
    async findMany(mName) {
        let regex = new RegExp(`^${mName}`, "i");
        return await majorModel.find({name: regex});
    }

    // get all majors
    async getAll() {
        return await majorModel.find({});
    }

    // Major exists
    async exists(mName) {
        let regex = new RegExp(`^${mName}`, "i");
        return await majorModel.findOne({name: regex});
    }

    // add major
    async create(mName, years, lecturers) {
        if((await this.exists(mName))) {
            throw new Error("Major already exists");
        }

        let majors = []
        for(let i = 0; i <= years; i++) {
            let room = new Room();
            let createdMajor = await majorModel.create({
                name: mName,
                year: i,
                lecturers: lecturers
            })

            // create room for major

            let rName = `${mName} - Year ${i}`
            let rDescription = `talk about ${mName} - Year ${i}`
            if(i == 0) {
                rName = `General ${mName}`
                rDescription = "talk with all years"
            }

            room.create(rName, rDescription, createdMajor._id, null)
            majors.push(createdMajor)
        }
        return majors;
    }

    async getRelated(id) {
        let majorName = (await majorModel.findById(id)).name;
        if(!majorName) {
            throw new Error("Major not found");
        }

        let majors = await majorModel.find({$or: [
            {$and:[{name: majorName}, {year: 0}]},
            {_id: ObjectId(id)},
        ]});

        return majors;
    }

    async checkIfMajorExists() {
        let results = await majorModel.find();
        if(results.length == 0) {
            await this.create("Software Engineer", 4, []);
        }

        return true;
    }

    // Get Major from db
    async getMajorGrouped() {
        let results = await majorModel.aggregate([
            {
                $group: {
                    _id: "$name",
                    years: {
                        $push: {
                            _id: "$_id",
                            year: "$year",
                            lecturers: "$lecturers"
                        }
                    }
                }
            }
        ])

        return results;
    }

}

module.exports = Major;