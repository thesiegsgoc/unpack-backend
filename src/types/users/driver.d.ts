interface IDriver extends IUserModel {
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
