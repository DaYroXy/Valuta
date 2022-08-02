const express = require ("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.use(require("./users.routes"));
router.use("/posts", require("./posts.routes"));
router.use("/entry", require("./entry.routes"));


router.get("/", async (req,res) => {

    let error = false;
    
    try  {
        const Url = await fetch("https://picsum.photos/750/900?random=2")
        this.url = Url.url
    } catch(err) {
        error = true;
    }

    if(error) {

    }
    console.log(Url.url)
    res.json({
        "status": "success",
        "data": "generated"
    })
})


module.exports=router;
