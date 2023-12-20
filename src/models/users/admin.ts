import mongoose, { Document } from 'mongoose';
import { IUser, UserSchema } from './user';

interface IAdmin extends IUser {}

const AdminSchema = UserSchema.clone();
AdminSchema.path('role').options.enum.push('admin');

const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
export default AdminModel;