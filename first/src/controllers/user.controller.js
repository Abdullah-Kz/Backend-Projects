import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async(req, res) => {

 const {fullName, userName, email, password} = req.body
 console.log("Full Name: ",fullName)
 console.log("User Name: ",userName)
 console.log("Email: ",email)
 console.log("Password: ",password)

 if(fullName === "")
throw new ApiError(400,"Full Name is required")

if(userName === "")
throw new ApiError(400,"User Name is required")

if(email === "")
throw new ApiError(400,"Email is required")

if(password === "")
throw new ApiError(400,"Password is required")

 const existedUser = await User.findOne({
    $or: [{userName},{email},{fullName}]
})
if(existedUser) {throw new ApiError(400,"User already exists")}

const avatarLocalPath = req.files?.avatar[0]?.path
let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

if(!avatarLocalPath) {throw new ApiError(400,"Avatar is required")}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar is required") 
}

const user = await User.create({
    fullName,
    userName: username.toLowerCase(),
    email,
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url||""
})
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser) {
    throw new ApiError(500,"Something went wrong while creating user")
}

return res.status(201).json(
ApiResponse(200,createdUser,"User created successfully")
)
})


export {registerUser}