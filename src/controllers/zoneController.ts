import Zone from "../models/zone"; // Adjust if Zone has a named export
import db from '../util/db'; // Adjust if db has a named export
import { distanceTo } from 'geolocation-utils';
import * as util from '../util/scheduling'; // Use * as util if scheduling exports multiple members
import { Request, Response } from 'express';
import { registerZoneService, updateZoneInfoService, deleteZoneService, addZoneHandlerService, deleteZoneHandlerService, updateZoneHandlerAvailabilityService, assignHandlerService, deliveryCostService} from "../services/zoneService";


export const registerZoneController = async (req: Request, res: Response) => {
    try {
        const { zoneName, rate, centralLocation } = req.body;

        if (!zoneName || !rate || !centralLocation.longitude || !centralLocation.latitude) {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name, transportation rate greater than 0, and valid central location.'
            });
        }

        const zoneNameResult = await registerZoneService(zoneName, rate, centralLocation);
        res.json({
            success: true,
            message: `${zoneNameResult} zone is added successfully.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};




export const updateZoneInfoController = async (req: Request, res: Response) => {
    try {
        const { zoneName, rate } = req.body;

        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!rate || rate <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Transportation rate should be greater than 0.'
            });
        }

        await updateZoneInfoService(zoneName, rate);
        res.json({
            success: true,
            message: `Zone ${zoneName}'s info is updated successfully.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteZoneController = async (req: Request, res: Response) => {
    try {
        const { zoneName } = req.body;

        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        await deleteZoneService(zoneName);
        res.json({
            success: true,
            message: `Zone ${zoneName} is deleted successfully.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const addZoneHandlerController = async (req: Request, res: Response) => {
    try {
        const { zoneName, handler } = req.body;

        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        await addZoneHandlerService(zoneName, handler);
        res.json({
            success: true,
            message: `${handler} is successfully added as a handler in zone ${zoneName}.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteZoneHandlerController = async (req: Request, res: Response) => {
    try {
        const { zoneName, handler } = req.body;

        if (!zoneName || zoneName === '') {
            return res.status(400).json({
                success: false,
                message: 'A Zone should at-least have a name.'
            });
        }

        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        await deleteZoneHandlerService(zoneName, handler);
        res.json({
            success: true,
            message: `Handler ${handler} is successfully deleted as a ${zoneName} zone handler.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const updateZoneHandlerAvailabilityController = async (req: Request, res: Response) => {
    try {
        const { handler, available } = req.body;

        if (!handler) {
            return res.status(400).json({
                success: false,
                message: 'Cannot have an empty handler'
            });
        }

        await updateZoneHandlerAvailabilityService(handler, available);
        res.json({
            success: true,
            message: `Handler ${handler}'s availability updated successfully.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const assignHandlerController = async (req: Request, res: Response) => {
    try {
        const { location } = req.body;
        const handlerId = await assignHandlerService(location);

        res.json({
            success: true,
            body: { handlerId },
            message: handlerId ? `Handler successfully scheduled to pick up a package.` : `No available handler found.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deliveryCostController = async (req: Request, res: Response) => {
    try {
        const { pickUpLocation, dropOffLocation, deliveryType } = req.body;

        if (!pickUpLocation || !dropOffLocation || !deliveryType) {
            return res.status(400).json({
                success: false,
                message: `Can't pick-up nor drop a package at an unknown location.`
            });
        }

        const costDetails = await deliveryCostService(pickUpLocation, dropOffLocation, deliveryType);
        res.json({
            success: true,
            body: costDetails,
            message: `Cost details calculated successfully.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
