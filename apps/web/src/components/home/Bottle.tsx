/** Frasco dibujado con los colores del logo: sin fotos de terceros y nítido a cualquier tamaño. */
export function Bottle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 360" role="img" aria-label="Frasco de perfume LM">
      <defs>
        <linearGradient id="b-cap" x1="0" x2="1">
          <stop offset="0" stopColor="#2a2b2e" />
          <stop offset=".35" stopColor="#5a5b5f" />
          <stop offset=".55" stopColor="#3d3d3f" />
          <stop offset="1" stopColor="#121214" />
        </linearGradient>
        <linearGradient id="b-collar" x1="0" x2="1">
          <stop offset="0" stopColor="#8d949c" />
          <stop offset=".4" stopColor="#f4f6f8" />
          <stop offset="1" stopColor="#6b7178" />
        </linearGradient>
        <linearGradient id="b-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset=".18" stopColor="#d9eef8" stopOpacity=".55" />
          <stop offset=".7" stopColor="#7cc7e8" stopOpacity=".35" />
          <stop offset="1" stopColor="#0b3d57" stopOpacity=".75" />
        </linearGradient>
        <linearGradient id="b-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4cb8e4" />
          <stop offset=".55" stopColor="#159bd3" />
          <stop offset="1" stopColor="#0a5f88" />
        </linearGradient>
        <linearGradient id="b-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".25" stopColor="#fff" stopOpacity="0" />
          <stop offset=".75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".45" />
        </linearGradient>
        <filter id="b-blur" x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id="b-body"><rect x="22" y="96" width="176" height="248" rx="22" /></clipPath>
      </defs>

      <ellipse cx="110" cy="348" rx="92" ry="9" fill="#000" opacity=".35" filter="url(#b-blur)" />

      {/* tapa y cuello */}
      <rect x="70" y="4" width="80" height="70" rx="6" fill="url(#b-cap)" />
      <rect x="78" y="10" width="7" height="58" rx="3" fill="#fff" opacity=".18" />
      <rect x="84" y="74" width="52" height="24" rx="3" fill="url(#b-collar)" />

      {/* cuerpo: cristal, líquido y brillos */}
      <rect x="22" y="96" width="176" height="248" rx="22" fill="url(#b-glass)" />
      <g clipPath="url(#b-body)">
        <rect x="34" y="150" width="152" height="182" rx="14" fill="url(#b-liquid)" />
        <path d="M34 156 q38 -9 76 0 t76 0 v-6 h-152z" fill="#bfe6f7" opacity=".7" />
        <rect x="22" y="96" width="176" height="248" fill="url(#b-shade)" />
        <rect x="36" y="104" width="9" height="230" rx="4.5" fill="#fff" opacity=".55" />
        <rect x="52" y="110" width="3" height="200" rx="1.5" fill="#fff" opacity=".35" />
      </g>
      <rect x="22.75" y="96.75" width="174.5" height="246.5" rx="21.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />

      {/* etiqueta con el logo */}
      <rect x="66" y="196" width="88" height="74" rx="3" fill="#fff" />
      <image href="/images/lm-logo.png" x="80" y="200" width="60" height="52" preserveAspectRatio="xMidYMid meet" />
      <text x="110" y="262" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="7.5" fontWeight="700" letterSpacing="2.4" fill="#3d3d3f">PARFUM</text>
    </svg>
  )
}
