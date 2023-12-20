import express, { Request, Response, Router, NextFunction } from 'express';
import UserModel from '../models/User';
const router: Router = express.Router();

router.get('/api/users', (req: Request, res: Response, next: NextFunction) => {
  UserModel.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((err: Error) => {
      next(err);
    });
});




export default router;