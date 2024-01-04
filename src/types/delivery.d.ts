interface Coordinates {
  latitude: number
  longitude: number
}

interface DeliveryRequestBody {
  userId?: string
  deliveryId?: string
  deliveryId: string
  receiverId?: string
  senderId: string
  partnerId?: string
  receiver?: string
  quantity: number
  phoneNumber?: string
  size?: string
  type?: string
  parcel?: string
  dropoffLocation: {
    latitude: number
    longitude: number
  }
  notes?: string
  pickupLocation?: Array<any>
  currentHandler?: any
  scheduledHandler?: string | undefined
  deliveryTime?: string
  deliveryDate?: string
  dropOffCost?: any
  pickUpCost?: any
  deliveryCost?: number
  status?: any
  orderId?: string
  vendorId?: string
  date?: Date
}

interface DeliveryItemDetails {
  deliveryId: string
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
