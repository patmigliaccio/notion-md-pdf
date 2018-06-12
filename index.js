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
      ...[path.dirname(zipFilePath), mdFileName.slice(0, mdFileName.lastIndexOf('.'))]
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

  let cssFilePath = path.join(__dirname, 'assets/css/github-markdown.css');

  html = prependCSS(html, cssFilePath);

  fs.writeFileSync(TEMP_FILE, html);

  await htmlFiletoPDF(TEMP_FILE, outputPath);

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
    css = fs.readFileSync(path.normalize(cssFilePath), {
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
async function htmlFiletoPDF(htmlFilePath, outputPath) {
  let osExecPath = '';

  if (process.platform === "win32") {
    osExecPath = 'bin\\win\\wkhtmltopdf.exe'
  } else if (process.platform === "darwin") {
    // FIXME: Mac OSX Unsupported
    throw new Error('Mac OSX is currently unsupported.')
    return;
  } else {
    osExecPath = 'bin/linux/wkhtmltopdf';
  }

  let execPath = path.normalize(path.join(__dirname, osExecPath));
  return await execFile(execPath, [path.normalize(htmlFilePath), outputPath]);
}
