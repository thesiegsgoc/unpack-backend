import { Request, Response, NextFunction } from 'express'

interface RequestWithUser extends Request {
  user?: IUser
}
