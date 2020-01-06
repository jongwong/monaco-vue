/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";

import * as mode from "./vueMode";

import Emitter = monaco.Emitter;
import IEvent = monaco.IEvent;
import IDisposable = monaco.IDisposable;

export interface IExtraLib {
  content: string;
  version: number;
}
export interface IExtraLibs {
  [path: string]: IExtraLib;
}
// --- HTML configuration and defaults ---------

export class LanguageServiceDefaultsImpl
  implements monaco.languages.vue.LanguageServiceDefaults {
  private _onDidChange = new Emitter<
    monaco.languages.vue.LanguageServiceDefaults
  >();
  private _options: monaco.languages.vue.Options;
  private _modeConfiguration: monaco.languages.vue.ModeConfiguration;
  private _languageId: string;

  private _extraLibs: IExtraLibs;
  private _onDidExtraLibsChangeTimeout: number;
  private _onDidExtraLibsChange = new Emitter<void>();

  constructor(
    languageId: string,
    options: monaco.languages.vue.Options,
    modeConfiguration: monaco.languages.vue.ModeConfiguration
  ) {
    this._languageId = languageId;
    this.setOptions(options);
    this.setModeConfiguration(modeConfiguration);

    this._extraLibs = Object.create(null);
    this._onDidExtraLibsChangeTimeout = -1;
  }

  get onDidChange(): IEvent<monaco.languages.vue.LanguageServiceDefaults> {
    return this._onDidChange.event;
  }

  get languageId(): string {
    return this._languageId;
  }

  get options(): monaco.languages.vue.Options {
    return this._options;
  }

  get modeConfiguration(): monaco.languages.vue.ModeConfiguration {
    return this._modeConfiguration;
  }

  setOptions(options: monaco.languages.vue.Options): void {
    this._options = options || Object.create(null);
    this._onDidChange.fire(this);
  }

  setModeConfiguration(
    modeConfiguration: monaco.languages.vue.ModeConfiguration
  ): void {
    this._modeConfiguration = modeConfiguration || Object.create(null);
    this._onDidChange.fire(this);
  }
  getExtraLibs(): IExtraLibs {
    return this._extraLibs;
  }
  addExtraLib(content: string, _filePath?: string): IDisposable {
    let filePath: string;
    if (typeof _filePath === "undefined") {
      filePath = `ts:default-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
    } else {
      filePath = _filePath;
    }

    if (
      this._extraLibs[filePath] &&
      this._extraLibs[filePath].content === content
    ) {
      // no-op, there already exists an extra lib with this content
      return {
        dispose: () => {}
      };
    }

    let myVersion = 1;
    if (this._extraLibs[filePath]) {
      myVersion = this._extraLibs[filePath].version + 1;
    }

    this._extraLibs[filePath] = {
      content: content,
      version: myVersion
    };
    this._fireOnDidExtraLibsChangeSoon();

    return {
      dispose: () => {
        let extraLib = this._extraLibs[filePath];
        if (!extraLib) {
          return;
        }
        if (extraLib.version !== myVersion) {
          return;
        }

        delete this._extraLibs[filePath];
        this._fireOnDidExtraLibsChangeSoon();
      }
    };
  }

  setExtraLibs(libs: { content: string; filePath?: string }[]): void {
    // clear out everything
    this._extraLibs = Object.create(null);

    if (libs && libs.length > 0) {
      for (const lib of libs) {
        const filePath =
          lib.filePath ||
          `ts:default-${Math.random()
            .toString(36)
            .substring(2, 15)}`;
        const content = lib.content;
        this._extraLibs[filePath] = {
          content: content,
          version: 1
        };
      }
    }

    this._fireOnDidExtraLibsChangeSoon();
  }

  private _fireOnDidExtraLibsChangeSoon(): void {
    if (this._onDidExtraLibsChangeTimeout !== -1) {
      // already scheduled
      return;
    }
    this._onDidExtraLibsChangeTimeout = setTimeout(() => {
      this._onDidExtraLibsChangeTimeout = -1;
      this._onDidExtraLibsChange.fire(undefined);
    }, 0);
  }
}

const formatDefaults: Required<monaco.languages.vue.HTMLFormatConfiguration> = {
  tabSize: 4,
  insertSpaces: false,
  wrapLineLength: 120,
  unformatted:
    'default": "a, abbr, acronym, b, bdo, big, br, button, cite, code, dfn, em, i, img, input, kbd, label, map, object, q, samp, select, small, span, strong, sub, sup, textarea, tt, var',
  contentUnformatted: "pre",
  indentInnerHtml: false,
  preserveNewLines: true,
  maxPreserveNewLines: null,
  indentHandlebars: false,
  endWithNewline: false,
  extraLiners: "head, body, /html",
  wrapAttributes: "auto"
};

const vueOptionsDefault: Required<monaco.languages.vue.Options> = {
  format: formatDefaults,
  suggest: { html5: true, angular1: true, ionic: true }
};

const handlebarOptionsDefault: Required<monaco.languages.vue.Options> = {
  format: formatDefaults,
  suggest: { html5: true }
};

const razorOptionsDefault: Required<monaco.languages.vue.Options> = {
  format: formatDefaults,
  suggest: { html5: true, razor: true }
};

function getConfigurationDefault(
  languageId: string
): Required<monaco.languages.vue.ModeConfiguration> {
  return {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    links: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    selectionRanges: true,
    signatureHelp: true,
    diagnostics: languageId === vueLanguageId, // turned off for Razor and Handlebar
    documentFormattingEdits: languageId === vueLanguageId, // turned off for Razor and Handlebar
    documentRangeFormattingEdits: languageId === vueLanguageId // turned off for Razor and Handlebar
  };
}

const vueLanguageId = "vue";
const handlebarsLanguageId = "handlebars";
const razorLanguageId = "razor";

const vueDefaults = new LanguageServiceDefaultsImpl(
  vueLanguageId,
  vueOptionsDefault,
  getConfigurationDefault(vueLanguageId)
);
const handlebarDefaults = new LanguageServiceDefaultsImpl(
  handlebarsLanguageId,
  handlebarOptionsDefault,
  getConfigurationDefault(handlebarsLanguageId)
);
const razorDefaults = new LanguageServiceDefaultsImpl(
  razorLanguageId,
  razorOptionsDefault,
  getConfigurationDefault(razorLanguageId)
);

// Export API
function createAPI(): any {
  return {
    vueDefaults: vueDefaults
  };
}
(monaco.languages as any).vue = createAPI();

// --- Registration to monaco editor ---vue

function getMode(): Promise<typeof mode> {
  return import("./vueMode");
}

monaco.languages.onLanguage(vueLanguageId, () => {
  getMode().then(mode => {
    mode.setupMode(vueDefaults);
  });
});
monaco.languages.onLanguage(handlebarsLanguageId, () => {
  getMode().then(mode => mode.setupMode(handlebarDefaults));
});
monaco.languages.onLanguage(razorLanguageId, () => {
  getMode().then(mode => mode.setupMode(razorDefaults));
});
