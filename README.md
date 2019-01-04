# notion-md-pdf

Converts pages exported from [Notion](https://notion.so) as Markdown into PDF files using the command line due to browser rendering issues.

## Rationale

Provided by default within the application, Notion's "Export -> Print as PDF" functionality only allows a single page to be _printed to PDF_ at a time. As a result, formatting issues occur in most cases (e.g. multiline code snippets) from the browser attempting to render the markup unsuccessfully.

### Process

```text
Markdown Files (ZIP) -> marked -> HTML Files -> wkhtmltoPDF -> PDF Files
```

The methodology used by this tool is simply to take exported Markdown pages from Notion, individually or in bulk, uncompress the downloaded archive and then process each by first parsing into HTML using [`marked`](https://github.com/markedjs/marked) and then converting to PDF using [`wkhtmltopdf`](https://wkhtmltopdf.org/).

**Note:** `wkhtmltopdf` is used instead of other [`PhantomJS`](https://github.com/ariya/phantomjs)-based methods which seem suffer some similar defects ([#10373](https://github.com/ariya/phantomjs/issues/10373), [#10669](https://github.com/ariya/phantomjs/issues/10669), [#13524](https://github.com/ariya/phantomjs/issues/13524)) as the browser, even though both are using the [QtWebKit](https://trac.webkit.org/wiki/QtWebKit) rendering engine.

## Installation

Use your ideal package manager for Node and install globally.

Yarn

```bash
yarn global add notion-md-pdf
```

NPM

```bash
npm install notion-md-pdf -g
```

## Usage

Call the following shell command with the desired zip archive as the first argument.

```bash
notion-md-pdf Export-XXXXXX.zip
# Conversion completed: ~/Document-Name-XXXXXX-1.pdf
```

## Supported Operating Systems

Linux (64-bit) and Windows (64-bit) OS are supported.

Mac OS X is currently unsupported due to implementation of `wkhtmltopdf`. Support to come in a later release.

## Contributing

Feel free to submit a pull request at any time.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
