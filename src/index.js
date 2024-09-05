const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port


    mongoose.connect(config.mongoose.url,config.mongoose.options,()=>{
        console.log("Mongo Db connected at ",config.mongoose.url);
       server = app.listen(config.port,()=>{
            console.log("Listening at port no ",config.port);
    })
})
