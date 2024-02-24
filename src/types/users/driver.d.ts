interface IDriver {
  driverId?: string
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
  licenseInfo: {
    number: string
    expiryDate: Date
    issuingState: string
  }
  vehicleInfo: {
    make: string
    model: string
    year: number
    color: string
    licensePlate: string
    insurance: string
    registrationDocument: string
  }
  driverStatus: string
  currentLocation: string
  availability: string
  preferredDeliveryTypes: string[]
  realTimeStatusUpdates: string
  earnings: {
    rates: number
    incentives: number
    deductions: number
    paymentHistory: any[]
  }
  performance: {
    completionRate: number
    onTimeDeliveryRate: number
    customerRatings: number[]
    safetyAndComplianceIndicators: string[]
  }
}
