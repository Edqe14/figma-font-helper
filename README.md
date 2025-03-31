# Figma Font Helper

A lightweight Node.js server that helps Figma access local system fonts. This implementation uses Bun runtime for better performance and minimal dependencies.

## 🚀 Features

- System font discovery and listing
- Font file serving for Figma
- Support for various font weights and styles
- Automatic italic variant detection
- CORS configuration for Figma.com
- Custom port configuration

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Edqe14/figma-font-helper

# Install dependencies
bun install
```

## 🛠️ Usage

Start the server with default settings:

```bash
bun run index.ts
```

Custom port:

```bash
bun run index.ts --port=44951
```

## 🔧 Configuration

The server accepts the following command-line arguments:

- `--port`: Server port number (default: 44950)

## 🔍 API Endpoints

### GET `/figma/font-files`

Returns a list of available system fonts in Figma-compatible format.

### GET `/figma/font-file`

Serves individual font files requested by Figma.

## 📝 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
