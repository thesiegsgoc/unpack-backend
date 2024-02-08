import dotenv from 'dotenv'
dotenv.config()

interface Config {
  MONGODB_URL: string
  JWT_SECRET_CODE: string
  CLOUDINARY_USER_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  GOOGLE_MAPS_API_KEY: string
  PORT: number | string
}

const config: Config = {
  MONGODB_URL: process.env.MONGODB_URL!,
  JWT_SECRET_CODE: process.env.JWT_SECRET_CODE!,
  CLOUDINARY_USER_NAME: process.env.CLOUDINARY_USER_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY!,
  PORT: process.env.PORT!,
}

export default config
