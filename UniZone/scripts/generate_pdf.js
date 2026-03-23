#!/usr/bin/env node

/**
 * UniZone Documentation PDF Generator (Node.js)
 * Converts Markdown documentation to PDF
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../docs/UniZone_Complete_Documentation.md');
const outputFile = path.join(__dirname, '../docs/UniZone_Complete_Documentation.pdf');

console.log('UniZone Documentation PDF Generator\n');
console.log('Input:', inputFile);
console.log('Output:', outputFile);
console.log('');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
    console.error('❌ Input file not found:', inputFile);
    process.exit(1);
}

// Try to use markdown-pdf if available
try {
    const markdownpdf = require('markdown-pdf');
    
    console.log('Generating PDF using markdown-pdf...');
    
    const options = {
        paperFormat: 'A4',
        paperOrientation: 'portrait',
        paperBorder: '1in',
        renderDelay: 1000,
        cssPath: path.join(__dirname, 'pdf-styles.css')
    };
    
    markdownpdf(options)
        .from(inputFile)
        .to(outputFile, () => {
            console.log('✅ PDF generated successfully:', outputFile);
            console.log('📄 File size:', (fs.statSync(outputFile).size / 1024).toFixed(2), 'KB');
        });
        
} catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
        console.log('markdown-pdf is not installed.');
        console.log('');
        console.log('Installation:');
        console.log('  npm install -g markdown-pdf');
        console.log('');
        console.log('Alternative methods:');
        console.log('  1. Use the shell script: ./generate_pdf.sh');
        console.log('  2. Use VS Code extension: "Markdown PDF"');
        console.log('  3. Use online converter: https://www.markdowntopdf.com/');
        console.log('  4. Use pandoc: pandoc input.md -o output.pdf');
        process.exit(1);
    } else {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
