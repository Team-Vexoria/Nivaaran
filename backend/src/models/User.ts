import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  name: string;
  role: 
    | 'Citizen'
    | 'Community Org / NGO'
    | 'Panchayati Raj Institution (PRI)'
    | 'Urban Local Body (ULB)'
    | 'Government Department'
    | 'University Admin'
    | 'Faculty / Mentor'
    | 'Student'
    | 'Industry / Startup / MSME'
    | 'CSR Organization'
    | 'Research Lab / Innovation Hub'
    | 'Platform Super Admin';
  district?: string;
  block?: string;
  village?: string;
  institutionId?: mongoose.Types.ObjectId;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      required: true,
      enum: [
        'Citizen',
        'Community Org / NGO',
        'Panchayati Raj Institution (PRI)',
        'Urban Local Body (ULB)',
        'Government Department',
        'University Admin',
        'Faculty / Mentor',
        'Student',
        'Industry / Startup / MSME',
        'CSR Organization',
        'Research Lab / Innovation Hub',
        'Platform Super Admin',
      ],
      default: 'Citizen',
    },
    district: { type: String },
    block: { type: String },
    village: { type: String },
    institutionId: { type: Schema.Types.ObjectId, ref: 'University' },
    department: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
