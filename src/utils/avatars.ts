/**
 * Resilient, self-contained SVG portrait generators
 * Guarantees 100% load reliability without external CDN failure
 */

const colors = [
  { bg: '#EC4899', accent: '#BE185D', hair: '#1F2937', skin: '#FDBA74', lip: '#E11D48' },
  { bg: '#8B5CF6', accent: '#6D28D9', hair: '#374151', skin: '#FED7AA', lip: '#F43F5E' },
  { bg: '#06B6D4', accent: '#0891B2', hair: '#111827', skin: '#FCD34D', lip: '#E11D48' },
  { bg: '#10B981', accent: '#059669', hair: '#4B5563', skin: '#FDBA74', lip: '#DB2777' },
  { bg: '#F59E0B', accent: '#D97706', hair: '#1F2937', skin: '#FED7AA', lip: '#BE123C' },
  { bg: '#6366F1', accent: '#4F46E5', hair: '#312E81', skin: '#FDBA74', lip: '#E11D48' },
];

export function generateSvgAvatar(name: string, role: string, index: number = 0): string {
  const c = colors[index % colors.length];
  const initial = name.slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <defs>
      <linearGradient id="g_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c.bg}" />
        <stop offset="100%" stop-color="${c.accent}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g_${index})" />
    <!-- Shoulders -->
    <path d="M 25 118 Q 60 70 95 118 Z" fill="#FFFFFF" opacity="0.9" />
    <!-- Neck -->
    <rect x="52" y="58" width="16" height="22" rx="4" fill="${c.skin}" />
    <!-- Head -->
    <ellipse cx="60" cy="50" rx="24" ry="28" fill="${c.skin}" />
    <!-- Hair -->
    <path d="M 36 46 Q 60 18 84 46 Q 88 70 78 78 Q 60 38 42 78 Z" fill="${c.hair}" />
    <!-- Eyes -->
    <circle cx="50" cy="48" r="2.5" fill="#1F2937" />
    <circle cx="70" cy="48" r="2.5" fill="#1F2937" />
    <!-- Smile -->
    <path d="M 52 62 Q 60 70 68 62" stroke="${c.lip}" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <!-- Role badge mark -->
    <circle cx="94" cy="94" r="14" fill="#059669" stroke="#FFFFFF" stroke-width="3" />
    <text x="94" y="98" font-size="10" font-family="sans-serif" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateGalleryPhoto(title: string, index: number): string {
  const palette = [
    { from: '#F43F5E', to: '#FB7185', icon: '✨' },
    { from: '#8B5CF6', to: '#C084FC', icon: '🌸' },
    { from: '#06B6D4', to: '#67E8F9', icon: '🌴' },
    { from: '#10B981', to: '#34D399', icon: '🍃' },
    { from: '#F59E0B', to: '#FCD34D', icon: '☀️' },
    { from: '#EC4899', to: '#F472B6', icon: '💖' },
    { from: '#3B82F6', to: '#93C5FD', icon: '🌊' },
    { from: '#6366F1', to: '#A5B4FC', icon: '🔮' },
    { from: '#14B8A6', to: '#5EEAD4', icon: '🦋' },
    { from: '#E11D48', to: '#FB7185', icon: '🌹' },
  ];
  const p = palette[index % palette.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="gal_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.from}" />
        <stop offset="100%" stop-color="${p.to}" />
      </linearGradient>
    </defs>
    <rect width="400" height="500" rx="16" fill="url(#gal_${index})" />
    <circle cx="200" cy="180" r="90" fill="#FFFFFF" opacity="0.2" />
    <circle cx="200" cy="180" r="70" fill="#FFFFFF" opacity="0.3" />
    <text x="200" y="195" font-size="64" text-anchor="middle">${p.icon}</text>
    <rect x="40" y="360" width="320" height="90" rx="12" fill="#000000" opacity="0.35" />
    <text x="200" y="400" font-size="20" font-family="system-ui, sans-serif" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${title}</text>
    <text x="200" y="428" font-size="13" font-family="system-ui, sans-serif" fill="#F1F5F9" text-anchor="middle">Photo ${(index + 1)} / 10 · Verified Host</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
