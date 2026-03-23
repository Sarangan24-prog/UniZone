# PDF Generation Guide

This guide explains how to convert the UniZone Complete Documentation Markdown file to PDF.

## Method 1: Using Pandoc (Recommended)

Pandoc is a universal document converter that produces high-quality PDFs.

### Installation

**macOS:**
```bash
brew install pandoc
brew install --cask basictex  # or mactex
```

**Linux:**
```bash
sudo apt-get install pandoc texlive-xetex
```

**Windows:**
Download from: https://pandoc.org/installing.html

### Generate PDF

```bash
cd /Users/vinu/Downloads
./generate_pdf.sh
```

Or manually:
```bash
pandoc UniZone_Complete_Documentation.md \
  -o UniZone_Complete_Documentation.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  --toc \
  --toc-depth=3
```

## Method 2: Using VS Code Extension

1. Install "Markdown PDF" extension in VS Code
2. Open `UniZone_Complete_Documentation.md`
3. Right-click → "Markdown PDF: Export (pdf)"
4. PDF will be generated in the same directory

## Method 3: Using Online Converters

1. Go to https://www.markdowntopdf.com/
2. Upload `UniZone_Complete_Documentation.md`
3. Click "Convert"
4. Download the generated PDF

Other online options:
- https://dillinger.io/ (export as PDF)
- https://www.markdown-pdf.com/

## Method 4: Using Node.js (markdown-pdf)

```bash
npm install -g markdown-pdf
cd /Users/vinu/Downloads
node generate_pdf.js
```

## Method 5: Using Chrome/Chromium (Headless)

If you have Chrome/Chromium installed:

```bash
# Convert markdown to HTML first (using pandoc)
pandoc UniZone_Complete_Documentation.md -o temp.html --standalone --toc

# Then use Chrome headless to print to PDF
google-chrome --headless --disable-gpu --print-to-pdf=output.pdf temp.html

# Or on macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu --print-to-pdf=output.pdf temp.html
```

## Recommended Settings for PDF

- **Page Size:** A4
- **Margins:** 1 inch (2.54 cm)
- **Font Size:** 11pt (body), 14pt (headings)
- **Table of Contents:** Yes (3 levels)
- **Page Numbers:** Yes
- **Color Links:** Yes

## Troubleshooting

### Pandoc: "xelatex not found"
Install LaTeX distribution:
- macOS: `brew install --cask mactex`
- Linux: `sudo apt-get install texlive-full`

### Font Issues
Ensure you have fonts installed. For best results, use:
- Body text: Times New Roman or similar
- Code: Courier New or monospace font

### Large File Size
If PDF is too large:
- Reduce image quality (if any)
- Use compression: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=compressed.pdf original.pdf`

## Output

The generated PDF will be saved as:
`/Users/vinu/Downloads/UniZone_Complete_Documentation.pdf`

Expected file size: ~500KB - 2MB (depending on method)

---

**Note:** The documentation contains Mermaid diagrams. Some PDF generators may not render these. Consider:
1. Converting diagrams to images first
2. Using a tool that supports Mermaid (like VS Code with Mermaid extension)
3. Replacing Mermaid code blocks with image references
