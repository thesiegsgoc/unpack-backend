import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import IVendor from '../../types/users/vendor'

export interface IVendorModel extends IVendor, Document {}

const VendorSchema: Schema<IVendorModel> = new mongoose.Schema({
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
  fullname: {
    type: String,
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
  expoPushToken: Schema.Types.Mixed,
  profilePhoto: String,
  canDeliver: String,
  rating: Number,
  securityCode: String,
  securityAnswer: String,
  preferredPickupLocation: String,
  languagePreference: String,
  dateOfBirth: Date,
  emailVerified: Boolean,
  paymentMethod: Schema.Types.Mixed,
  date: {
    type: Date,
    default: Date.now,
  },
  deliveries: [Schema.Types.Mixed],

  // Original VendorSchema fields
  businessName: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    enum: ['Sole Proprietorship', 'Limited Company'],
    required: true,
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  contactDetails: {
    phoneNumbers: [String],
    emailAddresses: [String],
    website: String,
  },
  businessLicenses: [String],
  taxCertificates: {
    TIN: String,
  },
})

const VendorModel = mongoose.model<IVendorModel>('Vendor', VendorSchema)
export default VendorModel
