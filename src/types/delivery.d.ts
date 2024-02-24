interface DeliveryRequest {
  userId: string
  deliveryId: string
  receiverId?: string
  partnerId?: string
  receiver?: string
  driverId: string
  phoneNumber?: string
  package_size: 'small' | 'medium' | 'large'
  delivery_type: 'standard' | 'express'
  delivery_quantity: number
  parcel?: string
  dropoffLocation?: LocationData
  pickupLocation: LocationData
  notes?: string
  currentHandler?: any // Consider defining a more specific type
  scheduledHandler?: string | undefined
  delivery_time?: string
  delivery_date?: string
  dropOffCost?: number // Consider using number if costs are numeric
  pickUpCost?: number // Same as above
  delivery_cost: number
  status?: any // Consider defining a specific type for status
  orderId?: string
  vendorId?: string
  date?: Date
  pickupZone: Zone
  dropoffZone: Zone
}

interface DeliveryItemDetails {
  deliveryId: string
  pickup: string
  dropoff: string
  time: string
  date: string
  status: string
  type: string
  receiver: string
  sender: string // Corrected typo 'sendor' to 'sender'
  expoPushToken?: string | number
  dropOffCost: number
  pickUpCost: number
  deliveryCost: number
  deliveryTime: string
}

interface DeliveryDetailsFrom {
  fullname: string
  phone: string
  email: string
  pickup: string
}

interface DeliveryDetailsTo {
  receiver: string
  phonenumber: string
  dropoff: string
}

interface OrderItem {
  name: string
  parcel: string
  quantity: number
  size: string
}

interface VendorItem {
  fullname?: string
  avatar?: Buffer
}

interface PartnerDeliveryItem {
  delivery: DeliveryItemDetails
  order: OrderItem
  vendor: VendorItem
}

type DeliveryItem = {
  name: string
  parcel: string
  quantity: number
  size: string
}

interface RequestWithUser extends Request {
  user?: IUser // Ensure IUser is defined elsewhere in your code
}
