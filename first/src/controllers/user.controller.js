import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

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
});
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
const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

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

});
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
});
const refreshAccessToken = asyncHandler(async(req,res) => {
    const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    
    if(!incommingRefreshToken) {
        throw new ApiError(400, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(400, "User not found")
        }
        if(incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Refresh Token is either expired or invalid")
        }
        const {accessToken, newRefreshToken} = generateAccessAndRefreshToken(user._id)
        const options = {
            httpOnly : true,
            secure : true
        }
        return res 
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse
            (   200,
                {accessToken,refreshToken : newRefreshToken},
                "AccessToken Refreshed successfully"
            ))

    } catch (error) {
        throw new ApiError(400,error?.messege || "Invalid refresh token")
    }

});
const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword , newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.IsPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"Old password is incorrect")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200,{}, "Password changed successfully"))
});
const getCurrentUser = asyncHandler(async(req,res) => {
    res 
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
         "User fetched successfully"
        ))
});
const updateUserDetails = asyncHandler(async(req,res) => {
const {fullName, email} = req.body
if(!fullName || !email) {
    throw new ApiError(400, "One of the fields is required")
}

const user = await User.findById(req.user?._id);

user.fullName = fullName
user.email = email
await user.save({validateBeforeSave : false})
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User details changed successfully"))

    });
    const updateUserAvatar = asyncHandler(async(req,res) => {
    
        const avatarLocalPath = req.file?.path
 
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is missing")
        }
    
        await User.findByIdAndUpdate(req.user?._id,{
            $set: {
                avatar: 1
            }},
            {
                new: true
            }
        )
    
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading on avatar")
            
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password")
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
    });
    const updateUserCoverImage = asyncHandler(async(req,res) => {
    
        const coverImageLocalPath = req.file?.path
 
        if (!coverImageLocalPath) {
            throw new ApiError(400, "CoverImage file is missing")
        }
    
        await User.findByIdAndUpdate(req.user?._id,{
            $set: {
                coverImage: 1
            }},
            {
                new: true
            }
        )
    
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!coverImage.url) {
            throw new ApiError(400, "Error while uploading on coverImage")
            
        }
    
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url
                }
            },
            {new: true}
        ).select("-password")
    
        return res
        .status(200)
        .json(
            new ApiResponse(200, user, "CoverImage image updated successfully")
        )
    });
    export {
             registerUser,
            loginUser,
            logoutUser,
             refreshAccessToken,
            changeCurrentPassword,
            getCurrentUser,
            updateUserDetails,
            updateUserAvatar,
            updateUserCoverImage
}