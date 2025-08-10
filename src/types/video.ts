export interface VideoPost {
  title: string;
  author: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  tags: string[];
  featured?: boolean;
  publishDate: string;
  description: string;
  slug: string;
  content?: string;
}

export interface VideoCardProps {
  title: string;
  author: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  slug?: string;
}

export type VideoCategory = 
  | "Motion Graphics"
  | "3D Animation" 
  | "Branding"
  | "UI/UX"
  | "Character"
  | "VFX"
  | "Typography"
  | "Product"
  | "Explainer";