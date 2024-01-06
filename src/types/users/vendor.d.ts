import { Document } from 'mongoose'

interface ILocation {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  coordinates?: any // Replace 'any' with a more specific type if you have a defined structure for coordinates
}

interface IContactDetails {
  phoneNumbers: string[]
  emailAddresses: string[]
  website?: string
}

interface IVendor extends Document {
  userId: string
  username: string
  password: string
  fullname: string
  email?: string
  phone?: string
  status?: string
  avatar?: Buffer
  location?: any // Replace 'any' with a more specific type for location if available
  address: ILocation
  userType: 'normal' | 'vendor' | 'zoneManager' | 'driver' | 'agent'
  expoPushToken?: any // Replace 'any' with a more specific type if available
  profilePhoto?: string
  canDeliver?: string
  rating?: number
  securityCode?: string
  securityAnswer?: string
  preferredPickupLocation?: string
  languagePreference?: string
  dateOfBirth?: Date
  emailVerified?: boolean
  paymentMethod?: any // Replace 'any' with a more specific type if available
  date?: Date
  deliveries?: any[] // Replace 'any' with a more specific type for deliveries if available

  // Vendor specific fields
  businessName: string
  businessType: 'Sole Proprietorship' | 'Limited Company'
  businessAddress: ILocation
  contactDetails: IContactDetails
  businessLicenses: string[]
  taxCertificates: {
    TIN: string
  }
}

export default IVendor
