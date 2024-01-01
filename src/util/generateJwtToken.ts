import jwt from 'jsonwebtoken'
import config from '../config'
const { JWT_SECRET_CODE } = config

export const generateJwtToken = async (userId: string): Promise<string> => {
  const token = jwt.sign({ userId: userId }, JWT_SECRET_CODE, {
    expiresIn: '30d',
  })
  return token
}
