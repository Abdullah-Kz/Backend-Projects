import dotenv from "dotenv";
import ConnectDB from "./db/index.js"
import {app} from "./app.js"
dotenv.config({
    path : "./env"
})

ConnectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



// FIRST APPROACH
// import express from "express"
// const app = express()

// ( async () => {
// try {
// await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
// app.on("error", (error) => {
//     console.log("Error: ",error)
//     throw error
// })
// app.listen(process.env.PORT, () =>{
//     console.log("Listening on port: ",process.env.PORT)
// })
// }
// catch (error) {
//     console.log("Error: ",err)
// }
// })()