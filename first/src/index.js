import dotenv from "dotenv";
import ConnectDB from "./db/index.js"

dotenv.config({
    path : "./env"
})

ConnectDB();



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