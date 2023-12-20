import mongoose, {Schema, Document} from "mongoose";
import {IUser} from "./user"

interface IAgent extends IUser {
    businessName: string;
    businessType: 'Sole Proprietorship' | 'Limited Company';
    businessAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    contactDetails: {
        phoneNumbers: string[];
        emailAddresses: string[];
        website?: string;
    };
    businessLicenses: string[];
    taxCertificates: {
        TIN: string;
    };
}

const AgentSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        enum: ['Sole Proprietorship', 'Limited Company'],
        required: true
    },
    businessAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    contactDetails: {
        phoneNumbers: [String],
        emailAddresses: [String],
        website: String
    },
    businessLicenses: [String],
    taxCertificates: {
        TIN: String
    }
});

const AgentModel = mongoose.model<IAgent>('Agent', AgentSchema);
export default AgentModel;