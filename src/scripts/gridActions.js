import { gsap } from 'gsap';

// Grid Actions with GSAP animations
export class GridActions {
  constructor() {
    this.grid = null;
    this.items = [];
    this.isAnimating = false;
    this.init();
  }

  init() {
    this.grid = document.querySelector('.video-grid');
    if (!this.grid) return;

    this.items = Array.from(this.grid.querySelectorAll('.video-card'));
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Sort buttons
    const sortButtons = document.querySelectorAll('[data-sort]');
    sortButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const sortType = button.dataset.sort;
        this.sortItems(sortType);
      });
    });

    // Shuffle button
    const shuffleButton = document.querySelector('[data-shuffle]');
    if (shuffleButton) {
      shuffleButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.shuffleItems();
      });
    }

    // Search functionality
    const searchInput = document.querySelector('[data-search]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterItems(e.target.value);
      });
    }
  }

  sortItems(sortType) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Get current positions
    const positions = this.items.map(item => {
      const rect = item.getBoundingClientRect();
      return { item, x: rect.left, y: rect.top };
    });

    // Sort items based on type
    let sortedItems = [...this.items];
    switch (sortType) {
      case 'title':
        sortedItems.sort((a, b) => {
          const titleA = a.querySelector('h3').textContent.toLowerCase();
          const titleB = b.querySelector('h3').textContent.toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'author':
        sortedItems.sort((a, b) => {
          const authorA = a.querySelector('p').textContent.toLowerCase();
          const authorB = b.querySelector('p').textContent.toLowerCase();
          return authorA.localeCompare(authorB);
        });
        break;
      case 'category':
        sortedItems.sort((a, b) => {
          const catA = a.querySelector('.category-badge')?.textContent || '';
          const catB = b.querySelector('.category-badge')?.textContent || '';
          return catA.localeCompare(catB);
        });
        break;
    }

    // Animate out
    gsap.to(this.items, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      stagger: 0.02,
      ease: "power2.in",
      onComplete: () => {
        // Reorder DOM elements
        sortedItems.forEach(item => {
          this.grid.appendChild(item);
        });

        this.items = sortedItems;

        // Animate in
        gsap.fromTo(this.items, 
          {
            opacity: 0,
            scale: 0.8,
            y: 20
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
            onComplete: () => {
              this.isAnimating = false;
            }
          }
        );
      }
    });
  }

  shuffleItems() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Shuffle array
    const shuffled = [...this.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Animate shuffle
    gsap.to(this.items, {
      rotationY: 180,
      opacity: 0,
      duration: 0.4,
      stagger: 0.03,
      ease: "power2.in",
      onComplete: () => {
        // Reorder DOM
        shuffled.forEach(item => {
          this.grid.appendChild(item);
        });

        this.items = shuffled;

        // Animate in
        gsap.fromTo(this.items,
          {
            rotationY: -180,
            opacity: 0
          },
          {
            rotationY: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: "power2.out",
            onComplete: () => {
              this.isAnimating = false;
            }
          }
        );
      }
    });
  }

  filterItems(searchTerm) {
    if (this.isAnimating) return;

    const term = searchTerm.toLowerCase().trim();
    
    this.items.forEach((item, index) => {
      const title = item.querySelector('h3').textContent.toLowerCase();
      const author = item.querySelector('p').textContent.toLowerCase();
      const category = item.querySelector('.category-badge')?.textContent.toLowerCase() || '';
      
      const matches = title.includes(term) || author.includes(term) || category.includes(term);
      
      if (matches || term === '') {
        gsap.to(item, {
          opacity: 1,
          scale: 1,
          height: 'auto',
          duration: 0.3,
          delay: index * 0.02,
          ease: "power2.out"
        });
      } else {
        gsap.to(item, {
          opacity: 0,
          scale: 0.8,
          height: 0,
          duration: 0.3,
          delay: index * 0.02,
          ease: "power2.in"
        });
      }
    });
  }

  // Hover animations for grid items
  setupHoverAnimations() {
    this.items.forEach(item => {
      const image = item.querySelector('img');
      const content = item.querySelector('.card-content');

      item.addEventListener('mouseenter', () => {
        gsap.to(image, {
          scale: 1.1,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(content, {
          y: -5,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      item.addEventListener('mouseleave', () => {
        gsap.to(image, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(content, {
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }
}

// Initialize grid actions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GridActions();
});