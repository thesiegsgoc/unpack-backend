import mongoose from 'mongoose'
import AgentModel from '../models/users/agent'
interface Agent {
  _id: mongoose.Types.ObjectId
  businessName: string
  businessType: string
  businessAddress: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
  }
  contactDetails: {
    phoneNumbers: string[]
    emailAddresses: string[]
    website?: string
  }
  businessLicenses: string[]
  taxCertificates: {
    TIN?: string
  }
  zone: string // Assuming you add a 'zone' field to your schema to track the agent's zone
  availability: boolean // Assuming you add an 'availability' field to your schema
  isCurrentlyAssigned: boolean
}

type Zone = string

// Function to assign an agent based on availability and pickup zone
export const assignAgentService = async (
  pickupZone: Zone
): Promise<Agent | null | any> => {
  try {
    // Find all available agents in the specified zone
    const availableAgents = await AgentModel.find({
      zone: pickupZone,
      availability: true,
    })

    if (availableAgents.length === 0) {
      return null // No available agents found in the zone
    }

    // For simplicity, assign the first available agent
    const assignedAgent = availableAgents[0]

    // Optionally update the agent's availability in the database
    // This is recommended if you want to mark the agent as no longer available
    await AgentModel.updateOne(
      { _id: assignedAgent._id },
      { availability: false }
    )

    return assignedAgent
  } catch (error) {
    console.error('Failed to assign an agent:', error)
    throw error
  }
}
