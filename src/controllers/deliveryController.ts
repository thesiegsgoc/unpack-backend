import Cryptr from 'cryptr';
import DeliveryModel from "../models/Delivery"; 
import UserModel from '../models/User';
import { Request, Response } from 'express';
import scheduling from '../util/scheduling';
import db from '../util/db';
import PartnerModel from '../models/Partner';
import OrderModel from '../models/Order';
import * as DeliveryServices from '../services/deliveryService'; //TODO: improve export and import of files
const cryptr = new Cryptr('myTotallySecretKey');
import { IUser } from "../types/user";
// Define types and interfaces
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface AddDeliveryRequestBody {
  receiver: string;
  phoneNumber: string;
  pickup: Coordinates;
  dropoff: string;
  sendorId: string;
  size: string;
  type: string;
  parcel: string;
  notes?: string; // Optional
  quantity: number;
  deliveryTime: string;
  deliveryDate: string;
  dropOffCost: number;
  pickUpCost: number;
  deliveryCost: number;
}

interface DeliveryItemDetails {
  pickup: string;
  dropoff: string;
  time: string;
  date: string;
  status: string;
  deliveryId: string;
  type: string;
  receiver: string;
  sendor: string;
  expoPushToken?: string | number;
  dropOffCost: number;
  pickUpCost: number;
  deliveryCost: number;
  deliveryTime: string; // Adding this property
}


interface DeliveryDetailsFrom {
  fullname: string;
  phone: string;
  email: string;
  pickup: string;
}

interface DeliveryDetailsTo {
  receiver: string;
  phonenumber: string;
  dropoff: string;
}

interface OrderItem {
  name: string;
  parcel: string;
  quantity: number;
  size: string;
}

interface VendorItem {
  fullname?: string;
  avatar?: string;
}

interface PartnerDeliveryItem {
  delivery: DeliveryItemDetails;
  order: OrderItem;
  vendor: VendorItem;
}

type DeliveryItem = /*unresolved*/ any // TODO: Replace with actual type
type GetDeliveryIdsRequestBody = /*unresolved*/ any

interface RequestWithUser extends Request {
  user?: IUser;
}

export const addDeliveryController = async (req: Request<{}, {}, AddDeliveryRequestBody>, res: Response) => {
  try {
      const deliveryData = req.body;
      const result = await DeliveryServices.addDeliveryService(deliveryData);
      return res.json({
          success: true,
          message: 'Delivery ordered successfully',
          trackingNumber: result.trackingNumber,
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};


export const encryptDeliveryDetailsController = async (req: Request, res: Response) => {
  try {
      const { deliveryIds } = req.body;
      const encryptedDetails = await DeliveryServices.encryptDeliveryDetailsService(deliveryIds);
      return res.json({
          success: true,
          body: encryptedDetails,
          message: 'Delivery details have been encrypted successfully.',
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};


 
export const trackDeliveryController = async (req: Request, res: Response) => {
  try {
      const { trackingId } = req.params;
      const trackingDetails = await DeliveryServices.trackDeliveryService(trackingId);

      return res.json({
          success: true,
          body: trackingDetails,
          message: 'Tracking details retrieved successfully.'
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};



export const getUserDeliveryHistoryController = async (req: Request<{ userId: string }>, res: Response) => {
  try {
      const { userId } = req.body;
      const deliveryHistory = await DeliveryServices.getUserDeliveryHistoryService(userId);

      return res.json({
          success: true,
          body: deliveryHistory,
          message: 'User\'s delivery history retrieved successfully.'
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};


export const getPartnerDeliveryHistoryController = async (req: Request<{ partnerId: string }>, res: Response) => {
  try {
      const { partnerId } = req.body;
      const deliveryHistory = await DeliveryServices.getPartnerDeliveryHistoryService(partnerId);

      return res.json({
          success: true,
          body: deliveryHistory,
          message: 'Delivery history retrieved successfully.'
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};

export const getDeliveryIdsController = async (req: Request<{}, {}, GetDeliveryIdsRequestBody>, res: Response) => {
  try {
      const { userID } = req.body;
      const encryptedDeliveryIds = await DeliveryServices.getDeliveryIdsService(userID);

      return res.json({
          success: true,
          body: encryptedDeliveryIds,
          message: 'Delivery details have been encrypted successfully.'
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};


export const pickupDeliveryController = async (req: Request, res: Response) => {
  try {
      const { encryptedData, partnerId } = req.body;
      const result = await DeliveryServices.pickupDeliveryService(encryptedData, partnerId);

      return res.json(result);
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};


export const getHandlersLocationController = async (req: Request, res: Response) => {
  try {
      const { scheduledHandler } = req.body;
      const handlerLocation = await DeliveryServices.getHandlersLocationService(scheduledHandler);

      return res.json({
          success: true,
          body: { handlerLocation },
          message: 'Handlers location retrieved successfully.'
      });
  } catch (error: any) {
      return res.json({ success: false, message: error.message });
  }
};

