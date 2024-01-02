import db from '../util/db'
import { v4 as uuidv4 } from 'uuid'
import UserModel from '../models/users/user'
import cloudinary from '../util/cloudinary'
import { generateJwtToken } from '../util/generateJwtToken'
import argon2 from 'argon2'

const END_NUMBER = 1000000

export const userRegisterService = async (userData: IUser) => {
  const {
    fullname,
    phone,
    password,
    location,
    expoPushToken,
    status,
    securityAnswer,
    securityCode,
  } = userData

  const existingUser = await UserModel.findOne({ fullname: fullname })

  if (existingUser) {
    throw new Error('User is already registered. Please login')
  }

  const userCount = await db.users.countDocuments({})

  const hashedPassword = await argon2.hash(password!)

  const username: string = fullname?.replace(/\s+/g, '_').toLowerCase()!

  const newUser = new UserModel({
    userId: `U-${uuidv4()}-${END_NUMBER + userCount + 1}`,
    username: username,
    fullname,
    phone,
    location,
    password: hashedPassword,
    status,
    deliveries: [],
    expoPushToken,
    rating: 5.0,
    profilePhoto: 'https://via.placeholder.com/150',
    securityAnswer,
    securityCode,
  })

  console.log(newUser)

  await newUser.save()
  return newUser
}

export const loginUserService = async (username: string, password: string) => {
  const user = await UserModel.findOne({ username })

  if (!user) {
    throw new Error('Incorrect username.')
  }

  const isPasswordMatch = await argon2.verify(user.password!, password)

  if (!isPasswordMatch) {
    throw new Error('Incorrect password.')
  }

  const token = await generateJwtToken(user.userId!)

  return {
    token,
    user,
  }
}

export const uploadProfilePictureService = async (
  userID: string,
  filePath: string
) => {
  const user = await UserModel.findById(userID)
  if (!user) {
    throw new Error('Cannot update a profile picture of an unregistered user.')
  }
  const profilePhotObj = await cloudinary.uploader.upload(filePath, {
    public_id: `${user.username}_profile`,
    width: 500,
    height: 500,
    crop: 'fill',
  })
  await UserModel.updateOne(
    { _id: userID },
    { $set: { profilePhoto: profilePhotObj.secure_url } }
  )

  return profilePhotObj.secure_url
}

export const updateUserInfoService = async (
  userId: string,
  userInfo: { fullname: string; phone: string; email: string }
) => {
  const { fullname, phone, email } = userInfo
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: {
        fullname,
        phone,
        email,
      },
    }
  )
}

export const resetUserPasswordService = async (
  phone: string,
  password: string,
  securityCode: string,
  securityAnswer: string
) => {
  const user = await UserModel.findOne({ phone })

  if (!user) {
    throw new Error('No user with the entered phone number found.')
  }

  if (
    user.securityCode !== securityCode ||
    user.securityAnswer !== securityAnswer
  ) {
    throw new Error('Incorrect security code and answer given.')
  }

  const hashedPassword = await argon2.hash(password)
  await UserModel.updateOne({ phone }, { $set: { password: hashedPassword } })

  return user.username
}

export const deleteUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new Error('No user found.')
  }
  await UserModel.deleteOne({ _id: userId })
}

export const getAllUsersService = async () => {
  const users = await UserModel.find()
  if (!users) {
    throw new Error('No users found.')
  }
  return users
}

export const getUserByIdService = async (userId: string) => {
  const user = await UserModel.findOne({ userId })
  if (!user) {
    throw new Error('No user found.')
  }
  return user
}

//TODO: User send current location
export const updateUserLocationService = async (
  userId: string,
  location: any
) => {
  await UserModel.updateOne(
    { _id: userId },
    {
      $set: { location },
    }
  )
}
