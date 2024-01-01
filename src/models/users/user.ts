import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IUser } from './../../types/user'

export interface IUserModel extends IUser, Document {}

export const UserSchema: Schema<IUserModel> = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: uuidv4,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    maxLength: 100,
    required: true,
  },

  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  status: {
    type: String,
  },
  avatar: {
    type: Buffer,
  },
  location: {
    type: Schema.Types.Mixed,
    default: {},
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {},
  },
  userType: {
    type: String,
    enum: ['normal', 'vendor', 'zoneManager', 'driver', 'agent'],
  },
  deliveries: [Schema.Types.Mixed],
  expoPushToken: Schema.Types.Mixed,
  profilePhoto: String,
  canDeliver: String,
  rating: Number,
  securityCode: String,
  securityAnswer: String,
  date: {
    type: Date,
    default: Date.now,
  },
  preferredPickupLocation: String,
  languagePreference: String,
  dateOfBirth: Date,
  emailVerified: Boolean,
  paymentMethod: Schema.Types.Mixed,
})

const UserModel = mongoose.model<IUser>('User', UserSchema)
export default UserModel
