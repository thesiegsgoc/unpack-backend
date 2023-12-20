"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("./user");
const AdminSchema = user_1.UserSchema.clone();
AdminSchema.path('role').options.enum.push('admin');
const AdminModel = mongoose_1.default.model('Admin', AdminSchema);
exports.default = AdminModel;
