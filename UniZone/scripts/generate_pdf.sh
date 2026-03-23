#!/bin/bash

# UniZone Documentation PDF Generator
# This script converts the Markdown documentation to PDF

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/../docs"
INPUT_FILE="$DOCS_DIR/UniZone_Complete_Documentation.md"
OUTPUT_FILE="$DOCS_DIR/UniZone_Complete_Documentation.pdf"

echo "Generating PDF from Markdown documentation..."

# Check if pandoc is installed
if command -v pandoc &> /dev/null; then
    echo "Using pandoc to generate PDF..."
    pandoc "$INPUT_FILE" \
        -o "$OUTPUT_FILE" \
        --pdf-engine=xelatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V documentclass=article \
        --toc \
        --toc-depth=3 \
        -V colorlinks=true \
        -V linkcolor=blue \
        -V urlcolor=blue \
        -V toccolor=black \
        --highlight-style=tango \
        -V papersize=a4
    
    if [ $? -eq 0 ]; then
        echo "✅ PDF generated successfully: $OUTPUT_FILE"
    else
        echo "❌ PDF generation failed. Trying alternative method..."
        
        # Try with wkhtmltopdf if available
        if command -v wkhtmltopdf &> /dev/null; then
            echo "Using wkhtmltopdf..."
            pandoc "$INPUT_FILE" -o temp.html --standalone --toc
            wkhtmltopdf temp.html "$OUTPUT_FILE"
            rm temp.html
            echo "✅ PDF generated successfully: $OUTPUT_FILE"
        else
            echo "❌ Please install pandoc or wkhtmltopdf"
            echo "Install pandoc: brew install pandoc (macOS) or apt-get install pandoc (Linux)"
        fi
    fi
else
    echo "pandoc is not installed."
    echo ""
    echo "Installation options:"
    echo "  macOS: brew install pandoc"
    echo "  Linux: sudo apt-get install pandoc texlive-xetex"
    echo "  Windows: Download from https://pandoc.org/installing.html"
    echo ""
    echo "Alternative: Use online converters like:"
    echo "  - https://www.markdowntopdf.com/"
    echo "  - https://dillinger.io/ (export as PDF)"
    echo ""
    echo "Or use VS Code with 'Markdown PDF' extension"
fi
