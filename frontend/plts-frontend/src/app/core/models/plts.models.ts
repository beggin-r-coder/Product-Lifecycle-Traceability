export type Role = 'ORGANIZATION' | 'MANUFACTURER' | 'QA' | 'PACKAGING_TRANSPORT' | 'RETAILER';

export type OrderStatus =
  | 'CREATED'
  | 'MANUFACTURER_ASSIGNED'
  | 'MANUFACTURING'
  | 'MANUFACTURING_COMPLETED'
  | 'QA_ASSIGNED'
  | 'QA_IN_PROGRESS'
  | 'QA_COMPLETED'
  | 'PACKAGING_ASSIGNED'
  | 'PACKAGING_IN_PROGRESS'
  | 'PACKAGING_COMPLETED'
  | 'TRANSPORT_COMPLETED'
  | 'RETAILER_ASSIGNED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'REJECTED';

export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: number;
  email: string;
  generatedUserId?: string;
  role: Role;
  name: string;
  companyName: string;
  organizationId: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  generatedUserId?: string;
  role: Role;
  name: string;
  companyName: string;
  organizationId: number;
  verified: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Stakeholder {
  id: number;
  generatedUserId: string;
  role: Role;
  companyName: string;
  companyEmail: string;
  personInCharge: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface LifecycleStage {
  id: number;
  stageStatus: OrderStatus;
  stageTitle: string;
  responsibleCompanyName?: string;
  responsibleRole?: Role;
  remarks?: string;
  attachmentUrl?: string;
  performedByUserId?: string;
  timestamp: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  productName: string;
  description?: string;
  quantity: number;
  expectedDeliveryDate?: string;
  priority: OrderPriority;
  remarks?: string;
  status: OrderStatus;
  organizationName: string;
  organizationId: number;
  isPremapped?: boolean;
  manufacturer?: Stakeholder;
  qa?: Stakeholder;
  packagingTransport?: Stakeholder;
  retailer?: Stakeholder;
  trackingNumber?: string;
  vehicleDetails?: string;
  estimatedDelivery?: string;
  completionNotes?: string;
  completionDocumentUrl?: string;
  qaRemarks?: string;
  qaReportUrl?: string;
  qaPassed?: boolean;
  createdAt: string;
  updatedAt: string;
  lifecycleStages: LifecycleStage[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}

export interface DashboardAnalytics {
  totalManufacturers: number;
  totalQa: number;
  totalPackaging: number;
  totalRetailers: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  unreadNotifications: number;
  ordersPerStage: Record<string, number>;
  avgCycleTime?: string;
  cycleTimeChange?: string;
  onTimeDelivery?: string;
  onTimeDeliveryChange?: string;
  qualityRate?: string;
  qualityRateChange?: string;
  defectRate?: string;
  defectRateChange?: string;
}

export interface PublicTraceability {
  orderNumber: string;
  productName: string;
  description?: string;
  quantity: number;
  status: OrderStatus;
  currentStageTitle: string;
  organizationName: string;
  manufacturerName?: string;
  qaName?: string;
  packagingTransportName?: string;
  retailerName?: string;
  trackingNumber?: string;
  vehicleDetails?: string;
  estimatedDelivery?: string;
  qaRemarks?: string;
  qaPassed?: boolean;
  completionDate?: string;
  timeline: LifecycleStage[];
}
