// Reusable animation configurations for GSAP and Framer Motion

// Framer Motion Variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Hover animation for interactive elements
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
  transition: { duration: 0.3 }
};

// Map zoom animations
export const mapZoomVariants = {
  initial: { scale: 1, opacity: 1 },
  zoomedIn: { 
    scale: 1.5, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
  },
  zoomedOut: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
  }
};

// Card animations
export const cardHover = {
  y: -8,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  transition: { duration: 0.3, ease: 'easeOut' }
};

// Modal backdrop
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

// GSAP ease presets
export const gsapEase = {
  smooth: 'power2.inOut',
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'back.out(1.7)',
  fast: 'power3.out'
};
