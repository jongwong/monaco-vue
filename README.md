# Monaco Vue

Vue language plugin for the Monaco Editor. It provides the following features when editing vue files:
* Code completion(javascript css html for vue)
* Formatting
* Document Highlights
* Link detection
* Syntax highlighting

Internally the Vue plugin uses the [vscode-html-languageservice](https://github.com/Microsoft/vscode-html-languageservice)
node module, providing the implementation of the functionally listed above. The same module is also used
in [Visual Studio Code](https://github.com/Microsoft/vscode) to power the HTML editing experience.

This package is the update of the branch 'rebornix/EmbeddedLanguage'
## Issues

Please file issues concering `monaco-html` in the [`monaco-editor` repository](https://github.com/Microsoft/monaco-editor/issues).

## Installing

This npm module is bundled and distributed in the [monaco-editor](https://www.npmjs.com/package/monaco-editor) npm module.

## Development

* `git clone https://github.com/jongwong/monaco-vue-extra`
* `cd monaco-vue`
* `npm install .`
* `npm run prepublishOnly`
* open `$/monaco-vue/test/index.html` in your favorite browser.

## License
[MIT](https://github.com/Microsoft/monaco-vue/blob/master/LICENSE.md)
