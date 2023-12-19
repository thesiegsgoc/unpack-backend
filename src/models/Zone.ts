import mongoose from "mongoose";

const ZonesSchema = new mongoose.Schema({
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

const Zones = mongoose.model("Zones", ZonesSchema);
export default Zones
