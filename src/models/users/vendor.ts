import mongoose, { Schema, Document } from 'mongoose'
import { IUserModel } from './user'

interface IVendor extends IUserModel {
  businessName: string
  businessType: 'Sole Proprietorship' | 'Limited Company'
  businessAddress: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  contactDetails: {
    phoneNumbers: string[]
    emailAddresses: string[]
    website?: string
  }
  businessLicenses: string[]
  taxCertificates: {
    TIN: string
  }
}

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
