#!/usr/bin/env node

const markdownpdf = require('markdown-pdf'),
  path = require('path'),
  AdmZip = require('adm-zip');

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
 * FIXME: CSS code highlighting not applying properly.
 * 	Might be an issue with `markdown-pdf`, explore `pandoc` option.
 *
 * @param {string} md String of Markdown data
 * @param {string} outputPath PDF filePath
 */
function mdStringtoPDF(md, outputPath) {
  markdownpdf({
      highlightCssPath: './assets/css/darcula.css'
    })
    .from.string(md)
    .to(outputPath, () => {
      console.log(`Conversion completed: ${outputPath}`);
    });
}
