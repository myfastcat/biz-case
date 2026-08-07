# AI Product Case Reference

A static web application to browse and organize AI product case studies by tags.

## Features

- **Markdown-based**: Each `.md` file in `cases/` represents a product case
- **Tag filtering**: Organize and filter cases by tags (e.g., RAG, MCP, Documentation)
- **Static site**: Deployable to Cloudflare Pages with zero server costs
- **Dark theme**: Modern, clean UI

## Markdown Format

Each case file should follow this format:

```markdown
# https://product-url.com/
Tag: Tag1, Tag2, Tag3

## What
Description of the product...

## Why
Value proposition...

## How
Technical details...
```

## Local Development

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Serve locally
npm run dev
```

## Deploy to Cloudflare Pages

### Option 1: Git Integration (Recommended)
1. Push this repo to GitHub/GitLab
2. Connect to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`

### Option 2: Direct Upload
```bash
npx wrangler pages deploy dist
```

## Adding New Cases

1. Create a new `.md` file in `cases/` folder
2. Add the title as an H1 header (URL or product name)
3. Add tags on the second line: `Tag: Tag1, Tag2`
4. Write your notes using standard Markdown
5. Rebuild: `npm run build`