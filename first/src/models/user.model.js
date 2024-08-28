import mongoose, {Schema} from "mongoose"
import jsonwebtoken from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        index: true

    },
    email : {
        type : String,
        required : true,
        lowercase : true,
        unique : true,
        trim : true
    },
    fullName : {
        type : String,
        required : true,
        trim : true,
        index: true
    },
    avatar : {
        type : String,
        requied: true
    },
    coverImage:{
        type: String

    },
    WatchHistory:[
       {
         type: Schema.Types.ObjectId,
        ref : "Video"
    }],

    password : {
        type : String,
        required : [true, "Password is required"]
        },
        refreshToken : {
            type : String
        },
        
    },
{timestamps: true}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.IsPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jsonwebtoken.sign({
        id : this._id,
        userName: this.userName,
        fullName: this.fullName,
        email: this.email

    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn : process.env.ACCESS_TOKEN_EXPIRY})
}
userSchema.methods.generateRefreshToken =    function(){
    return jsonwebtoken.sign({
        id : this._id
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn : process.env.REFRESH_TOKEN_EXPIRY})
}
    export const User = mongoose.model("User", userschema)