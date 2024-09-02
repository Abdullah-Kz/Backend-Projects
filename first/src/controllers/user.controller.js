import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(400,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res) => {

 const {fullName, userName, email, password} = req.body
//  console.log("Full Name: ",fullName)
//  console.log("User Name: ",userName)
//  console.log("Email: ",email)
//  console.log("Password: ",password)

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

const avatarLocalPath = req.files?.avatar[0]?.path;
let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

if(!avatarLocalPath) {throw new ApiError(400,"Avatar is required")}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Failed to upload avatar") 
}

const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
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
new ApiResponse(200,createdUser,"User created successfully")
)
})
const loginUser = asyncHandler(async(req, res) => {
const {userName,email,password} = req.body
if(!userName && !email) {
    throw new ApiError(400,"Username or Email is required")
}

const user = await User.findOne({
    $or: [{userName},{email}]
})

if(!user) {
    throw new ApiError(400,"User not found")
}

const isPasswordCorrect = await user.IsPasswordCorrect(password);

if(!isPasswordCorrect) {
    throw new ApiError(400,"Password is incorrect")
}
const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
    httpOnly : true,
    secure : true
}
return res 
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse
    (   200,
        loggedInUser,
        "User logged in successfully"
    ))

})
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
export {
    registerUser,
    loginUser,
    logoutUser
}