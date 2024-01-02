import mongoose, { Schema, Document } from 'mongoose'
import { IUserModel } from './user'

const VendorSchema = new mongoose.Schema({
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

const VendorModel = mongoose.model<IVendor>('Vendor', VendorSchema)
export default VendorModel
