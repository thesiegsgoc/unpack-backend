import mongoose, { Document } from 'mongoose'
import { IUserModel, UserSchema } from './user'

interface IAdmin extends IUserModel {}

const AdminSchema = UserSchema.clone()
AdminSchema.path('role').options.enum.push('admin')

const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema)
export default AdminModel
