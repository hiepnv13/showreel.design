export const OG_BASE = 'https://video.showreel.design/og';

export function getOgImage(path: string): string {
  const slug = path === '/' ? 'home' : path.replace(/\//g, '-').replace(/^-/, '');
  return `${OG_BASE}/og-${slug}.jpg`;
}

export const SITE = {
  name: 'Showreel.design',
  url: 'https://showreel.design',
  tagline: 'A curated archive of the best motion design reels from studios and creators worldwide — updated every week.',
  social: {
    twitter: 'https://x.com/showreeldesign',
    twitterHandle: '@showreeldesign',
  },
};

export const PARTNERS = [
  { href: 'https://peekpaper.com/?ref=showreel.design', img: '/uploads/Partner_Peekpaper.png', name: 'Peek Paper — The Web\'s Daily Paper' },
  { href: 'https://framer.link/srd', img: '/uploads/Partner_Framer.png', name: 'Framer Templates' },
  { href: 'https://www.lapa.ninja?ref=showreel.design', img: '/uploads/Partner_Lapa.png', name: 'Lapa.ninja' },
  { href: 'https://www.landing.love?ref=showreel.design', img: '/uploads/Partner_Landing.png', name: 'Landing.love' },
  { href: 'https://mobbin.com/?via=showreeldesign', img: '/uploads/Partner_Mobbin.png', name: 'Mobbin — UI & UX Library' },
];

export const BANNER_SLIDES = [
  {
    video: 'https://video.showreel.design/Banner/Elevenlab.mp4',
    link:  'https://try.elevenlabs.io/srdesign',
    logo:  'https://video.showreel.design/resource%20logo/Eleven%20Lab.png',
    title: 'Reception by ElevenLabs',
  },
  {
    video: 'https://video.showreel.design/Thumbnails/thumbnail_videos_Wednesday%20Studio%20Showreel.mp4',
    link:  'https://lottie.link/showreeldesign',
    logo:  '/uploads/favicon_wednesdaystudio_co_64x64.png',
    title: 'Wednesday Studio Showreel',
  },
  {
    video: 'https://video.showreel.design/Banner/Framer3.mp4',
    link:  'https://framer.link/srd',
    logo:  '/uploads/Framer.png',
    title: 'Framer — Build professional websites with AI.',
  },
];
