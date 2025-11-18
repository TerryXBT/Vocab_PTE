import { SVGProps } from 'react';

export type IconName =
  | 'dashboard'
  | 'book'
  | 'review'
  | 'play'
  | 'arrowRight'
  | 'user'
  | 'logout'
  | 'checkCircle'
  | 'list';

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 16, className }: Props) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M4 13.5a2 2 0 0 0 2 2h3v-5H6a2 2 0 0 0-2 2Z" />
          <path d="M11 6.5v9h3a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-3Z" />
          <path d="M17 9.5h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M6 19.5h12" />
          <path d="M6 4.5h12v15H6a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
          <path d="M10 8.5h4" />
          <path d="M10 11h4" />
        </svg>
      );
    case 'review':
      return (
        <svg {...common}>
          <path d="M17 17v-5h-5" />
          <path d="M17 12.5c0-3-2.7-5.5-6-5.5a6 6 0 0 0-5.7 4.3" />
          <path d="M7 7v5h5" />
          <path d="M7 11.5c0 3 2.7 5.5 6 5.5a6 6 0 0 0 5.7-4.3" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}>
          <path d="M9.5 7.5v9l7-4.5-7-4.5Z" />
          <circle cx="12" cy="12" r="9.25" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M6.5 19.5a5.5 5.5 0 0 1 11 0" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M15.5 12H8" />
          <path d="m12.5 8 4 4-4 4" />
          <path d="M15.5 4.5h-6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h6" />
        </svg>
      );
    case 'checkCircle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.75" />
          <path d="m9.2 12.5 2.1 2.1 3.7-4.6" />
        </svg>
      );
    case 'list':
      return (
        <svg {...common}>
          <path d="M9 6h10" />
          <path d="M9 12h10" />
          <path d="M9 18h10" />
          <path d="M5 6h.01" />
          <path d="M5 12h.01" />
          <path d="M5 18h.01" />
        </svg>
      );
    default:
      return null;
  }
}
