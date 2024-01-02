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
