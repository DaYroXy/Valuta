
const majorModel = require('../models/major.model.js');

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
        for(let i = 1; i <= years; i++) {
            majors.push(await majorModel.create({
                name: mName,
                year: i,
                lecturers: lecturers
            }))
        }
        console.log(majors)

    }

}

module.exports = Major;