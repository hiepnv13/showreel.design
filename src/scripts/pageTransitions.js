// Page Transitions with GSAP and Astro View Transitions
import { gsap } from 'gsap';

class PageTransitions {
  constructor() {
    this.init();
  }

  init() {
    // Listen for Astro view transitions
    document.addEventListener('astro:before-preparation', this.beforePreparation.bind(this));
    document.addEventListener('astro:after-preparation', this.afterPreparation.bind(this));
    document.addEventListener('astro:before-swap', this.beforeSwap.bind(this));
    document.addEventListener('astro:after-swap', this.afterSwap.bind(this));
  }

  beforePreparation(event) {
    // Animate out current page elements
    const cards = document.querySelectorAll('.video-card');
    const heroElements = document.querySelectorAll('.hero-element');
    
    gsap.to([...cards, ...heroElements], {
      opacity: 0,
      y: -30,
      scale: 0.95,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.inOut"
    });
  }

  afterPreparation(event) {
    // Preparation complete
    console.log('Page transition preparation complete');
  }

  beforeSwap(event) {
    // Just before DOM swap
    console.log('About to swap DOM');
  }

  afterSwap(event) {
    // Animate in new page elements
    this.animatePageIn();
  }

  animatePageIn() {
    // Reset and animate in new elements
    const cards = document.querySelectorAll('.video-card');
    const heroElements = document.querySelectorAll('.hero-element');
    
    // Set initial state
    gsap.set([...cards, ...heroElements], {
      opacity: 0,
      y: 50,
      scale: 0.9
    });

    // Animate hero elements first
    gsap.to(heroElements, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.2
    });

    // Then animate cards
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.4
    });
  }

  // Manual page transition for non-Astro navigation
  transitionTo(url) {
    const tl = gsap.timeline();
    
    // Animate out
    tl.to('.video-card, .hero-element', {
      opacity: 0,
      y: -30,
      scale: 0.95,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.inOut"
    })
    .call(() => {
      // Navigate to new page
      window.location.href = url;
    });
  }
}

// Initialize page transitions
new PageTransitions();

// Export for manual use
export { PageTransitions };