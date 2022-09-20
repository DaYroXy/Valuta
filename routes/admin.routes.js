const express = require ("express");
const router = express.Router();
const si = require('systeminformation');

function convertToGB(bytes) {
    return Number((bytes / (1024 * 1024 * 1024)).toFixed(0));
}

router.get("/specs", async (req, res) => {
    let specs = {
        Cores: (await si.cpu()).cores,
        Memory: convertToGB((await si.mem()).total),
        Storage: convertToGB((await si.diskLayout())[0].size),
    }

    res.json(specs)
})

module.exports = router;