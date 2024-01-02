import mongoose, { Schema, Document } from 'mongoose'
import { IUserModel } from './user'

const AgentSchema = new mongoose.Schema({
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

const AgentModel = mongoose.model<IAgent>('Agent', AgentSchema)
export default AgentModel
