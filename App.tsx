

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  MapPin, Moon, Sun, Search, Home as HomeIcon, MessageSquare, 
  Heart, User as UserIcon, LogOut, ArrowLeft, Star, Upload, CheckCircle,
  Loader2, Filter, Wrench, Briefcase, ChevronDown, X, Bell,
  Compass, MessageCircle, Phone, Video, Image as ImageIcon, 
  Camera, Paperclip, Send, MoreVertical, Mic, PhoneOff, MicOff, VideoOff,
  Shield, CreditCard, Play, Share2, ChevronRight, Globe, Lock, HelpCircle, FileText,
  Calendar, Clock, Check, Plus, ArrowUpRight, ArrowDownLeft, PhoneMissed, PhoneIncoming, PhoneOutgoing, Navigation,
  BarChart3, TrendingUp, Users, DollarSign, Wallet, AlertTriangle
} from 'lucide-react';
import { User, UserRole, ViewState, ServiceCategory, ProProfile, ChatMessage, Booking, CallLog, AppNotification } from './types';
import { CATEGORY_ICONS, CATEGORY_IMAGES, MOCK_PROS, INDIAN_CITIES } from './constants';
import { findCategoryFromQuery, generateProBio } from './services/geminiService';

// --- Components defined within App.tsx to avoid file explosion ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }: any) => {
  const baseStyle = "px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] tracking-wide";
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg shadow-primary-500/25 border border-transparent",
    secondary: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 border border-white/20 dark:border-gray-700 shadow-sm",
    outline: "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500 bg-transparent",
    ghost: "text-gray-500 hover:text-primary-600 hover:bg-primary-50/50 dark:hover:bg-gray-800/50",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${fullWidth ? 'w-full' : ''} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange, min }: any) => (
  <div className="mb-5">
    {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">{label}</label>}
    <input
      type={type}
      min={min}
      className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all shadow-sm hover:bg-white dark:hover:bg-gray-900"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

// Push Notification Component
const PushNotificationItem: React.FC<{ data: AppNotification; onDismiss: () => void }> = ({ data, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} w-full max-w-sm mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-4 rounded-2xl shadow-xl flex gap-4 items-start relative pointer-events-auto`}
      onClick={onDismiss}
    >
      <div className={`p-2.5 rounded-full flex-shrink-0 ${
        data.type === 'booking' ? 'bg-amber-100 text-amber-600' : 
        data.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {data.type === 'booking' ? <Calendar className="w-5 h-5" /> : 
         data.type === 'message' ? <MessageCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </div>
      <div className="flex-1 pt-0.5">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{data.title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{data.message}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">Just now</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Mock volume icon
const Volume2 = ({className}: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;

// --- Main App ---

export default function App() {
  // State
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Auth State
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [signupName, setSignupName] = useState('');

  // Search & Data State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [pros, setPros] = useState<ProProfile[]>(MOCK_PROS);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Mock bookings with mixed statuses for demo
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'bk_1',
      proId: 'p1', // Corresponds to Robert Fox (if testing as Pro p1)
      userId: 'u_guest',
      proName: 'Robert Fox',
      proCategory: 'Electrician',
      proImage: 'https://picsum.photos/200/200?random=1',
      date: new Date(Date.now() + 86400000),
      time: '10:00 AM',
      status: 'PENDING',
      notes: 'Need to fix a short circuit in the kitchen.',
      totalAmount: 45,
      address: 'Bandra West, Mumbai'
    },
    {
      id: 'bk_2',
      proId: 'p2',
      userId: 'u1', // Corresponds to current user if testing as Client
      proName: 'Jenny Wilson',
      proCategory: 'Home Designer',
      proImage: 'https://picsum.photos/200/200?random=2',
      date: new Date(Date.now() + 172800000),
      time: '02:00 PM',
      status: 'UPCOMING',
      notes: 'Consultation for living room renovation.',
      totalAmount: 80,
      address: 'Indiranagar, Bangalore'
    }
  ]); 
  
  const [isSearching, setIsSearching] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<ProProfile | null>(null);
  
  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'CONFIRM' | 'SUCCESS'>('SELECT');
  const [bookingData, setBookingData] = useState<{date: Date | null, time: string | null, notes: string, address: string}>({
    date: null,
    time: null,
    notes: '',
    address: ''
  });
  
  // Moved state from renderBookAppointment to fix hook rules violation
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationMapUrl, setLocationMapUrl] = useState<string | null>(null);

  // Location State
  const [currentLocation, setCurrentLocation] = useState('New Delhi, Delhi');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationMode, setLocationMode] = useState<'GLOBAL' | 'CHAT' | 'BOOKING'>('GLOBAL');

  // Chat & Call State
  const [activeChatPro, setActiveChatPro] = useState<ProProfile | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [callActive, setCallActive] = useState<{type: 'AUDIO'|'VIDEO', name: string, avatar: string, status: string, proId: string} | null>(null);
  const [chatListTab, setChatListTab] = useState<'MESSAGES' | 'CALLS'>('MESSAGES');
  const [callHistory, setCallHistory] = useState<CallLog[]>([
    {
       id: 'c1',
       proId: 'p1',
       proName: 'Robert Fox',
       proImage: 'https://picsum.photos/200/200?random=1',
       type: 'audio',
       direction: 'incoming',
       status: 'missed',
       timestamp: new Date(Date.now() - 86400000), // Yesterday
       duration: '0s'
    }
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Mock initial messages
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    'p1': [
      { id: '1', senderId: 'p1', text: 'Hi! I can help with your electrical wiring issue.', type: 'text', timestamp: Date.now() - 100000, isMe: false },
      { id: '2', senderId: 'u1', text: 'Great, are you available tomorrow?', type: 'text', timestamp: Date.now() - 90000, isMe: true },
    ]
  });

  // Pro Onboarding State
  const [newProData, setNewProData] = useState({
    name: '',
    category: ServiceCategory.ELECTRICIAN,
    hourlyRate: '',
    experience: '',
    description: '',
    mobile: '',
    address: '',
    photos: [] as File[],
    idProofFront: null as File | null,
    idProofBack: null as File | null
  });
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, activeChatPro, view]);

  // Simulated Push Notifications Effect
  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    // Simulate incoming booking request for Pro
    const timer1 = setTimeout(() => {
      if (user.role === 'PROFESSIONAL') {
        addNotification({
          title: 'New Job Request',
          message: 'AC Repair request near Bandra West. Value: $50',
          type: 'booking'
        });
      }
    }, 6000);

    // Simulate incoming message for Client
    const timer2 = setTimeout(() => {
      if (user.role === 'CLIENT') {
        addNotification({
          title: 'New Message',
          message: 'Robert Fox: I have arrived at the location.',
          type: 'message'
        });
      }
    }, 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { ...notif, id, timestamp: Date.now() };
    setNotifications(prev => [newNotif, ...prev]);

    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Handlers
  const handleLogin = (role: UserRole) => {
    // If Professional login, assume ID 'p1' for demo purposes if not registering
    // If registering, the handleProSignupSubmit will override this.
    const userId = role === 'PROFESSIONAL' && view !== 'REGISTER_PRO' ? 'p1' : 'u1';
    
    setUser({
      id: userId,
      name: authMode === 'SIGN_UP' && signupName ? signupName : (role === 'PROFESSIONAL' ? 'Robert Fox' : 'Alex Johnson'),
      email: loginEmail || 'alex@example.com',
      role: role,
      location: currentLocation,
      avatarUrl: role === 'PROFESSIONAL' ? 'https://picsum.photos/200/200?random=1' : 'https://picsum.photos/100/100'
    });
    setView(role === 'PROFESSIONAL' ? 'HOME' : 'HOME');
    
    // Welcome notification
    setTimeout(() => {
       addNotification({
         title: `Welcome back, ${role === 'PROFESSIONAL' ? 'Robert' : 'Alex'}`,
         message: 'You have successfully logged in.',
         type: 'system'
       });
    }, 1000);
  };

  const toggleFavorite = (e: React.MouseEvent, proId: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(proId) ? prev.filter(id => id !== proId) : [...prev, proId]
    );
  };

  const handleBookClick = (pro: ProProfile) => {
    setSelectedPro(pro);
    setBookingData({ date: null, time: null, notes: '', address: currentLocation });
    setBookingStep('SELECT');
    setView('BOOK_APPOINTMENT');
  };

  const handleConfirmBooking = () => {
    if (!selectedPro || !bookingData.date || !bookingData.time) return;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      proId: selectedPro.id,
      userId: user?.id || 'u1',
      proName: selectedPro.name,
      proCategory: selectedPro.category,
      proImage: selectedPro.imageUrl,
      date: bookingData.date,
      time: bookingData.time,
      status: 'PENDING', // Default to Pending for Pro approval
      notes: bookingData.notes,
      totalAmount: selectedPro.hourlyRate, // Basic estimation
      address: bookingData.address
    };

    setBookings(prev => [newBooking, ...prev]);
    setBookingStep('SUCCESS');
    
    // Simulate notification for client
    addNotification({
      title: 'Booking Sent',
      message: `Request sent to ${selectedPro.name}. Waiting for approval.`,
      type: 'system'
    });
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAiSuggestion(null);
    
    // Attempt to use Gemini to categorise
    const result = await findCategoryFromQuery(searchQuery);
    
    if (result) {
      setSelectedCategory(result.category);
      setAiSuggestion(`${result.reasoning} (${result.suggestedAction})`);
      setView('PRO_LIST');
    } else {
      // Fallback: simple text filter
      setAiSuggestion("Here are professionals matching your text search.");
      setSelectedCategory(null); // Clear strict category to show text results
      setView('PRO_LIST');
    }
    setIsSearching(false);
  };

  const handleProSignupSubmit = () => {
    const newId = `p${Date.now()}`;
    const newPro: ProProfile = {
      id: newId,
      userId: newId, // Self mapped for simplicity
      name: newProData.name || 'New Professional',
      category: newProData.category,
      description: newProData.description,
      hourlyRate: Number(newProData.hourlyRate),
      rating: 5.0,
      reviewCount: 0,
      location: currentLocation,
      imageUrl: 'https://picsum.photos/200/200?random=99',
      workPhotos: newProData.photos.map(() => `https://picsum.photos/400/300?random=${Math.random()}`),
      isVerified: false,
      mobile: newProData.mobile,
      address: newProData.address,
      experience: Number(newProData.experience),
      idProof: {
        front: newProData.idProofFront ? URL.createObjectURL(newProData.idProofFront) : 'https://picsum.photos/300/200?random=front',
        back: newProData.idProofBack ? URL.createObjectURL(newProData.idProofBack) : 'https://picsum.photos/300/200?random=back'
      }
    };
    
    setPros([newPro, ...pros]);
    // Set user as this pro
    setUser({
        id: newId,
        name: newPro.name,
        email: loginEmail,
        role: 'PROFESSIONAL',
        location: newPro.location,
        avatarUrl: newPro.imageUrl
    });
    setView('HOME'); // Go to Pro Dashboard
  };

  const generateBio = async () => {
    if (!newProData.category) return;
    setIsGeneratingBio(true);
    const bio = await generateProBio(newProData.category, ["Experienced", "Professional", "Reliable"]);
    setNewProData(prev => ({ ...prev, description: bio }));
    setIsGeneratingBio(false);
  }

  // Booking Actions for Pros/Clients
  const updateBookingStatus = (bookingId: string, newStatus: 'UPCOMING' | 'CANCELLED' | 'COMPLETED') => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    
    if (newStatus === 'UPCOMING') {
      addNotification({ title: 'Booking Accepted', message: 'You have accepted the job.', type: 'booking' });
    } else if (newStatus === 'CANCELLED') {
      addNotification({ title: 'Booking Cancelled', message: 'The booking has been cancelled.', type: 'system' });
    }
  };

  // Chat Handlers
  const sendMessage = (type: 'text' | 'image' | 'location' = 'text', content: any = null) => {
    if (!activeChatPro) return;
    if (type === 'text' && !chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || 'u1',
      isMe: true,
      timestamp: Date.now(),
      type: type,
      text: type === 'text' ? chatInput : undefined,
      imageUrl: type === 'image' ? content : undefined,
      location: type === 'location' ? content : undefined,
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChatPro.id]: [...(prev[activeChatPro.id] || []), newMessage]
    }));
    setChatInput('');
    setShowAttachMenu(false);
  };

  const openChat = (pro: ProProfile) => {
    setActiveChatPro(pro);
    setView('CHAT');
  };
  
  const handleViewProDetails = (pro: ProProfile) => {
    setSelectedPro(pro);
    setView('PRO_DETAILS');
  };

  const startCall = (type: 'AUDIO' | 'VIDEO', targetPro?: ProProfile) => {
    const proToCall = targetPro || activeChatPro;
    if (proToCall) {
      setCallActive({
        type,
        name: proToCall.name,
        avatar: proToCall.imageUrl,
        status: 'Calling...',
        proId: proToCall.id
      });
      // Mock connection
      setTimeout(() => {
        setCallActive(prev => prev ? {...prev, status: 'Connected (00:00)'} : null);
      }, 2000);
    }
  };

  const endCall = () => {
    if (!callActive) return;
    
    // Create Call Log
    const duration = "4m 12s"; // Mock duration
    const newCallLog: CallLog = {
      id: `call_${Date.now()}`,
      proId: callActive.proId,
      proName: callActive.name,
      proImage: callActive.avatar,
      type: callActive.type === 'AUDIO' ? 'audio' : 'video',
      direction: 'outgoing',
      status: 'completed',
      timestamp: new Date(),
      duration: duration
    };

    setCallHistory(prev => [newCallLog, ...prev]);

    // Add message to chat
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'u1',
      isMe: true,
      timestamp: Date.now(),
      type: 'call',
      callDetails: {
          status: 'ended',
          duration: duration,
          callType: callActive.type === 'AUDIO' ? 'audio' : 'video'
      }
    };
    
    setChatMessages(prev => ({
      ...prev,
      [callActive.proId]: [...(prev[callActive.proId] || []), newMessage]
    }));

    setCallActive(null);
  };

  const renderBookAppointment = () => {
    if (!selectedPro) return null;
    
    const handleShareLocation = () => {
        setIsGettingLocation(true);
        // Simulate GPS fetch and map generation
        setTimeout(() => {
            setIsGettingLocation(false);
            const mockAddress = "123, Tech Park, Indiranagar, Bangalore, Karnataka 560038";
            // Set a static map image to simulate Google Maps preview
            setLocationMapUrl("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80");
            setBookingData(prev => ({
                ...prev, 
                address: mockAddress + "\n(📍 Exact Location Shared)",
                notes: prev.notes + "\n[Google Maps Location: https://maps.google.com/?q=12.9716,77.5946]"
            }));
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 animate-slide-up">
            {renderHeader()}
            <div className="p-6">
                <button onClick={() => setView('PRO_DETAILS')} className="flex items-center text-gray-500 mb-6">
                     <ArrowLeft className="w-5 h-5 mr-1" /> Back
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Book Appointment</h2>

                {bookingStep === 'SUCCESS' ? (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Requested!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Your request has been sent to {selectedPro.name}. You will be notified once they accept.
                        </p>
                        <Button fullWidth onClick={() => setView('MY_BOOKINGS')}>View My Bookings</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <img src={selectedPro.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{selectedPro.name}</h3>
                                <p className="text-sm text-gray-500">{selectedPro.category}</p>
                                <p className="text-sm font-bold text-primary-600">${selectedPro.hourlyRate}/hr</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                                    onChange={(e) => setBookingData({...bookingData, date: new Date(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                                <input 
                                    type="time" 
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                                />
                            </div>
                            
                            {/* Enhanced Location Section */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Service Location</label>
                                <div className="bg-gray-50 dark:bg-gray-800/30 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <textarea 
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-none outline-none text-gray-900 dark:text-white resize-none h-24 text-sm rounded-xl mb-1 focus:ring-2 focus:ring-primary-500/20"
                                        value={bookingData.address}
                                        onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                                        placeholder="Enter address manually..."
                                    />
                                    
                                    {locationMapUrl && (
                                        <div className="relative w-full h-32 mb-1 rounded-xl overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700 mx-auto">
                                            <img src={locationMapUrl} alt="Map Location" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-bold text-xs bg-black/50 px-2 py-1 rounded">Open Google Maps</span>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-1 rounded shadow-sm">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1428px-Google_Maps_icon_%282020%29.svg.png" className="w-6 h-6" alt="GMaps" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="px-0 pb-0">
                                        <button 
                                            onClick={handleShareLocation}
                                            disabled={isGettingLocation}
                                            className="w-full py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isGettingLocation ? (
                                                <>
                                                   <Loader2 className="w-4 h-4 animate-spin" />
                                                   Fetching GPS...
                                                </>
                                            ) : (
                                                <>
                                                   <MapPin className="w-4 h-4 fill-current" />
                                                   Share Exact Location on Google Map
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 px-1">
                                   * Sharing your exact location via Google Maps ensures the professional reaches you without hassle.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                                <textarea 
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 resize-none h-24"
                                    placeholder="Describe the issue..."
                                    value={bookingData.notes}
                                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                                />
                            </div>
                        </div>

                        <Button fullWidth onClick={handleConfirmBooking} disabled={!bookingData.date || !bookingData.time}>
                            Confirm Booking
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderMyBookings = () => {
    const myBookings = bookings.filter(b => user?.role === 'PROFESSIONAL' ? b.proId === user.id : b.userId === user?.id);

    return (
        <div className="min-h-screen premium-gradient pb-24">
            {renderHeader()}
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{user?.role === 'PROFESSIONAL' ? 'Job Requests' : 'My Bookings'}</h2>

                <div className="space-y-4">
                    {myBookings.length > 0 ? myBookings.map(booking => (
                        <div key={booking.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                     <img src={booking.proImage} className="w-12 h-12 rounded-2xl object-cover" />
                                     <div>
                                         <h3 className="font-bold text-gray-900 dark:text-white">{booking.proName}</h3>
                                         <p className="text-xs text-gray-500">{booking.proCategory}</p>
                                     </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    booking.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                    booking.status === 'UPCOMING' ? 'bg-blue-100 text-blue-600' :
                                    booking.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                    {booking.status}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 text-primary-500" />
                                    {new Date(booking.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4 text-primary-500" />
                                    {booking.time}
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{booking.address}</span>
                            </div>

                            {user?.role === 'PROFESSIONAL' && booking.status === 'PENDING' && (
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" fullWidth onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}>Decline</Button>
                                    <Button fullWidth onClick={() => updateBookingStatus(booking.id, 'UPCOMING')}>Accept</Button>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">No bookings yet</h3>
                        </div>
                    )}
                </div>
            </div>
            {renderBottomNav()}
        </div>
    );
  };

  const renderFavorites = () => {
    const favoritePros = pros.filter(p => favorites.includes(p.id));

    return (
        <div className="min-h-screen premium-gradient pb-24">
            {renderHeader()}
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Favorites</h2>
                <div className="space-y-4">
                    {favoritePros.length > 0 ? (
                        favoritePros.map(pro => renderProCard(pro))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Heart className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">No favorites yet</h3>
                            <p className="text-sm text-gray-500 mt-2">Mark professionals as favorites to see them here.</p>
                        </div>
                    )}
                </div>
            </div>
            {renderBottomNav()}
        </div>
    );
  };

  // Views
  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-slide-up">
        {/* Decorative background blur */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none rotate-45"></div>

        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-glow transform rotate-3 hover:rotate-6 transition-transform duration-500 border border-white/20">
            <Wrench className="w-10 h-10 text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">ServiMate</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Connect with local experts</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl relative z-10 mt-6">
          <button 
            onClick={() => setAuthMode('SIGN_IN')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === 'SIGN_IN' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthMode('SIGN_UP')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === 'SIGN_UP' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'}`}
          >
            Create Account
          </button>
        </div>

        <div className="space-y-4 relative z-10 pt-2">
          {authMode === 'SIGN_UP' && (
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              value={signupName}
              onChange={(e: any) => setSignupName(e.target.value)}
            />
          )}
          <Input 
            label="Email Address" 
            placeholder="hello@example.com" 
            value={loginEmail}
            onChange={(e: any) => setLoginEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={loginPass}
            onChange={(e: any) => setLoginPass(e.target.value)}
          />
          
          <Button fullWidth onClick={() => handleLogin('CLIENT')}>
            {authMode === 'SIGN_IN' ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-gray-500 font-medium backdrop-blur-sm">Or</span></div>
          </div>

          <button 
            onClick={() => handleLogin('CLIENT')}
            className="w-full py-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-3 bg-white/50 dark:bg-gray-900/50 group"
          >
             <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
             <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">Continue with Google</span>
          </button>
        </div>

        {/* Separate Section for Professionals */}
        <div className="pt-8 relative z-10 mt-4">
           <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl flex flex-col items-center justify-center border border-primary-100 dark:border-primary-800/30">
               <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-3">Are you a skilled professional?</p>
               <button 
                 onClick={() => setView('REGISTER_PRO')} 
                 className="text-primary-600 dark:text-primary-400 font-bold text-sm bg-white dark:bg-gray-800 py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
               >
                 <Briefcase className="w-4 h-4" />
                 Join as a Pro
               </button>
           </div>
        </div>
      </div>
    </div>
  );

  const renderProRegister = () => (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-md mx-auto animate-slide-up">
        <div className="flex items-center mb-8">
          <button onClick={() => setView('LOGIN')} className="p-2.5 -ml-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
          </button>
          <h1 className="text-2xl font-bold ml-4 text-gray-900 dark:text-white">Create Pro Profile</h1>
        </div>

        <div className="space-y-6 glass-panel p-6 rounded-3xl shadow-sm">
          <Input 
            label="Display Name" 
            value={newProData.name} 
            onChange={(e: any) => setNewProData({...newProData, name: e.target.value})} 
            placeholder="e.g. Expert Electrical"
          />
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Category</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none transition-all hover:bg-white dark:hover:bg-gray-900"
                value={newProData.category}
                onChange={(e) => setNewProData({...newProData, category: e.target.value as ServiceCategory})}
              >
                {Object.values(ServiceCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-4.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
               <Input 
                 label="Hourly Rate ($)" 
                 type="number" 
                 value={newProData.hourlyRate} 
                 onChange={(e: any) => setNewProData({...newProData, hourlyRate: e.target.value})} 
                 placeholder="50"
               />
             </div>
             <div className="flex-1">
                <Input 
                 label="Experience (Yrs)" 
                 type="number" 
                 min="0"
                 value={newProData.experience} 
                 onChange={(e: any) => setNewProData({...newProData, experience: e.target.value})} 
                 placeholder="5"
               />
             </div>
          </div>

          <Input 
            label="Mobile Number" 
            type="tel"
            value={newProData.mobile} 
            onChange={(e: any) => setNewProData({...newProData, mobile: e.target.value})} 
            placeholder="+91 98765 43210"
          />

          <div>
             <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Bio / Description</label>
               <button 
                 onClick={generateBio}
                 disabled={isGeneratingBio}
                 className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
               >
                 {isGeneratingBio ? <Loader2 className="w-3 h-3 animate-spin"/> : <Star className="w-3 h-3"/>}
                 Generate with AI
               </button>
             </div>
             <textarea 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white h-32 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none transition-all hover:bg-white dark:hover:bg-gray-900"
              placeholder="Tell us about your services and skills..."
              value={newProData.description}
              onChange={(e) => setNewProData({...newProData, description: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Full Address</label>
             <textarea 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white h-24 focus:ring-2 focus:ring-primary-500/50 outline-none resize-none transition-all hover:bg-white dark:hover:bg-gray-900"
              placeholder="Shop No, Street, Area..."
              value={newProData.address}
              onChange={(e) => setNewProData({...newProData, address: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">ID Proof & Certifications</label>
            <div className="grid grid-cols-2 gap-3">
               <button className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Front ID</span>
               </button>
               <button className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Certificates</span>
               </button>
            </div>
          </div>

          <Button fullWidth onClick={() => {
            // handleLogin('PROFESSIONAL');
            handleProSignupSubmit();
          }}>Complete Registration</Button>
        </div>
      </div>
    </div>
  );

  const renderLocationModal = () => {
    if (!isLocationOpen) return null;
    
    const filteredCities = INDIAN_CITIES.filter(city => 
      city.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const handleLocationSelect = (selectedLoc: string) => {
      if (locationMode === 'CHAT') {
        sendMessage('location', { address: selectedLoc, lat: 28.61, lng: 77.20 }); // Mock Coords
        setLocationMode('GLOBAL'); // Reset mode
      } else if (locationMode === 'BOOKING') {
        setBookingData(prev => ({...prev, address: selectedLoc}));
        // We stay in booking mode implicitly until modal closes
      } else {
        setCurrentLocation(selectedLoc);
      }
      setIsLocationOpen(false);
    };

    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[85vh] flex flex-col overflow-hidden animate-slide-up sm:animate-none border border-white/20 dark:border-gray-800">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locationMode === 'CHAT' ? 'Share Location' : locationMode === 'BOOKING' ? 'Service Location' : 'Select Location'}
            </h2>
            <button onClick={() => { setIsLocationOpen(false); setLocationMode('GLOBAL'); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          
          <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search city..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button 
              onClick={() => handleLocationSelect(locationMode === 'CHAT' || locationMode === 'BOOKING' ? "Current GPS Location" : "Mumbai, Maharashtra")}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-primary-600 bg-primary-50/50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors border border-primary-100 dark:border-primary-800/30"
            >
               <MapPin className="w-5 h-5" />
               <div className="text-left">
                 <p className="font-semibold text-sm">Use Current Location</p>
                 <p className="text-xs opacity-70">Using GPS</p>
               </div>
            </button>
            
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-400 mb-3 px-2 tracking-wider">ALL CITIES</p>
              {filteredCities.length > 0 ? filteredCities.map((city, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLocationSelect(city)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm flex items-center justify-between group ${locationMode === 'GLOBAL' && currentLocation === city ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700' : ''}`}
                >
                  <span className={`text-sm ${locationMode === 'GLOBAL' && currentLocation === city ? 'font-bold text-primary-600' : 'text-gray-700 dark:text-gray-300'} font-medium`}>
                    {city}
                  </span>
                  {locationMode === 'GLOBAL' && currentLocation === city && <CheckCircle className="w-4 h-4 text-primary-600" />}
                </button>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No cities found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCallOverlay = () => {
    if (!callActive) return null;
    return (
      <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-xl flex flex-col items-center justify-between py-12 px-6 animate-in fade-in duration-300">
        <div className="flex flex-col items-center mt-20">
           <div className="relative">
             <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping"></div>
             <img src={callActive.avatar} alt="caller" className="w-32 h-32 rounded-full border-4 border-gray-800 shadow-glow mb-8 object-cover relative z-10" />
           </div>
           <h2 className="text-3xl font-bold text-white mb-2">{callActive.name}</h2>
           <p className="text-gray-400 text-lg font-medium">{callActive.status}</p>
        </div>

        <div className="flex items-center gap-8 mb-12">
           <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all scale-95 hover:scale-100">
             <MicOff className="w-8 h-8" />
           </button>
           <button 
             onClick={endCall}
             className="p-6 bg-red-500 rounded-full text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/40 scale-110 active:scale-95"
           >
             <PhoneOff className="w-10 h-10 fill-white" />
           </button>
           {callActive.type === 'VIDEO' ? (
             <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all scale-95 hover:scale-100">
               <VideoOff className="w-8 h-8" />
             </button>
           ) : (
             <button className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all scale-95 hover:scale-100">
               <Volume2 className="w-8 h-8" />
             </button>
           )}
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between transition-colors border-b border-gray-200/50 dark:border-gray-800/50">
      <div 
        onClick={() => { setIsLocationOpen(true); setLocationMode('GLOBAL'); }}
        className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-4"
      >
        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0 flex items-center justify-center text-primary-600 group-hover:scale-105 transition-transform">
           <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Location</p>
          <div className="flex items-center gap-1 w-full">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentLocation}</p>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2.5 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative shadow-sm border border-gray-100 dark:border-gray-700">
           <Bell className="w-5 h-5" />
           <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
        </button>
      </div>
    </header>
  );

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 z-50 pb-safe">
      <div className="flex justify-around items-center px-4 py-3">
        <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-1 ${view === 'HOME' ? 'text-primary-600' : 'text-gray-400'}`}>
          {user?.role === 'PROFESSIONAL' ? <BarChart3 className={`w-6 h-6 ${view === 'HOME' ? 'fill-current' : ''}`} /> : <HomeIcon className={`w-6 h-6 ${view === 'HOME' ? 'fill-current' : ''}`} />}
          <span className="text-[10px] font-medium">{user?.role === 'PROFESSIONAL' ? 'Dashboard' : 'Home'}</span>
        </button>
        <button onClick={() => setView('MY_BOOKINGS')} className={`flex flex-col items-center gap-1 ${view === 'MY_BOOKINGS' ? 'text-primary-600' : 'text-gray-400'}`}>
          <Calendar className={`w-6 h-6 ${view === 'MY_BOOKINGS' ? 'text-current' : ''}`} />
          <span className="text-[10px] font-medium">{user?.role === 'PROFESSIONAL' ? 'Jobs' : 'Bookings'}</span>
        </button>
        <button onClick={() => setView('CHAT_LIST')} className={`flex flex-col items-center gap-1 ${view === 'CHAT_LIST' ? 'text-primary-600' : 'text-gray-400'}`}>
          <MessageCircle className={`w-6 h-6 ${view === 'CHAT_LIST' ? 'text-current fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button onClick={() => setView('FAVORITES')} className={`flex flex-col items-center gap-1 ${view === 'FAVORITES' ? 'text-primary-600' : 'text-gray-400'}`}>
          {user?.role === 'PROFESSIONAL' ? <Wallet className={`w-6 h-6 ${view === 'FAVORITES' ? 'fill-current' : ''}`} /> : <Heart className={`w-6 h-6 ${view === 'FAVORITES' ? 'fill-current' : ''}`} />}
          <span className="text-[10px] font-medium">{user?.role === 'PROFESSIONAL' ? 'Earnings' : 'Favorites'}</span>
        </button>
        <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1 ${view === 'PROFILE' ? 'text-primary-600' : 'text-gray-400'}`}>
          <UserIcon className={`w-6 h-6 ${view === 'PROFILE' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );

  const renderClientHome = () => (
    <div className="pb-28 premium-gradient min-h-screen">
      {renderHeader()}
      
      {/* Hero Section */}
      <div className="relative rounded-b-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 overflow-hidden">
         {/* Background Image Layer */}
         <div className="absolute inset-0 z-0">
            <div 
               className="w-full h-full bg-cover bg-center opacity-80 dark:opacity-40"
               style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581578731117-104f8a338e83?q=80&w=1000&auto=format&fit=crop)' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-gray-950/80 dark:via-gray-950/90 dark:to-gray-950 backdrop-blur-[1px]"></div>
         </div>

        <div className="relative z-10 px-6 pt-6 pb-12">
          {/* Decorative Blobs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
          <div className="absolute top-20 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>

          <div className="relative z-10 mt-2">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">{user?.name.split(' ')[0]}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 font-medium text-lg max-w-[80%]">Find expert help for your home needs.</p>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-gray-700 flex items-center p-2 transition-all transform group-focus-within:scale-[1.01]">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    className="w-full pl-3 pr-4 py-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 outline-none font-medium"
                    placeholder="Search 'AC Repair'..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                  />
                  <button 
                    className="bg-primary-600 p-3 rounded-xl text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95"
                    onClick={handleSmartSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin"/> : <Filter className="w-5 h-5"/>}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Services</h3>
          <button className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:opacity-80 transition-opacity">View All</button>
        </div>
        
        <div className="grid grid-cols-4 gap-x-4 gap-y-8">
          {Object.values(ServiceCategory).slice(0, 12).map((cat) => {
            const imageUrl = CATEGORY_IMAGES[cat];
            return (
              <button 
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setAiSuggestion(null);
                  setView('PRO_LIST');
                }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-md shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                   <img src={imageUrl} alt={cat} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-50"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 text-center leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 w-full tracking-wide">{cat.replace('Service', '').replace('Repair', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Section */}
      <div className="px-6 pb-6">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6 tracking-tight">Top Rated Pros</h3>
        <div className="space-y-6">
           {pros.slice(0,3).map(pro => renderProCard(pro))}
        </div>
      </div>
      {renderBottomNav()}
    </div>
  );

  const renderProDashboard = () => (
    <div className="pb-28 premium-gradient min-h-screen">
      {renderHeader()}
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
        
        {/* Stats Grid - Analysis View */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-start gap-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">$450</span>
              <span className="text-xs text-gray-500 font-medium">Total Earnings</span>
           </div>
           <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-start gap-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">12</span>
              <span className="text-xs text-gray-500 font-medium">Jobs Done</span>
           </div>
           <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-start gap-2">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-2xl text-amber-600">
                <Star className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">4.9</span>
              <span className="text-xs text-gray-500 font-medium">Rating</span>
           </div>
           <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-start gap-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">85</span>
              <span className="text-xs text-gray-500 font-medium">Profile Views</span>
           </div>
        </div>

        {/* Recent Requests */}
        <div className="mb-6">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Requests</h3>
             <button onClick={() => setView('MY_BOOKINGS')} className="text-primary-600 text-sm font-bold">View All</button>
           </div>
           
           <div className="space-y-4">
              {bookings.filter(b => b.proId === user?.id && b.status === 'PENDING').length > 0 ? (
                 bookings.filter(b => b.proId === user?.id && b.status === 'PENDING').slice(0,2).map(booking => (
                   <div key={booking.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600">
                           <UserIcon className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">New Booking</p>
                            <p className="text-xs text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <button onClick={() => setView('MY_BOOKINGS')} className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl">Review</button>
                   </div>
                 ))
              ) : (
                <div className="text-center py-8 text-gray-400 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p>No new requests</p>
                </div>
              )}
           </div>
        </div>
      </div>
      {renderBottomNav()}
    </div>
  );

  const renderHome = () => {
    if (user?.role === 'PROFESSIONAL') {
      return renderProDashboard();
    }
    return renderClientHome();
  };

  const renderProCard = (pro: ProProfile) => (
    <div key={pro.id} onClick={() => handleViewProDetails(pro)} className="group glass-panel rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.99] cursor-pointer relative overflow-hidden border border-white/60 dark:border-gray-700/50">
      {/* Favorite Button on Card */}
      <button 
        onClick={(e) => toggleFavorite(e, pro.id)}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/40 dark:bg-black/40 backdrop-blur-md hover:bg-white/60 transition-colors shadow-sm border border-white/20"
      >
        <Heart className={`w-4 h-4 transition-colors ${favorites.includes(pro.id) ? 'fill-red-500 text-red-500' : 'text-gray-800 dark:text-white'}`} />
      </button>

      <div className="relative flex-shrink-0">
        <img src={pro.imageUrl} alt={pro.name} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
        {pro.isVerified && (
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900">
            <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-100 dark:fill-blue-900/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex justify-between items-start mb-1 pr-10">
           <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">{pro.name}</h4>
              <p className="text-xs text-primary-700 dark:text-primary-300 font-bold bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md inline-block mb-1 border border-primary-100 dark:border-primary-800/30">{pro.category}</p>
           </div>
           <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30">
             <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
             <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{pro.rating}</span>
           </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed font-medium">{pro.description}</p>
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/50 pt-3">
          <span className="text-lg font-extrabold text-gray-900 dark:text-white">${pro.hourlyRate}<span className="text-xs font-medium text-gray-400 ml-0.5">/hr</span></span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); openChat(pro); }}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); startCall('AUDIO', pro); }}
              className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-800/50"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleBookClick(pro); }}
              className="px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2"
            >
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProList = () => {
    // Filter logic
    let displayedPros = pros;
    if (selectedCategory) {
      displayedPros = pros.filter(p => p.category === selectedCategory);
    } else if (searchQuery) {
       // Simple text fallback search
       const q = searchQuery.toLowerCase();
       displayedPros = pros.filter(p => 
         p.name.toLowerCase().includes(q) || 
         p.description.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q)
       );
    }

    return (
      <div className="pb-24 min-h-screen premium-gradient">
        <div className="sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setView('HOME')} className="p-2 -ml-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {selectedCategory || "Search Results"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{displayedPros.length} professionals found</p>
          </div>
        </div>

        {aiSuggestion && (
           <div className="mx-6 mt-6 p-5 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-900 border border-primary-100 dark:border-primary-800/50 rounded-2xl shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="flex gap-4 relative z-10">
               <div className="mt-1">
                 <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse ring-4 ring-primary-100 dark:ring-primary-900/30" />
               </div>
               <div>
                  <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wide">AI Match</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{aiSuggestion}</p>
               </div>
             </div>
           </div>
        )}

        <div className="px-6 py-6 space-y-4">
          {displayedPros.length > 0 ? (
            displayedPros.map(pro => renderProCard(pro))
          ) : (
             <div className="text-center py-24">
                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No professionals found</h3>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Try searching for a different service or category.</p>
             </div>
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  const renderProDetails = () => {
    if (!selectedPro) return null;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 animate-slide-up">
         {/* Header with Back Button */}
         <div className="sticky top-0 z-30 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
            <button onClick={() => setView('PRO_LIST')} className="p-2 -ml-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Pro Details</h1>
            <div className="flex gap-2">
              <button 
                onClick={(e) => toggleFavorite(e, selectedPro.id)} 
                className="p-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors border border-gray-100 dark:border-gray-800"
              >
                 <Heart className={`w-5 h-5 transition-colors ${favorites.includes(selectedPro.id) ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-white'}`} />
              </button>
              <button className="p-2.5 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors border border-gray-100 dark:border-gray-800">
                 <Share2 className="w-5 h-5 text-gray-700 dark:text-white" />
              </button>
            </div>
         </div>

         <div className="p-6">
            {/* Profile Header */}
            <div className="flex gap-5 items-start mb-8">
               <div className="relative">
                  <img src={selectedPro.imageUrl} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-2 border-white dark:border-gray-800" />
                  {selectedPro.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900">
                      <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-100 dark:fill-blue-900/30" />
                    </div>
                  )}
               </div>
               <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">{selectedPro.name}</h2>
                      <p className="text-primary-700 dark:text-primary-300 font-bold text-xs bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-lg inline-block mb-3 border border-primary-100 dark:border-primary-800/30">{selectedPro.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                     <MapPin className="w-3.5 h-3.5" />
                     {selectedPro.location}
                  </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1 text-amber-500">
                     <Star className="w-4 h-4 fill-current" />
                     <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedPro.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Rating</p>
               </div>
               <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1 text-primary-600">
                     <Briefcase className="w-4 h-4" />
                     <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedPro.reviewCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Jobs</p>
               </div>
               <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center justify-center gap-1 mb-1 text-green-600">
                     <span className="text-lg font-bold text-gray-900 dark:text-white">${selectedPro.hourlyRate}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Per Hour</p>
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">About</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{selectedPro.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Work Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                   {selectedPro.workPhotos.map((photo, i) => (
                      <img key={i} src={photo} className="rounded-xl w-full h-32 object-cover shadow-sm" />
                   ))}
                </div>
              </div>
            </div>
         </div>

         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex gap-4">
            <button 
              onClick={() => openChat(selectedPro)}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
               <MessageSquare className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>
            <button 
              onClick={() => startCall('AUDIO', selectedPro)}
              className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
               <Phone className="w-6 h-6 text-gray-700 dark:text-white" />
            </button>
            <Button fullWidth onClick={() => handleBookClick(selectedPro)}>
               Book Now
            </Button>
         </div>
      </div>
    );
  };
  
  const renderChatList = () => {
    // Get all unique conversation IDs
    const conversationIds = Object.keys(chatMessages);
    
    return (
      <div className="pb-24 min-h-screen premium-gradient">
        <div className="sticky top-0 z-40 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-6 pt-4 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Messages</h1>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
             <button 
               onClick={() => setChatListTab('MESSAGES')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${chatListTab === 'MESSAGES' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
               Chats
             </button>
             <button 
               onClick={() => setChatListTab('CALLS')}
               className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${chatListTab === 'CALLS' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
               Calls
             </button>
          </div>
        </div>
        
        <div className="px-4 py-4 space-y-2">
          {chatListTab === 'MESSAGES' ? (
            conversationIds.length > 0 ? conversationIds.map(proId => {
               const pro = pros.find(p => p.id === proId) || MOCK_PROS.find(p => p.id === proId);
               const msgs = chatMessages[proId];
               const lastMsg = msgs[msgs.length - 1];
               if (!pro) return null;
               
               return (
                 <button 
                   key={proId}
                   onClick={() => openChat(pro)}
                   className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                 >
                    <div className="relative">
                      <img src={pro.imageUrl} alt={pro.name} className="w-14 h-14 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                       <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">{pro.name}</h3>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                       </div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
                         {lastMsg.isMe ? 'You: ' : ''}
                         {lastMsg.type === 'image' ? 'Sent an image' : 
                          lastMsg.type === 'location' ? 'Shared location' : 
                          lastMsg.type === 'call' ? (lastMsg.callDetails?.callType === 'video' ? 'Video call' : 'Audio call') :
                          lastMsg.text}
                       </p>
                    </div>
                 </button>
               );
            }) : (
              <div className="text-center py-20">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <MessageSquare className="w-8 h-8 text-gray-400" />
                 </div>
                 <p className="text-gray-500 font-medium">No messages yet</p>
              </div>
            )
          ) : (
            // Calls Tab
            callHistory.length > 0 ? callHistory.map(call => (
              <div key={call.id} className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                 <img src={call.proImage} className="w-12 h-12 rounded-full object-cover" />
                 <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{call.proName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       {call.status === 'missed' ? (
                          <PhoneMissed className="w-3.5 h-3.5 text-red-500" />
                       ) : call.direction === 'outgoing' ? (
                          <PhoneOutgoing className="w-3.5 h-3.5 text-green-500" />
                       ) : (
                          <PhoneIncoming className="w-3.5 h-3.5 text-blue-500" />
                       )}
                       <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                         {call.status === 'missed' ? 'Missed' : call.direction === 'outgoing' ? 'Outgoing' : 'Incoming'} • {call.timestamp.toLocaleDateString()}
                       </span>
                    </div>
                 </div>
                 <button 
                   onClick={() => startCall(call.type === 'audio' ? 'AUDIO' : 'VIDEO', pros.find(p => p.id === call.proId))}
                   className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-colors"
                 >
                    <Phone className="w-5 h-5" />
                 </button>
              </div>
            )) : (
              <div className="text-center py-20">
                 <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Phone className="w-8 h-8 text-gray-400" />
                 </div>
                 <p className="text-gray-500 font-medium">No recent calls</p>
              </div>
            )
          )}
        </div>
        {renderBottomNav()}
      </div>
    );
  };

  const renderChat = () => {
    if (!activeChatPro) return null;
    const messages = chatMessages[activeChatPro.id] || [];

    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
        <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between z-40 sticky top-0 shadow-sm">
           <div className="flex items-center gap-3">
              <button onClick={() => setView('CHAT_LIST')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="relative">
                 <img src={activeChatPro.imageUrl} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                 <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{activeChatPro.name}</h3>
                 <p className="text-xs text-green-600 dark:text-green-500 font-medium">Online</p>
              </div>
           </div>
           <div className="flex gap-1">
             <button onClick={() => startCall('AUDIO')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
               <Phone className="w-5 h-5" />
             </button>
             <button onClick={() => startCall('VIDEO')} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
               <Video className="w-5 h-5" />
             </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
           <div className="text-center text-xs text-gray-400 my-4 font-medium uppercase tracking-wider">Today</div>
           {messages.map((msg) => {
             if (msg.type === 'call') {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                     <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {msg.callDetails?.callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                        <span>{msg.callDetails?.callType === 'video' ? 'Video' : 'Audio'} call ended • {msg.callDetails?.duration}</span>
                     </div>
                  </div>
                );
             }
             
             return (
               <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.isMe ? 'bg-primary-600 text-white rounded-br-none shadow-md shadow-primary-500/20' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700'}`}>
                     {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.text}</p>}
                     {msg.type === 'location' && (
                       <div className="flex items-center gap-2">
                         <MapPin className="w-5 h-5" />
                         <span className="text-sm font-medium underline decoration-dashed">{msg.location?.address}</span>
                       </div>
                     )}
                     <span className={`text-[10px] mt-1 block opacity-70 ${msg.isMe ? 'text-white/80' : 'text-gray-400'} font-medium`}>
                       {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
               </div>
             );
           })}
           <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-end gap-2 pb-safe">
           <button onClick={() => setIsLocationOpen(true)} className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-xl transition-all">
             <MapPin className="w-6 h-6" />
           </button>
           <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center min-h-[50px] px-2 transition-all focus-within:ring-2 focus-within:ring-primary-500/50">
             <input 
               className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-3 max-h-32 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium"
               placeholder="Type a message..."
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
             />
             <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
               <Paperclip className="w-5 h-5" />
             </button>
           </div>
           <button 
             onClick={() => sendMessage()}
             disabled={!chatInput.trim()}
             className={`p-3 rounded-xl transition-all shadow-lg ${chatInput.trim() ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
           >
             <Send className="w-6 h-6" />
           </button>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="min-h-screen premium-gradient pb-24">
      {renderHeader()}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 p-[2px]">
               <img src={user?.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-950" />
             </div>
             <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-primary-600">
               <Camera className="w-3.5 h-3.5" />
             </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{user?.role === 'PROFESSIONAL' ? 'Professional Account' : 'Client Account'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900/50 rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm">
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Edit Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
             </button>
             <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Payment Methods</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
             </button>
             <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4"></div>
             <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Privacy & Security</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
             </button>
          </div>

          <button onClick={() => setView('LOGIN')} className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-bold flex items-center justify-center gap-2 mt-8">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
      {renderBottomNav()}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
       {/* Push Notification Container */}
       <div className="fixed top-4 left-4 right-4 z-[120] flex flex-col gap-2 pointer-events-none">
          {notifications.map(n => (
            <PushNotificationItem key={n.id} data={n} onDismiss={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
          ))}
       </div>
       
       {renderLocationModal()}
       {renderCallOverlay()}
       
       {view === 'LOGIN' && renderLogin()}
       {view === 'REGISTER_PRO' && renderProRegister()}
       {view === 'HOME' && renderHome()}
       {view === 'PRO_LIST' && renderProList()}
       {view === 'PRO_DETAILS' && renderProDetails()}
       {view === 'CHAT' && renderChat()}
       {view === 'CHAT_LIST' && renderChatList()}
       {view === 'PROFILE' && renderProfile()}
       {view === 'BOOK_APPOINTMENT' && renderBookAppointment()}
       {view === 'MY_BOOKINGS' && renderMyBookings()}
       {view === 'FAVORITES' && renderFavorites()} 
       {view === 'REGISTER_CLIENT' && renderLogin()} 
    </div>
  );
}