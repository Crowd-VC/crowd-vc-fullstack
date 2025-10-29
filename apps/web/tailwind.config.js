module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '500px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1780px',
      '4xl': '2160px',
    },
    extend: {
      colors: {
        brand: 'hsl(var(--brand) / <alpha-value>)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        cardForeground: 'hsl(var(--card-foreground) / <alpha-value>)',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        popoverForeground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        primaryForeground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        secondaryForeground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        mutedForeground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        accentForeground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        destructiveForeground:
          'hsl(var(--destructive-foreground) / <alpha-value>)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart1: 'hsl(var(--chart-1) / <alpha-value>)',
        chart2: 'hsl(var(--chart-2) / <alpha-value>)',
        chart3: 'hsl(var(--chart-3) / <alpha-value>)',
        chart4: 'hsl(var(--chart-4) / <alpha-value>)',
        chart5: 'hsl(var(--chart-5) / <alpha-value>)',
        radius: 'hsl(var(--radius) / <alpha-value>)',
        sidebar: 'hsl(var(--sidebar) / <alpha-value>)',
        sidebarForeground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
        sidebarPrimary: 'hsl(var(--sidebar-primary) / <alpha-value>)',
        sidebarPrimaryForeground:
          'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
        sidebarAccent: 'hsl(var(--sidebar-accent) / <alpha-value>)',
        sidebarAccentForeground:
          'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
        body: 'hsl(var(--background) / <alpha-value>)',
        dark: 'hsl(var(--dark) / <alpha-value>)',
        'light-dark': 'hsl(var(--light-dark) / <alpha-value>)',
        'sidebar-body': 'hsl(var(--sidebar-body) / <alpha-value>)',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      spacing: {
        13: '3.375rem',
      },
      margin: {
        '1/2': '50%',
      },
      padding: {
        full: '100%',
      },
      width: {
        'calc-320': 'calc(100% - 320px)',
        'calc-358': 'calc(100% - 358px)',
      },
      fontFamily: {
        body: ['Fira Code', 'monospace'],
        kaleko: ['var(--font-kaleko)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        '13px': ['13px', '18px'],
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        main: '0px 6px 18px rgba(0, 0, 0, 0.04)',
        light: '0px 4px 4px rgba(0, 0, 0, 0.08)',
        large: '0px 8px 16px rgba(17, 24, 39, 0.1)',
        card: '0px 2px 6px rgba(0, 0, 0, 0.06)',
        transaction: '0px 8px 16px rgba(17, 24, 39, 0.06)',
        expand: '0px 0px 50px rgba(17, 24, 39, 0.2)',
        button:
          '0px 2px 4px rgba(0, 0, 0, 0.06), 0px 4px 6px rgba(0, 0, 0, 0.1)',
      },
      dropShadow: {
        main: '0px 4px 8px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        blink: 'blink 1.4s infinite both;',
        'move-up': 'moveUp 500ms infinite alternate',
        'scale-up': 'scaleUp 500ms infinite alternate',
        'drip-expand': 'expand 500ms ease-in forwards',
        'drip-expand-large': 'expand-large 600ms ease-in forwards',
        'move-up-small': 'moveUpSmall 500ms infinite alternate',
        // Portal animations
        'door-open-left': 'doorOpenLeft 1.2s ease-in-out 2.5s forwards',
        'door-open-right': 'doorOpenRight 1.2s ease-in-out 2.5s forwards',
        'slide-in-left': 'slideInLeft 1s ease-out 1s forwards',
        'slide-in-right': 'slideInRight 1s ease-out 1s forwards',
        'pulse-logo': 'pulseLogo 1.5s ease-in-out 2.5s forwards',
        'fade-out-portal': 'fadeOutPortal 0.6s ease-in 4s forwards',
        'fade-in-welcome': 'fadeInWelcome 0.8s ease-out 0.2s forwards',
        'fade-in-landing': 'fadeInLanding 0.8s ease-out forwards',
        'orb-float': 'orbFloat 10s ease-in-out infinite',
        'grid-pulse': 'gridPulse 10s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'door-text-glow': 'doorTextGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%': {
            opacity: 0.2,
          },
          '20%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0.2,
          },
        },
        expand: {
          '0%': {
            opacity: 0,
            transform: 'scale(1)',
          },
          '30%': {
            opacity: 1,
          },
          '80%': {
            opacity: 0.5,
          },
          '100%': {
            transform: 'scale(30)',
            opacity: 0,
          },
        },
        'expand-large': {
          '0%': {
            opacity: 0,
            transform: 'scale(1)',
          },
          '30%': {
            opacity: 1,
          },
          '80%': {
            opacity: 0.5,
          },
          '100%': {
            transform: 'scale(96)',
            opacity: 0,
          },
        },
        moveUp: {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-20px)',
          },
        },
        moveUpSmall: {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(-10px)',
          },
        },
        scaleUp: {
          '0%': {
            transform: 'scale(0)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        // Portal animation keyframes
        doorOpenLeft: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(-90deg)', opacity: '0' },
        },
        doorOpenRight: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(90deg)', opacity: '0' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseLogo: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
        },
        fadeOutPortal: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0', pointerEvents: 'none' },
        },
        fadeInWelcome: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1', pointerEvents: 'all' },
        },
        fadeInLanding: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, -40px) scale(1.1)' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        doorTextGlow: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate'),
  ],
};
