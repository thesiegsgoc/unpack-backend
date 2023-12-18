import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

// Import order controller functions here
import { addOrder } from '../controllers/orderController';

// Implement the user routes:
router.post('/add-order', (req: Request, res: Response) => {
  addOrder(req, res); // Assuming addOrder takes req and res as arguments
});

export default router;
