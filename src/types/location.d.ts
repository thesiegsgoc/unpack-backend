type LocationData = {
  userId?: string
  usertype?: 'driver' | 'user'
  geometry: Geometry
  address: string
}

interface Geometry {
  location: {
    lat: number
    lng: number
  }
}
