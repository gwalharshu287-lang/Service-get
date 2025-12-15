
export type UserRole = 'GUEST' | 'CLIENT' | 'PROFESSIONAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  location?: string;
}

export enum ServiceCategory {
  ELECTRICIAN = 'Electrician',
  AC_REPAIR = 'AC Repair',
  COMPUTER = 'Computer Repair',
  BIKE = 'Bike Service',
  CAR = 'Car Mechanic',
  PLUMBER = 'Plumber',
  WASHING_MACHINE = 'Washing Machine',
  HOME_DESIGNER = 'Home Designer',
  DECORATOR = 'Decorator',
  CATERING = 'Catering',
  PROGRAM_MANAGER = 'Program Manager',
  PHOTOGRAPHER = 'Photographer',
  DANCER = 'Dancer/Choreographer',
  GYM_TRAINER = 'Gym Trainer',
  TEACHER = 'Tutor/Teacher',
  TRANSPORTER = 'Transporter/Mover',
  OTHER = 'Other'
}

export interface ProProfile {
  id: string;
  userId: string;
  name: string;
  category: ServiceCategory;
  description: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  imageUrl: string;
  workPhotos: string[];
  isVerified: boolean;
  mobile?: string;
  address?: string;
  experience?: number;
  idProof?: {
    front: string;
    back: string;
  };
}

export interface Booking {
  id: string;
  proId: string;
  userId: string;
  proName: string;
  proCategory: string;
  proImage: string;
  date: Date;
  time: string;
  status: 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  totalAmount: number;
  address: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  location?: { address: string; lat?: number; lng?: number };
  type: 'text' | 'image' | 'video' | 'location' | 'call';
  callDetails?: {
    status: 'missed' | 'ended' | 'declined';
    duration?: string;
    callType: 'audio' | 'video';
  };
  timestamp: number;
  isMe: boolean;
}

export interface CallLog {
  id: string;
  proId: string;
  proName: string;
  proImage: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'missed' | 'completed';
  timestamp: Date;
  duration?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'message' | 'system';
  timestamp: number;
}

export type ViewState = 
  | 'LOGIN' 
  | 'REGISTER_CLIENT' 
  | 'REGISTER_PRO' 
  | 'HOME' 
  | 'PRO_LIST' 
  | 'PRO_DETAILS' 
  | 'CHAT' 
  | 'CHAT_LIST'
  | 'FAVORITES' 
  | 'PROFILE'
  | 'BOOK_APPOINTMENT'
  | 'MY_BOOKINGS';
