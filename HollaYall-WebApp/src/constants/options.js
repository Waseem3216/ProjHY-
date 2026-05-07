export const CATEGORIES = [
  'Study Help',
  'Campus Life',
  'Food Deals',
  'Career & Interviews',
  'Housing',
  'Transportation',
  'Quiet Study Spots',
  'Local Advice',
  'Events',
  'Safety',
  'Tech Help',
  'Money & Budgeting',
  'Health & Wellness',
  'General Help'
];

export const AREAS = [
  'University of Houston',
  'Texas Southern University',
  'Rice University',
  'Houston Community College',
  'Downtown Houston',
  'Midtown',
  'Third Ward',
  'Montrose',
  'Medical Center',
  'The Heights',
  'Galleria',
  'EaDo',
  'Museum District',
  'Sugar Land',
  'Katy',
  'Pearland',
  'Pasadena',
  'Greater Houston'
];

export const URGENCY_LEVELS = ['Low', 'Normal', 'Soon', 'Urgent'];

export const SUGGESTED_TAGS = [
  'math',
  'cheap-food',
  'interview',
  'study-spot',
  'parking',
  'roommate',
  'internship',
  'late-night',
  'transportation',
  'beginner-friendly',
  'urgent',
  'local-tip'
];

export const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Unsafe advice',
  'Personal information',
  'Off-topic',
  'Other'
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-helpful', label: 'Most helpful' },
  { value: 'most-replies', label: 'Most replies' },
  { value: 'unanswered-first', label: 'Unanswered first' },
  { value: 'solved-first', label: 'Solved first' },
  { value: 'urgent-first', label: 'Urgent first' },
  { value: 'trending', label: 'Trending' }
];

export const COMMUNITY_RULES = [
  'Be helpful and answer the question when you can.',
  'No harassment, hate speech, personal attacks, or doxxing.',
  'Do not share private information such as addresses, phone numbers, student IDs, financial details, or anything that could identify someone.',
  'No spam, dangerous advice, or intentionally misleading answers.',
  'Keep posts Houston-relevant and focused on support.'
];

export const ANONYMOUS_NAMES = [
  'Anonymous Cougar',
  'Bayou Helper',
  'Space City Owl',
  'Campus Ghost',
  'Houston Neighbor',
  'Helpful Longhorn',
  'Study Panther',
  'H-Town Helper',
  'Local Owl',
  'Bayou Buddy',
  'Museum District Mentor',
  'Third Ward Guide',
  'Space City Friend'
];

export const INITIAL_FILTERS = {
  search: '',
  category: 'All',
  area: 'All',
  urgency: 'All',
  status: 'All',
  replyStatus: 'All',
  tag: '',
  dateFrom: '',
  dateTo: ''
};
