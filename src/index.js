import connectDB from './db/index.js'
import dotenv from 'dotenv'

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.MONGODB_URI || 8000,()=>{
        console.log(`Server is running on: ${process.env.MONGODB_URI}`)
    })
}).catch((error)=>{
    console.log("MongoDB connection failed",error)
})
