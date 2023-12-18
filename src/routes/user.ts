import express, { Request, Response, NextFunction } from 'express';

const app = express();

app.get('/api/users', (req: Request, res: Response, next: NextFunction) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
