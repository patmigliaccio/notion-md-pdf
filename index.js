#!/usr/bin/env node

const path = require('path'),
  AdmZip = require('adm-zip'),
  fs = require('fs'),
  marked = require('marked'),
  util = require('util'),
  execFile = util.promisify(require('child_process').execFile);

const TEMP_FILE = './temp.html';

let args = process.argv.slice(2);

let filename = args[0];

if (filename === undefined || filename === null) {
  throw new Error('Missing filename parameter.');
}

let zipFilePath = path.resolve(filename);

let zip = new AdmZip(zipFilePath);
let zipEntries = zip.getEntries();

zipEntries.forEach(zipEntry => {
  let mdFileName = zipEntry.entryName;
  let pdfFilePath =
    path.join(
      ...[zipFilePath.slice(0, zipFilePath.lastIndexOf('/')), mdFileName.slice(0, zipFilePath.lastIndexOf('.'))]
    ) + '.pdf';

  let data = zipEntry.getData().toString('utf-8');
  mdStringtoPDF(data, pdfFilePath);
});

/**
 * Converts a `string` containing Markdown syntax into a PDF.
 *
 * @param {string} md String of Markdown data
 * @param {string} outputPath PDF filePath
 */
async function mdStringtoPDF(md, outputPath) {
  let html = marked(md);

  html = prependCSS(html, './assets/css/github-markdown.css');

  await fs.writeFileSync(TEMP_FILE, html);

  await convertPDF(outputPath);

  fs.unlinkSync(TEMP_FILE);

  console.log(`Conversion completed: ${outputPath}`);
}


/**
 * Adds CSS to HTML
 *
 * @param {string} html
 * @param {string} cssFilePath
 * @returns {string}
 */
function prependCSS(html, cssFilePath) {
  let css = '';

  try {
    css = fs.readFileSync(cssFilePath, {
      encoding: 'utf-8'
    });
  } catch (err) {
    console.log(err);
  }

  return `
    <style>${css}</style>
    <div class="markdown-body">${html}</div>
  `;
}


/**
 * Executes OS-specific binary for `wkhtmltopdf` to convert HTML to PDF
 *
 * @param {string} outputPath
 * @returns {Promise<any>}
 */
async function convertPDF(outputPath) {
  if (process.platform === "win32") {
    return await execFile('./bin/win/wkhtmltopdf.exe', [TEMP_FILE, outputPath]);
  } else if (process.platform === "darwin") {
    // FIXME: Mac OSX Unsupported
  } else {
    return await execFile('./bin/linux/wkhtmltopdf', [TEMP_FILE, outputPath]);
  }
}
