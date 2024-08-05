const express = require("express");
const app= express();
const { User, Account } = require("./db");
const cors= require("cors");

app.use(cors());
app.use(express.json());

const mainRouter= require("./routes/index");
const userRouter= require("./routes/user");
const accountRouter=require("./routes/account");

app.use("/api/v1", mainRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);



app.listen(3000, ()=>{
    console.log("server is running");
});