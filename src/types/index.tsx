import { RESERVATION_STATUS_IDS } from "@/lib/options";

// ===== Common Types =====
export type ReservationStatus = (typeof RESERVATION_STATUS_IDS)[number];

// ===== Child Related Types =====
export interface AuthorizedPerson {
  name: string;
  cin: string; // ID Number / CIN
}

export interface ChildAllergyDetail {
  name: string;
  allergy_causes: string[];
  allergy_emergency: string;
}

export interface ChronicDisease {
  name?: string;
  medication?: string;
  procedures?: string;
}

export interface Allergy {
  allergyTypes?: string;
  allergyFoods?: string;
  allergyProcedures?: string;
}

export interface Child {
  id: number;
  user_id: number;
  child_name: string;
  birthday_date: string | null;
  gender: "girl" | "boy" | string;
  disease: number;
  allergy: number;
  parent_name: string;
  mother_name: string;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
  center_id: number | null;
  description_3_words: string | null;
  things_child_likes: string | null;
  notes: string | null;
  kinship: string | null;
  center_branch_id: number | null;
  disease_details: Array<{
    disease_name: string;
    medicament: string;
    emergency: string;
  }> | null;
  enrollments: Array<{
    id: number;
    center_id: number;
    user_id: number;
    center_branch_id: number;
    reservation_number: string;
    parent_phone: string;
    price_amount: string;
    enrollment_type: string;
    hours_per_day: string | null;
    response_speed: string;
    enrollment_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    pivot: {
      child_id: number;
      enrollment_id: number;
    };
  }>;
  authorized_people: Array<{
    id: number;
    child_id: number;
    name: string;
    cin: string;
    created_at: string;
    updated_at: string;
  }>;
  allergies: Array<{
    id: number;
    child_id: number;
    name: string;
    allergy_causes: string;
    allergy_emergency: string;
    created_at: string;
    updated_at: string;
  }>;
}

// ===== Parent Related Types =====
export interface ParentData {
  name: string;
  phone: string;
  email: string;
  relation: string;
}

export interface ParentRegisterPayload {
  name: string;
  email: string;
  national_number: string;
  phone: string;
  password?: string;
  address: string | null;
  children: Child[];
}

export interface ParentRegisterPayloadv2 {
  name: string;
  email: string;
  national_number: string;
  phone: string;
  password?: string;
}

export interface ParentRegisterFormDataInput {
  name: string;
  phone: string;
  email: string;
  relation: string;
  national_number: string;
  address: string;
  password: string;
  confirmPassword?: string;
  childName: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  kinship: string;
  gender: "male" | "female" | string;
  chronicDiseases?: {
    hasDiseases: "yes" | "no";
    diseases?: Array<{ name: string; medication: string; procedures: string }>;
  };
  allergies?: {
    hasAllergies: "yes" | "no";
    allergies?: Array<{
      allergyTypes: string;
      allergyFoods: string;
      allergyProcedures: string;
    }>;
  };
  childDescription?: string;
  favoriteThings?: string;
  recommendations?: string;
  authorizedPersons?: Array<{ name: string; idNumber: string }>;
  comments?: string;
}

// ===== Center Related Types =====
export interface Meal {
  meal_name?: string;
  juice?: string;
  components?: string;
}

export interface Pricing {
  enrollment_type: string;
  response_speed: string;
  price_amount: number;
}

export interface CenterRegisterPayload {
  // Basic Info
  name?: string;
  email: string;
  password: string; // optional in some contexts? Schema says required.
  phone: string;
  nursery_name: string;
  city_id: string;
  logo: File;
  category_service_ids?: number[];
}

// Extended interface for establishment API response that includes user_id
export interface EstablishmentResponse extends Omit<
  CenterRegisterPayload,
  "logo" | "license_path" | "commercial_record_path" | "city"
> {
  id: number;
  user_id: number;
  center_id?: number;
  type?: string; // 'nurseries' | 'centers' | etc.
  role?: string; // 'nursery' | 'center'
  logo?: string;
  license_path?: string;
  commercial_record_path?: string;
  accepted_ages?: string[];
  services?: string[];
  branches?: Array<{
    id: number;
    name: string;
    nursery_name_branch: string;
  }>;
  city: string | { name: { ar: string; en: string } };
  neighborhood?: string | { ar: string; en: string } | null;
  address?: string;
  nursery?: {
    center_id: number;
    nursery_name: string;
    logo?: string;
    [key: string]: any;
  };
  center?: {
    center_id: number;
    nursery_name: string;
    logo?: string;
    [key: string]: any;
  };
}

// ===== Child Info Form Types =====
export interface ChildData {
  childName: string;
  birthDate: string;
  fatherName: string;
  motherName: string;
  gender: string;
}

export interface DiseasesData {
  diseases: ChronicDisease[];
}

export interface AllergiesData {
  allergies: Allergy[];
}

export interface RecommedationsData {
  childDescription: string;
  favoriteThings: string;
  recommendations: string;
}

export interface AuthorizedData {
  authorizedPersons: AuthorizedPerson[];
  comments: string;
}

export interface ChildInfoData {
  parentData: ParentData;
  childData: ChildData;
  diseasesData: DiseasesData;
  allergiesData: AllergiesData;
  recommedationsData: RecommedationsData;
  authorizedData: AuthorizedData;
}

// ===== Content Types =====
export interface Blog {
  id: string | number;
  title: string | { [key: string]: string };
  description: string | { [key: string]: string };
  image: string;
  file?: string; // For the main blog image
  content?: { [key: string]: string };
  author?: string;
  reading_time: string;
  created_at: string;
  published_at: string;
  status?: "pending" | "approved" | "rejected";
}

export interface AdSlide {
  id: number;
  title: string;
  image: string;
  created_at: string;
  published_at: string;
}

export interface CommonQuestion {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  published_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  // created_at: string;
  // published_at: string;
}

export interface Value {
  key: string;
  title: string;
  description: string;
  image: string;
}

export interface CategoryService {
  id: number;
  name: {
    en: string;
    ar: string;
  };
  created_at: string;
  updated_at: string;
}

// -----------------------------
// Chat Feature Types
// -----------------------------

// User roles in the system
export type Role = "parent" | "center" | "admin" | "nursery";

// User object for chat participants
export interface User {
  id: string;
  name: string;
  role: Role;
  logoUrl?: string; // For center/admin, optional for parent
}

// Single chat message
export interface Message {
  id: string;
  chatId: string;
  sender: User;
  content: string;
  timestamp: string; // ISO string
  read: boolean; // Tracks if the message has been read
}

export interface Branch {
  id: number;
  name: string;
  nursery_name_branch: string;
}

// -----------------------------
// Portfolio Types for Nursery Details
// -----------------------------

export interface HeroSection {
  title_of_hero: string;
  subtitle_of_hero: string;
  description: string;
}

export interface ContactInfo {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedIn?: string;
  website?: string;
}

export interface AdminOption {
  id: number;
  title: {
    ar: string;
    en: string;
  };
  image: string;
  pivot: {
    center_id: number;
    admin_option_id: number;
  };
}

export interface License {
  id: number;
  number: string;
  document: string;
}

export interface PortfolioData {
  id: number;
  center_id: number;
  hero_section?: HeroSection;
  images_activities?: {
    id: number;
    image: string;
    summary: string;
    kind: string;
  }[];
  contact_info?: ContactInfo;
  ads_images?: string[];
  admin_options?: AdminOption[];
  licenses?: License[];
  services?: {
    id: number;
    title: string;
    description: string;
    image_service: string;
    price: string;
  }[];
  teams?: {
    id: number;
    name: string;
    mission: string;
    image: string;
  }[];
  statistics?: {
    id: number;
    address: string;
    value: string;
  }[];
  name?: string;
}

export interface PortfolioResponse {
  message: string;
  data: PortfolioData;
}

// Profile Editor Types
export interface PortfolioFormData {
  // Hero Info
  name?: string;
  title_of_hero?: string;
  subtitle_of_hero?: string;
  description?: string;

  // Activities (Success Stories)
  images_activities?: {
    id?: number;
    image?: File | string;
    summary?: string;
    kind?: string;
  }[];
  delete_images_activities?: number[];

  // Services
  services?: {
    id?: number;
    title: string;
    description: string;
    image_service?: File | string;
    price: string;
  }[];
  delete_service_ids?: number[];

  // Teams
  teams?: {
    id?: number;
    name: string;
    mission: string;
    image?: File | string;
  }[];
  delete_team_ids?: number[];

  // Statistics
  statistics?: {
    id?: number;
    address: string;
    value: string;
  }[];

  // Facilities / Options
  admin_option_ids?: number[];
  delete_center_options?: number[];

  // Licenses
  licenses?: {
    id?: number;
    number: string;
    document?: File | string;
  }[];
  delete_license_ids?: number[];

  // Social links
  contact_info?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedIn?: string;
    website?: string;
  };
}

export interface PricingFormData {
  id?: number;
  enrollment_type: string;
  title: string;
  start_age:
    | number // old structure support
    | {
        type: string;
        age: number;
      };
  end_age:
    | number // old structure support
    | {
        type: string;
        age: number;
      };
  count: number;
  price_amount: number;
}

export interface BranchPricingData {
  branch_id: number;
  prices: PricingFormData[];
}

// ===== Notification Types =====
export interface BaseNotification {
  id: string;
  type: string; // e.g., "App\\Notifications\\UniversalNotification"
  notifiable_type: string; // e.g., "App\\Models\\User"
  notifiable_id: number;
  read_at: string | null;
  created_at: string;
  updated_at: string | null;
}

// Universal notification (from Laravel broadcast)
export interface UniversalNotificationData extends BaseNotification {
  report_id?: number | null;
  title: string;
  description: string;
  date: string;
  time: string;
  notification_type: "info" | "daily_report" | "enrollment" | string;
  enrollment_id?: number | null;
  report?: any | null;
  enrollment?: any | null;
}

// Legacy admin notifications (with title, description, date, time)
export interface AdminNotification extends BaseNotification {
  type: "App\\Notifications\\AdminNotification";
  title: string;
  description: string;
  date: string;
  time: string;
}

// Legacy daily report notifications (with message and report_id)
export interface DailyReportNotification extends BaseNotification {
  type: "App\\Notifications\\DailyReportNotification";
  message: string;
  report_id: number;
}

// Union type for all notification types
export type Notification =
  | UniversalNotificationData
  | AdminNotification
  | DailyReportNotification;

// Type alias for backward compatibility
export type UniversalNotification = Notification;

// The API returns a simple array of notifications
export type NotificationsResponse = Notification[];

// ===== Profile Editor Types =====
export interface ProfileSection {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  data: Record<string, any>;
}

export interface NurseryPlan {
  title: string;
  description: string;
  price: string;
}

export interface NurseryRegisterPayload {
  name?: string;
  email: string;
  phone: string;
  password: string;
  nursery_name: string;
  city_id: string;
  logo: File;
  category_service_ids?: number[];
}
