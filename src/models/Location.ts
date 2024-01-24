import mongoose from 'mongoose'

const LocationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  usertype: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const LocationModel = mongoose.model('Location', LocationSchema)

export default LocationModel
