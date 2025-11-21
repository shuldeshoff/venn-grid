# Contributing to VennGrid.js

First off, thank you for considering contributing to VennGrid.js! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** (code snippets, screenshots)
* **Describe the behavior you observed and what you expected**
* **Include browser/OS information**

### Suggesting Features

Feature requests are welcome! Please provide:

* **Clear use case** - why would this be useful?
* **Detailed description** - what exactly should happen?
* **Examples** - code examples if possible

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Write clear commit messages
6. Submit a pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/venn-grid.git
cd venn-grid

# Install dependencies
npm install

# Make changes to src/venn-grid.js

# Build minified version
npm run build

# Test in examples/
open examples/standalone.html
```

## Code Style

* Use clear, descriptive variable names
* Add comments for complex logic
* Follow existing code structure
* Keep functions focused and small

## Testing

Before submitting a PR, please test:

1. All examples in `examples/` directory
2. Different browsers (Chrome, Firefox, Safari)
3. Different data sizes (small/large datasets)
4. Zoom and pan functionality
5. Tooltip behavior

## Documentation

If you add new features:

* Update `README.md`
* Add examples to `examples/`
* Update `docs/API.md` if API changes
* Add entry to `CHANGELOG.md`

## Questions?

Feel free to open an issue with the `question` label!

---

Thank you for contributing! 🚀

