import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // ← Hỗ trợ dark mode bằng class (shadcn/ui thường dùng)
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── HỆ MÀU 13 SẮC ĐỘ (THE EDITORIAL HARVEST) ───
        primary: {
          DEFAULT: '#72B866',
          T0: '#000000',
          T10: '#002201',
          T20: '#003A03',
          T30: '#0A530C',
          T40: '#296C24',
          T50: '#42863A',
          T60: '#5CA051',
          T70: '#76BC69',
          T80: '#90D882',
          T90: '#ABF59C',
          T95: '#CAFFBB',
          T100: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EC8632',
          T0: '#000000',
          T10: '#301400',
          T20: '#4F2500',
          T30: '#713700',
          T40: '#944A00',
          T50: '#B95F03',
          T60: '#D97723',
          T70: '#FA913C',
          T80: '#FFB784',
          T90: '#FFDCC6',
          T95: '#FFEDE4',
          T100: '#FFFFFF',
        },
        tertiary: {
          DEFAULT: '#EF86B5',
          T0: '#000000',
          T10: '#3D0024',
          T20: '#5E0D3B',
          T30: '#7B2752',
          T40: '#983F6A',
          T50: '#B65784',
          T60: '#D4709E',
          T70: '#F48AB9',
          T80: '#FFB0D0',
          T90: '#FFD8E6',
          T95: '#FFECF1',
          T100: '#FFFFFF',
        },
        neutral: {
          DEFAULT: '#F8F9F8',
          T0: '#000000',
          T10: '#191C1C',
          T20: '#2E3131',
          T30: '#454747',
          T40: '#5C5F5E',
          T50: '#757777',
          T60: '#8F9190',
          T70: '#AAABAB',
          T80: '#C5C7C6',
          T90: '#E1E3E2',
          T95: '#F0F1F0',
          T100: '#FFFFFF',
        },
        // ─── CÁC MÀU PHỤ TRỢ & ĐẶC THÙ WEB ───
        outline: {
          variant: '#c0c9b9',
        },
        error: {
          DEFAULT: '#ba1a1a',
        },
        dark: {
          bg: '#080c1f', // Nền chính của dashboard
          card: 'rgba(255,255,255,0.03)', // Nền của các thẻ (search, profile)
          hover: 'rgba(255,255,255,0.05)', // Nền khi hover
          text: {
            primary: '#e2e8f0', // Chữ chính
            secondary: 'rgba(255,255,255,0.5)', // Chữ phụ
          },
        },
      },
      fontFamily: {
        // Sử dụng CSS Variables từ next/font/google
        sans: ['var(--font-epilogue)', 'sans-serif'], // Display & Headlines
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'], // Titles & Body
        label: [
          'var(--font-plus-jakarta)',
          'var(--font-be-vietnam-pro)',
          'sans-serif',
        ], // Labels
      },
      borderRadius: {
        // Ghi đè độ bo góc cực lớn (Large & Extra Large)
        md: '1.5rem', // 24px - Inputs & Fields
        lg: '2rem', // 32px - Cards
        xl: '3rem', // 48px - Hero Banners
      },
      spacing: {
        // Ghi đè spacing token
        '3': '1rem', // 16px
        '6': '2rem', // 32px
        '8': '2.75rem', // 44px
        '10': '3.5rem', // 56px
      },
      boxShadow: {
        // Ambient Shadows cho Web (thay thế drop shadow gắt)
        soft: '0 12px 24px -8px rgba(25, 28, 28, 0.04)',
        floating: '0 24px 48px -12px rgba(25, 28, 28, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
