import React from "react";

export const LeafIcon = ({ size = 20, color = "#2563EB" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 9 0 4.9-4 9-10 9z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CrownIcon = ({ size = 20, color = "#7C3AED" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Crown */}
    <path
      d="M3 7.5L6.2 17.5H17.8L21 7.5L15.5 12L12 5L8.5 12L3 7.5Z"
      fill={color}
      fillOpacity="0.12"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Crown bottom */}
    <path
      d="M5.5 20H18.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Crown jewels */}
    <circle cx="3" cy="7.5" r="1.2" fill={color} />
    <circle cx="12" cy="5" r="1.2" fill={color} />
    <circle cx="21" cy="7.5" r="1.2" fill={color} />
  </svg>
);

export const RocketIcon = ({ size = 20, color = "#16A34A" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Body */}
    <path
      d="M12 2.5C14.5 4 16.5 7.5 16.5 11.5C16.5 14.5 15.5 17 12 21C8.5 17 7.5 14.5 7.5 11.5C7.5 7.5 9.5 4 12 2.5Z"
      fill={color}
      fillOpacity="0.14"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Window */}
    <circle
      cx="12"
      cy="10.5"
      r="1.8"
      stroke={color}
      strokeWidth="1.7"
    />
    {/* Left fin */}
    <path
      d="M7.5 15.5C6 15.8 5 17 4.8 19.5C6.9 19.2 8.2 18.2 8.6 16.8"
      fill={color}
      fillOpacity="0.12"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right fin */}
    <path
      d="M16.5 15.5C18 15.8 19 17 19.2 19.5C17.1 19.2 15.8 18.2 15.4 16.8"
      fill={color}
      fillOpacity="0.12"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Flame */}
    <path
      d="M10.5 20C10 21 9.8 21.8 10.2 22.5C11 22.3 11.7 21.7 12 21C12.3 21.7 13 22.3 13.8 22.5C14.2 21.8 14 21 13.5 20"
      fill={color}
      fillOpacity="0.2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BuildingIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="8.01" y2="6" strokeWidth="3" />
    <line x1="12" y1="6" x2="12.01" y2="6" strokeWidth="3" />
    <line x1="16" y1="6" x2="16.01" y2="6" strokeWidth="3" />
    <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="3" />
    <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="3" />
    <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="3" />
    <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="3" />
    <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3" />
    <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="3" />
  </svg>
);

export const CheckIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CrossIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const LockIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const ShieldCheckIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ChatBubbleIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const BriefcaseIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const StarIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const CurvedArrowIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 50 30" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 5 25 Q 25 5, 45 15" />
    <path d="M 38 18 L 45 15 L 42 8" />
  </svg>
);

export const ArrowRightIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ExternalLinkIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const UserIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const CodeIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const StoreIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
