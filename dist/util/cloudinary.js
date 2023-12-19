"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing cloudinary
const cloudinary_1 = require("cloudinary");
// Configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_USER_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
exports.default = cloudinary_1.v2;
