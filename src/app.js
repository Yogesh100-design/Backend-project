const express = require('express')
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app=express()

app.use(({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))  //used to handle data coming in the format of json
app.use(express.urlencoded({extended:true,limit:"16kb"})) //used to handle data coming in the format of url
app.use(express.static("public")) //used to store the assets; public is nothing bu the folder that we made in folder structure
app.use(cookieParser()) //used for cookies


export {app}