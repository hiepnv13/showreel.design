// Search Handler for Header Search Bar
class SearchHandler {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.searchSuggestions = document.getElementById('search-suggestions');
    this.suggestionsContent = document.getElementById('suggestions-content');
    this.searchContainer = document.getElementById('search-container');
    
    this.videos = [];
    this.debounceTimer = null;
    this.currentFocus = -1;
    
    this.init();
  }

  async init() {
    if (!this.searchInput) return;
    
    // Load all videos for client-side search
    await this.loadVideos();
    
    // Event listeners
    this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    this.searchInput.addEventListener('focus', (e) => this.handleFocus(e));
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => this.handleClickOutside(e));
  }

  async loadVideos() {
    try {
      // In a real implementation, you might want to fetch this from an API
      // For now, we'll use a simple approach to get video data
      // This is a placeholder - in production you'd want to optimize this
      const response = await fetch('/api/videos.json').catch(() => null);
      if (response && response.ok) {
        this.videos = await response.json();
      } else {
        // Fallback: extract video data from current page if available
        this.extractVideoDataFromPage();
      }
    } catch (error) {
      console.warn('Could not load videos for search:', error);
      this.extractVideoDataFromPage();
    }
  }

  extractVideoDataFromPage() {
    // Extract video data from video cards on the current page
    const videoCards = document.querySelectorAll('.video-card');
    this.videos = Array.from(videoCards).map(card => {
      const titleEl = card.querySelector('h3, .video-title');
      const authorEl = card.querySelector('.video-author, [data-author]');
      const categoryEl = card.querySelector('.video-category, [data-category]');
      const linkEl = card.querySelector('a');
      
      return {
        title: titleEl?.textContent?.trim() || '',
        author: authorEl?.textContent?.trim() || authorEl?.dataset?.author || '',
        category: categoryEl?.textContent?.trim() || categoryEl?.dataset?.category || '',
        slug: linkEl?.href?.split('/').pop() || '',
        url: linkEl?.href || ''
      };
    }).filter(video => video.title); // Only include videos with titles
  }

  handleInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Debounce search to avoid too many operations
    this.debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        this.showSuggestions(query);
      } else {
        this.hideSuggestions();
      }
    }, 300);
  }

  handleFocus(e) {
    const query = e.target.value.trim();
    if (query.length >= 2) {
      this.showSuggestions(query);
    }
  }

  handleKeydown(e) {
    const suggestions = this.suggestionsContent.querySelectorAll('.suggestion-item');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentFocus = Math.min(this.currentFocus + 1, suggestions.length - 1);
        this.updateFocus(suggestions);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.currentFocus = Math.max(this.currentFocus - 1, -1);
        this.updateFocus(suggestions);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.currentFocus >= 0 && suggestions[this.currentFocus]) {
          suggestions[this.currentFocus].click();
        } else {
          // Submit the form
          this.searchInput.closest('form').submit();
        }
        break;
        
      case 'Escape':
        this.hideSuggestions();
        this.searchInput.blur();
        break;
    }
  }

  updateFocus(suggestions) {
    suggestions.forEach((item, index) => {
      if (index === this.currentFocus) {
        item.classList.add('bg-gray-100');
      } else {
        item.classList.remove('bg-gray-100');
      }
    });
  }

  handleClickOutside(e) {
    if (!this.searchContainer.contains(e.target)) {
      this.hideSuggestions();
    }
  }

  searchVideos(query) {
    const searchTerm = query.toLowerCase();
    
    return this.videos.filter(video => {
      return (
        video.title.toLowerCase().includes(searchTerm) ||
        video.author.toLowerCase().includes(searchTerm) ||
        video.category.toLowerCase().includes(searchTerm) ||
        (video.description && video.description.toLowerCase().includes(searchTerm)) ||
        (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }).slice(0, 8); // Limit to 8 suggestions
  }

  showSuggestions(query) {
    const results = this.searchVideos(query);
    
    if (results.length === 0) {
      this.suggestionsContent.innerHTML = `
        <div class="px-4 py-3 text-gray-500 text-sm">
          No videos found for "${this.escapeHtml(query)}"
        </div>
      `;
    } else {
      this.suggestionsContent.innerHTML = results.map(video => `
        <a href="/videos/${video.slug}" class="suggestion-item block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">${this.highlightMatch(video.title, query)}</div>
              <div class="text-sm text-gray-500 truncate">by ${video.author} • ${video.category}</div>
            </div>
          </div>
        </a>
      `).join('');
    }
    
    // Add "View all results" option
    this.suggestionsContent.innerHTML += `
      <a href="/search?q=${encodeURIComponent(query)}" class="suggestion-item block px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-200 bg-gray-25">
        <div class="flex items-center space-x-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span class="text-sm font-medium text-gray-700">View all results for "${this.escapeHtml(query)}"</span>
        </div>
      </a>
    `;
    
    this.searchSuggestions.classList.remove('hidden');
    this.currentFocus = -1;
  }

  hideSuggestions() {
    this.searchSuggestions.classList.add('hidden');
    this.currentFocus = -1;
  }

  highlightMatch(text, query) {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return this.escapeHtml(text).replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Initialize search handler when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SearchHandler());
} else {
  new SearchHandler();
}

// Export for manual initialization if needed
export { SearchHandler };