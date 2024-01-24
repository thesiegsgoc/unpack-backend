type LocationData = {
  userId: string // Unique identifier for the user (driver or rider)
  latitude: number
  longitude: number
  usertype: string // 'user' or 'driver'
  timestamp?: Date
}
