import express, { Request, Response, Router, NextFunction } from 'express';
const router: Router = express.Router();

router.get('/api/users', (req: Request, res: Response, next: NextFunction) => {
  // Simulated asynchronous operation that might produce an error
  someAsyncFunction()
    .then((result) => {
      // Handle the result
      res.json(result);
    })
    .catch((err: Error) => {
      // Explicitly specify 'err' as type 'Error'
      next(err);
    });
});

// Error handler middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle the error, e.g., send an error response
  res.status(500).json({ error: err.message });
});

function someAsyncFunction() {
  return new Promise((resolve, reject) => {
    // Simulated error
    setTimeout(() => {
      reject(new Error('An error occurred'));
    }, 1000);
  });
}

export default router;