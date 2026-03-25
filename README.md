# VitePress Theme for Obsidian

A [VitePress](https://vitepress.dev/)-style theme plugin for Obsidian, bringing the modern documentation aesthetic to your notes.

## Features

### Visual Styles

- **Typography** - Clean, readable fonts with proper heading hierarchy
- **Code Blocks** - Enhanced code blocks with copy button and language labels
- **Custom Containers** - Tip, warning, danger, and info callouts with VitePress colors
- **Tables** - Styled tables with hover effects
- **Links** - External link indicators and improved link styling

### Functionality

- **Container Parser** - Convert `::: tip` syntax to styled containers
- **Link Processing** - Handle VitePress-style relative links
- **Theme Adaptation** - Automatically follow Obsidian light/dark theme

## Installation

### From Source

```bash
git clone https://github.com/yourusername/obsidian-vitepress-theme
cd obsidian-vitepress-theme
pnpm install
pnpm run build
```

Then copy `manifest.json`, `main.js` to your Obsidian vault's `.obsidian/plugins/vitepress-theme/` folder.

### Manual Installation

1. Download the latest release
2. Extract to `.obsidian/plugins/vitepress-theme/`
3. Enable in Obsidian Settings → Community Plugins

## Usage

### VitePress Containers

Use `:::` syntax in your notes:

```markdown
::: tip
This is a tip container
:::

::: warning Warning Title
This is a warning with custom title
:::

::: danger STOP!
This is a danger container
:::

::: info
This is an info container
:::

::: details Click to expand
Hidden content here
:::
```

### Obsidian Callouts

Standard Obsidian callouts are styled to match VitePress:

```markdown
> [!tip]
> Looks like VitePress tip container

> [!warning]
> Looks like VitePress warning container
```

### Code Blocks

Code blocks get enhanced with:

- Language label in header
- Copy button on hover
- Better syntax highlighting

## Development

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm run dev

# Build for production
pnpm run build
```

## Settings

| Setting                    | Description              | Default |
| -------------------------- | ------------------------ | ------- |
| Enable code block styles   | Enhanced code blocks     | ✅      |
| Enable container styles    | Custom container styling | ✅      |
| Enable typography styles   | Typography improvements  | ✅      |
| Parse VitePress containers | Parse `:::` syntax       | ✅      |
| Process links              | External link icons      | ✅      |
| Follow Obsidian theme      | Adapt to Obsidian colors | ✅      |
| Custom primary color       | Brand color override     | #3451b2 |

## License

MIT
