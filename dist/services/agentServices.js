"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignAgentService = void 0;
const agent_1 = __importDefault(require("../models/users/agent"));
// Function to assign an agent based on availability and pickup zone
const assignAgentService = async (pickupZone) => {
    try {
        // Find all available agents in the specified zone
        const availableAgents = await agent_1.default.find({
            zone: pickupZone,
            availability: true,
        });
        if (availableAgents.length === 0) {
            return null; // No available agents found in the zone
        }
        // For simplicity, assign the first available agent
        const assignedAgent = availableAgents[0];
        // Optionally update the agent's availability in the database
        // This is recommended if you want to mark the agent as no longer available
        await agent_1.default.updateOne({ _id: assignedAgent._id }, { availability: false });
        return assignedAgent;
    }
    catch (error) {
        console.error('Failed to assign an agent:', error);
        throw error;
    }
};
exports.assignAgentService = assignAgentService;
