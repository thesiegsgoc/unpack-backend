"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/api/users', (req, res, next) => {
    // Simulated asynchronous operation that might produce an error
    someAsyncFunction()
        .then((result) => {
        // Handle the result
        res.json(result);
    })
        .catch((err) => {
        // Explicitly specify 'err' as type 'Error'
        next(err);
    });
});
// Error handler middleware
router.use((err, req, res, next) => {
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
exports.default = router;
