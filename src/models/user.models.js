import mongoose,{Schema}  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
      },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
      },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
      },
      avatar:{
        type:String,
        required:true
      },
      coverimage:{
        type:String
      },
      watchHistory:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Video"
        }
      ],
      password:{
        type:String,
        required:[true,"Password is required"]
      },
      refreshtoken:{
        type:String
      }
    },
    {timestamps:true}
)

userSchema.pre("save",async function (next){
    if (!this.isModified("password")) return next();


    this.password=await bcrypt.hash(this.password,10)
    next()    
})

userSchema.method.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.method.genereteAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRETE,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.method.genereteRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRETE,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema);
export default User;

