class CaseViewer {
  constructor() {
    this.cases = [];
    this.tags = [];
    this.activeTags = new Set();
    this.activeCase = null;
    
    // Tag category mappings - customize as needed
    this.tagCategories = {
      // Tech/Infrastructure
      'RAG': 'tech',
      'MCP': 'tech',
      'API': 'tech',
      'SDK': 'tech',
      'Infrastructure': 'tech',
      'Database': 'tech',
      'Cloud': 'tech',
      // AI/ML
      'AI': 'ai',
      'LLM': 'ai',
      'ML': 'ai',
      'NLP': 'ai',
      'Agent': 'ai',
      'Embedding': 'ai',
      'Vector': 'ai',
      // Product
      'Documentation': 'product',
      'Developer Tools': 'product',
      'SaaS': 'product',
      'Platform': 'product',
      'B2B': 'product',
      'B2C': 'product',
      // Business
      'Pricing': 'business',
      'Enterprise': 'business',
      'Startup': 'business',
      'Open Source': 'business',
    };
    
    this.init();
  }
  
  getTagCategory(tag) {
    return this.tagCategories[tag] || 'default';
  }

  async init() {
    await this.loadData();
    this.renderTags();
    this.renderProductList();
    this.bindEvents();
    
    // Auto-select first case if available
    if (this.cases.length > 0) {
      this.selectCase(this.cases[0].id);
    }
  }

  async loadData() {
    try {
      const response = await fetch('data.json');
      const data = await response.json();
      this.cases = data.cases;
      this.tags = data.tags;
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  renderTags() {
    const container = document.getElementById('tag-filters');
    // Sort tags by category for better grouping
    const sortedTags = [...this.tags].sort((a, b) => {
      const catA = this.getTagCategory(a);
      const catB = this.getTagCategory(b);
      if (catA === catB) return a.localeCompare(b);
      const order = ['ai', 'tech', 'product', 'business', 'default'];
      return order.indexOf(catA) - order.indexOf(catB);
    });
    
    container.innerHTML = sortedTags.map(tag => `
      <span class="tag" data-tag="${tag}" data-category="${this.getTagCategory(tag)}">${tag}</span>
    `).join('');
  }

  renderProductList() {
    const container = document.getElementById('product-list');
    container.innerHTML = this.cases.map(c => `
      <div class="product-item" data-id="${c.id}">
        <div class="product-name">${this.extractProductName(c.title)}</div>
        <div class="product-tags">
          ${c.tags.map(t => `<span class="product-tag">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  extractProductName(title) {
    // Extract domain name from URL or use title as-is
    const urlMatch = title.match(/https?:\/\/([^/]+)/);
    if (urlMatch) {
      return urlMatch[1].replace('www.', '');
    }
    return title;
  }

  selectCase(id) {
    const caseData = this.cases.find(c => c.id === id);
    if (!caseData) return;

    this.activeCase = id;

    // Update active state in product list
    document.querySelectorAll('.product-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    // Remove duplicate H1 from content
    const cleanHtml = caseData.html.replace(/^<h1[^>]*>.*?<\/h1>\s*/i, '');

    // Render case detail
    const container = document.getElementById('case-detail');
    container.innerHTML = `
      <div class="case-header">
        <h1 class="case-title">${this.extractProductName(caseData.title)}</h1>
      </div>
      <div class="case-content">
        ${cleanHtml}
      </div>
      <div class="startup-ideas">
        <h2>💡 Startup Ideas</h2>
        <div class="ideas-content" id="ideas-${caseData.id}">
          <div class="loading">Generating ideas...</div>
        </div>
      </div>
    `;

    // Auto-generate ideas
    this.generateIdeas(caseData.id);
  }

  async generateIdeas(caseId) {
    const caseData = this.cases.find(c => c.id === caseId);
    if (!caseData) return;

    const container = document.getElementById(`ideas-${caseId}`);
    container.innerHTML = '<div class="loading">Generating ideas...</div>';

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: caseData.title,
          caseContent: caseData.content
        })
      });

      const data = await response.json();
      const ideasText = data.response || data.result?.response || 'No ideas generated';
      
      // Convert markdown-like response to HTML
      const formattedIdeas = ideasText
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      
      container.innerHTML = `<div class="ideas-text">${formattedIdeas}</div>`;
    } catch (error) {
      container.innerHTML = `
        <div class="ideas-error">Failed to generate ideas. Make sure you're running on Cloudflare Pages with AI binding.</div>
        <button class="generate-btn" onclick="window.caseViewer.generateIdeas('${caseId}')">Retry</button>
      `;
    }
  }

  filterByTags() {
    const clearBtn = document.getElementById('clear-filters');
    clearBtn.style.display = this.activeTags.size > 0 ? 'block' : 'none';

    document.querySelectorAll('.product-item').forEach(el => {
      const caseData = this.cases.find(c => c.id === el.dataset.id);
      if (!caseData) return;

      if (this.activeTags.size === 0) {
        el.classList.remove('hidden');
      } else {
        const hasMatchingTag = caseData.tags.some(t => this.activeTags.has(t));
        el.classList.toggle('hidden', !hasMatchingTag);
      }
    });
  }

  bindEvents() {
    // Tag filter clicks
    document.getElementById('tag-filters').addEventListener('click', (e) => {
      if (e.target.classList.contains('tag')) {
        const tag = e.target.dataset.tag;
        if (this.activeTags.has(tag)) {
          this.activeTags.delete(tag);
          e.target.classList.remove('active');
        } else {
          this.activeTags.add(tag);
          e.target.classList.add('active');
        }
        this.filterByTags();
      }
    });

    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', () => {
      this.activeTags.clear();
      document.querySelectorAll('.tag').forEach(el => el.classList.remove('active'));
      this.filterByTags();
    });

    // Product selection
    document.getElementById('product-list').addEventListener('click', (e) => {
      const item = e.target.closest('.product-item');
      if (item) {
        this.selectCase(item.dataset.id);
      }
    });
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  window.caseViewer = new CaseViewer();
});
