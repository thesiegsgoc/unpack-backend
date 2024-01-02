interface IUser {
  userId?: string
  fullname?: string
  username?: string
  phone?: string
  email?: string
  password?: string
  deliveries?: any[]
  status?: string
  avatar?: Buffer
  expoPushToken?: any
  profilePhoto?: string
  canDeliver?: string
  rating?: number
  securityCode?: string
  securityAnswer?: string
  location?: any
  date?: Date
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    coordinates?: any
  }
  preferredPickupLocation?: string
  languagePreference?: string
  dateOfBirth?: Date
  userType?: 'normal' | 'vendor' | 'zoneManager' | 'driver' | 'agent'
  emailVerified?: boolean
  paymentMethod?: any
}
