"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ZonesSchema = new mongoose_1.default.Schema({
    zoneName: {
        type: String,
        required: true,
    },
    zoneHandlers: {
        type: Array,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    centralLocation: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});
const Zones = mongoose_1.default.model("Zones", ZonesSchema);
exports.default = Zones;
