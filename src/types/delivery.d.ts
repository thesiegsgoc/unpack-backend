interface Coordinates {
  latitude: number
  longitude: number
}

interface DeliveryRequestBody {
  userId: string
  receiver: string
  phoneNumber: string
  pickupLocation: Coordinates
  dropoffLocation: Coordinates
  senderId: string
  size: string
  type: string
  parcel: string
  notes?: string // Optional
  quantity: number
  deliveryTime: string
  deliveryDate: string
  dropOffCost: number
  pickUpCost: number
  deliveryCost: number
}

interface DeliveryItemDetails {
  pickup: string
  dropoff: string
  time: string
  date: string
  status: string
  deliveryId: string
  type: string
  receiver: string
  sendor: string
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
  avatar?: string
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
  user?: IUser
}
