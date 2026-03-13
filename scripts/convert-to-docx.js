const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

async function convertToDocx() {
    const markdownFile = path.join(__dirname, '..', 'docs', 'SyncUp_IEEE_Research_Paper.md');
    const htmlFile = path.join(__dirname, '..', 'docs', 'SyncUp_IEEE_Research_Paper.html');

    // Read markdown content
    const markdownContent = fs.readFileSync(markdownFile, 'utf8');

    try {
        // Convert markdown to HTML
        const htmlValue = marked.parse(markdownContent);

        // Create HTML with proper IEEE styling
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SyncUp: AI-Powered Meeting Assistant</title>
<style>
body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    margin: 1in;
    text-align: justify;
}
h1 {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 12pt;
    margin-top: 24pt;
}
h2 {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 18pt;
    margin-bottom: 12pt;
}
h3 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 12pt;
}
p {
    text-align: justify;
    margin-bottom: 6pt;
    text-indent: 0.5in;
}
.title {
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24pt;
}
.authors {
    text-align: center;
    margin-bottom: 24pt;
    font-size: 12pt;
}
.abstract {
    text-align: left;
    text-indent: 0;
    margin-bottom: 12pt;
    font-style: italic;
}
.abstract-title {
    font-weight: bold;
    font-style: normal;
    text-align: center;
}
.index-terms {
    text-align: left;
    text-indent: 0;
    font-style: italic;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 12pt 0;
}
th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #f0f0f0;
    font-weight: bold;
}
pre {
    background-color: #f5f5f5;
    padding: 10px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
}
blockquote {
    border-left: 3px solid #ccc;
    margin-left: 0;
    padding-left: 10px;
    color: #666;
}
ul, ol {
    margin-left: 0.5in;
}
li {
    margin-bottom: 6pt;
}
hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 20pt 0;
}
</style>
</head>
<body>
${htmlValue}
</body>
</html>`;

        // Write HTML file
        fs.writeFileSync(htmlFile, htmlContent);

        console.log(`Successfully converted to: ${htmlFile}`);
        console.log('');
        console.log('INSTRUCTIONS TO CREATE DOCX:');
        console.log('1. Open the HTML file in Microsoft Word');
        console.log('2. Go to File > Save As');
        console.log('3. Select "Word Document (*.docx)" as the format');
        console.log('4. Save as "SyncUp_IEEE_Research_Paper.docx"');
    } catch (error) {
        console.error('Error converting:', error);
    }
}

convertToDocx();
