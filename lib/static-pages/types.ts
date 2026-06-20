export type FaqItem = { q: string; a: string };

export type FaqCategory = {
  id: string;
  label: string;
  description: string;
  count: number;
  items: FaqItem[];
};

export type TeamMember = {
  name: string;
  title: string;
  bio: string;
  photo: string;
};

export type Differentiator = {
  title: string;
  body: string;
};

export type BlogPost = {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
  featured?: boolean;
};

export type PrivacySection = {
  title: string;
  paragraphs: string[];
  subsections?: { title: string; body: string }[];
};
