import mongoose from "mongoose";
import {DB_NAME} from '../constants.js'

const connectDB =async () =>{
    try {
        console.log("Trying to connect")
       const connectionInstsnce= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(` mongoDB connected !! DB host: ${connectionInstsnce.connection.host}`) //used to know to connected to which database 
    } catch (error) {
        console.log("MongoDB connection error",error);
        process.exit(1)
    }
}

export default connectDB