// Taxonomy definitions for showreel categorization

export const TAXONOMIES = {
  industries: [
    { value: 'tech-saas', label: 'Tech/SaaS' },
    { value: 'fashion-luxury', label: 'Fashion/Luxury' },
    { value: 'advertising-commercial', label: 'Advertising/Commercial' },
    { value: 'entertainment-media', label: 'Entertainment/Media' },
    { value: 'finance-banking', label: 'Finance/Banking' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'sports-fitness', label: 'Sports/Fitness' },
    { value: 'food-beverage', label: 'Food/Beverage' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'other', label: 'Other' }
  ],

  styles: [
    { value: 'minimal-clean', label: 'Minimal/Clean' },
    { value: 'bold-vibrant', label: 'Bold/Vibrant' },
    { value: '3d-cgi', label: '3D/CGI' },
    { value: 'hand-drawn', label: 'Hand-drawn' },
    { value: 'retro-vintage', label: 'Retro/Vintage' },
    { value: 'futuristic-tech', label: 'Futuristic/Tech' },
    { value: 'organic-natural', label: 'Organic/Natural' },
    { value: 'geometric-abstract', label: 'Geometric/Abstract' },
    { value: 'cinematic-dramatic', label: 'Cinematic/Dramatic' },
    { value: 'playful-quirky', label: 'Playful/Quirky' },
    { value: 'elegant-sophisticated', label: 'Elegant/Sophisticated' },
    { value: 'dark-moody', label: 'Dark/Moody' }
  ],

  techniques: [
    { value: '2d-animation', label: '2D Animation' },
    { value: '3d-cgi', label: '3D/CGI' },
    { value: 'mixed-media', label: 'Mixed Media' },
    { value: 'kinetic-typography', label: 'Kinetic Typography' },
    { value: 'motion-graphics', label: 'Motion Graphics' },
    { value: 'stop-motion', label: 'Stop Motion' },
    { value: 'live-action-vfx', label: 'Live Action + VFX' },
    { value: 'cel-animation', label: 'Cel Animation' },
    { value: 'liquid-simulation', label: 'Liquid Simulation' },
    { value: 'particle-effects', label: 'Particle Effects' },
    { value: 'character-animation', label: 'Character Animation' },
    { value: 'logo-animation', label: 'Logo Animation' }
  ],

  soundMusic: [
    { value: 'electronic-synth', label: 'Electronic/Synth' },
    { value: 'epic-cinematic', label: 'Epic/Cinematic' },
    { value: 'chill-ambient', label: 'Chill/Ambient' },
    { value: 'jazz-acoustic', label: 'Jazz/Acoustic' },
    { value: 'rock-energetic', label: 'Rock/Energetic' },
    { value: 'orchestral-classical', label: 'Orchestral/Classical' },
    { value: 'hip-hop-urban', label: 'Hip-hop/Urban' },
    { value: 'no-sound', label: 'No Sound' },
    { value: 'voiceover-heavy', label: 'Voiceover Heavy' },
    { value: 'sound-design-focused', label: 'Sound Design Focused' }
  ]
} as const;

// Helper to get label from value
export function getTaxonomyLabel(
  taxonomy: keyof typeof TAXONOMIES,
  value: string
): string {
  const item = TAXONOMIES[taxonomy].find(t => t.value === value);
  return item?.label || value;
}

// Helper to convert taxonomy value to display name for tags
export function taxonomyToTag(value: string): string {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('/');
}
