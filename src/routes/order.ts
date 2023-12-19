import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

import { addOrder } from '../controllers/orderController';

router.post('/add-order', (req: Request, res: Response) => {
  addOrder(req, res); // Assuming addOrder takes req and res as arguments
});

export default router;
