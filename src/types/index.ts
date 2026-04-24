export type CourtType = "indoor" | "outdoor" | "covered";
export type BookingMethod = "playtomic" | "own_app" | "website" | "phone";
export type CourtStatus = "open" | "coming_soon" | "closed";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type PostSkillLevel = SkillLevel | "any";
export type PostStatus = "open" | "full" | "cancelled" | "expired";

export interface Court {
  id: string;
  name: string;
  slug: string;
  address: string;
  eircode: string | null;
  latitude: number;
  longitude: number;
  court_count: number;
  court_type: CourtType;
  price_peak_eur: number | null;
  price_offpeak_eur: number | null;
  membership_required: boolean;
  booking_url: string | null;
  booking_method: BookingMethod | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  amenities: string[] | null;
  status: CourtStatus;
  featured: boolean;
  image_url: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  skill_level: SkillLevel;
  area: string | null;
  avatar_url: string | null;
  contact_preference: "in_app" | "whatsapp";
}

export interface Post {
  id: string;
  author_id: string;
  court_id: string | null;
  court_name_override: string | null;
  play_date: string;
  play_time: string;
  skill_level: PostSkillLevel;
  players_needed: number;
  players_joined: number;
  message: string | null;
  status: PostStatus;
  created_at: string;
  author_name?: string;
  author_skill_level?: SkillLevel;
  author_avatar_url?: string | null;
  court_name?: string;
  court_slug?: string;
}

export interface PostResponse {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user_name?: string;
  user_avatar_url?: string | null;
}
