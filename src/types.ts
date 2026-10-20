export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedData?: string;
  attachedFileName?: string;
  toolCalls?: Array<{
    name: string;
    args: any;
    result?: any;
    status: 'executing' | 'completed' | 'failed';
  }>;
  feedback?: 'like' | 'dislike';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  rating: number;
  badge?: string;
}

export interface Order {
  orderId: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  customerName: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  destination: string;
  timeline: Array<{ time: string; event: string }>;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  date: string;
  time: string;
  notes?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface WorkspaceNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface WebsiteData {
  catalog: Product[];
  orders: Order[];
  appointments: Appointment[];
  checklist: ChecklistItem[];
  workspaceNotes: WorkspaceNote[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  token?: string;
  createdAt: string;
}

export interface RegisteredUserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface VisitorSession {
  visitorId: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  ipAddress: string;
  location: string;
  browser: string;
  os: string;
  status: 'online' | 'idle' | 'offline';
  firstSeen: string;
  lastActive: string;
  totalVisits: number;
  messagesCount: number;
  apiCallsCount: number;
  currentAction: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  visitorId: string;
  userName: string;
  role: string;
  type: 'visit' | 'chat' | 'api_call' | 'login' | 'register' | 'tool_call';
  description: string;
}
