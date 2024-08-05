const express= require("express");

router=express.Router();

router.get("/", (req, res)=>{
    res.json({
        msg:"hi from index file"
    })
})



module.exports= router;