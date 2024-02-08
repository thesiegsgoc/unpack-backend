type LocationData = {
  userId?: string
  usertype?: 'driver' | 'user'
  location: {
    latitude: number
    longitude: number
  }
  address: string
}

type Location = {
  latitude: number
  longitude: number
}
