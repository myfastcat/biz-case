const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CASES_DIR = path.join(__dirname, '..', 'cases');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const DATA_FILE = path.join(DIST_DIR, 'data.json');

function parseTagLine(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^Tag:\s*(.+)$/i);
    if (match) {
      return match[1].split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  return [];
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function buildCases() {
  const cases = [];
  const allTags = new Set();

  const files = fs.readdirSync(CASES_DIR).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(CASES_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    
    let data = {};
    let content = raw;
    
    // Try to parse frontmatter
    try {
      const parsed = matter(raw);
      if (Object.keys(parsed.data).length > 0) {
        data = parsed.data;
        content = parsed.content;
      }
    } catch (e) {
      // No frontmatter, use raw content
    }

    const title = data.title || extractTitle(content);
    const tags = data.tags || parseTagLine(content);
    
    tags.forEach(tag => allTags.add(tag));

    // Remove the Tag: line from content for cleaner display
    const cleanContent = content.replace(/^Tag:\s*.+$/m, '').trim();
    const html = marked(cleanContent);

    cases.push({
      id: path.basename(file, '.md'),
      title,
      tags,
      content: cleanContent,
      html
    });
  }

  return { cases, tags: Array.from(allTags).sort() };
}

function copyStaticFiles() {
  const srcDir = path.join(__dirname, '..', 'src');
  
  // Copy HTML
  fs.copyFileSync(
    path.join(srcDir, 'index.html'),
    path.join(DIST_DIR, 'index.html')
  );
  
  // Copy CSS
  fs.copyFileSync(
    path.join(srcDir, 'styles.css'),
    path.join(DIST_DIR, 'styles.css')
  );
  
  // Copy JS
  fs.copyFileSync(
    path.join(srcDir, 'app.js'),
    path.join(DIST_DIR, 'app.js')
  );
}

function main() {
  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Build cases data
  const data = buildCases();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Built ${data.cases.length} cases with ${data.tags.length} tags`);

  // Copy static files
  copyStaticFiles();
  console.log('Static files copied to dist/');
}

main();
