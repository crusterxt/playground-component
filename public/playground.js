"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

  // src/v-hint.ts
  var Pos = CodeMirror.Pos;
  var baseModules = [
    "arrays",
    "benchmark",
    "bitfield",
    "cli",
    "clipboard",
    "compress",
    "context",
    "crypto",
    "darwin",
    "datatypes",
    "dl",
    "dlmalloc",
    "encoding",
    "eventbus",
    "flag",
    "fontstash",
    "gg",
    "gx",
    "hash",
    "io",
    "js",
    "json",
    "log",
    "math",
    "mssql",
    "mysql",
    "net",
    "orm",
    "os",
    "pg",
    "picoev",
    "picohttpparser",
    "rand",
    "readline",
    "regex",
    "runtime",
    "semver",
    "sokol",
    "sqlite",
    "stbi",
    "strconv",
    "strings",
    "sync",
    "szip",
    "term",
    "time",
    "toml",
    "v",
    "vweb",
    "x"
  ];
  var baseAttributes = [
    "params",
    "noinit",
    "required",
    "skip",
    "assert_continues",
    "unsafe",
    "manualfree",
    "heap",
    "nonnull",
    "primary",
    "inline",
    "direct_array_access",
    "live",
    "flag",
    "noinline",
    "noreturn",
    "typedef",
    "console",
    "sql",
    "table",
    "deprecated",
    "deprecated_after",
    "export",
    "callconv"
  ];
  var word = "[\\w_]+";
  var simpleAttributesRegexp = new RegExp(`^(${baseAttributes.join("|")})]$`);
  var keyValue = `(${word}: ${word})`;
  var singleKeyValueAttributesRegexp = new RegExp(`^${keyValue}]$`);
  var severalSingleKeyValueAttributesRegexp = new RegExp(`^(${baseAttributes.join("|")}(; ?)?){2,}]$`);
  var keyValueAttributesRegexp = new RegExp(`^((${keyValue})(; )?){2,}]$`);
  var ifAttributesRegexp = new RegExp(`^if ${word} \\??]`);
  function computeCompletionVariants(editor) {
    var _a;
    let context = [];
    const cur = editor.getCursor();
    let token = editor.getTokenAt(cur);
    const knownImports = /* @__PURE__ */ new Set();
    for (let i = 0; i < Math.min(editor.lineCount(), 10); i++) {
      const lineTokens2 = editor.getLineTokens(i).filter((tkn) => tkn.type != null);
      if (lineTokens2.length > 0 && lineTokens2[0].string === "import") {
        knownImports.add(lineTokens2[lineTokens2.length - 1].string);
      }
    }
    const lineTokens = editor.getLineTokens(cur.line);
    if (lineTokens.length > 0 && lineTokens[0].string === "import") {
      context.push(lineTokens[0]);
    }
    const len = token.string.length;
    const prevToken = editor.getTokenAt(Pos(cur.line, cur.ch - len));
    if (token.string === ".") {
      context.push(token);
    }
    if (prevToken.string === ".") {
      context.push(prevToken);
    }
    if (/\b(?:string|comment)\b/.test((_a = token.type) != null ? _a : ""))
      return null;
    if (!/^[\w$_]*$/.test(token.string)) {
      token = {
        start: cur.ch,
        end: cur.ch,
        string: "",
        state: token.state,
        type: token.string === "." ? "property" : null
      };
    } else if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }
    return {
      list: getCompletions(token, knownImports, context),
      from: Pos(cur.line, token.start),
      to: Pos(cur.line, token.end)
    };
  }
  __name(computeCompletionVariants, "computeCompletionVariants");
  function getCompletions(token, knownImports, context) {
    const variants = [];
    const tokenValue = token.string;
    function addCompletionVariant(variant) {
      const variantText = variant.text;
      if (!variantText.startsWith(tokenValue)) {
        return;
      }
      const alreadyContains = variants.find((f) => f.text === variantText);
      if (!alreadyContains) {
        variants.push(variant);
      }
    }
    __name(addCompletionVariant, "addCompletionVariant");
    if (context && context.length) {
      const lastToken = context.pop();
      if (lastToken !== void 0) {
        if (lastToken.type === "keyword" && lastToken.string === "import") {
          baseModules.forEach((text) => {
            addCompletionVariant({
              text,
              displayText: text,
              className: "completion-module"
            });
          });
          return variants;
        }
        if (lastToken.string === ".") {
          return [];
        }
      }
    }
    knownImports.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-module"
      });
    });
    keywords.forEach((text) => {
      addCompletionVariant({
        text: text + " ",
        displayText: text,
        className: "completion-keyword"
      });
    });
    pseudoKeywords.forEach((text) => {
      addCompletionVariant({
        text: text + " ",
        displayText: text,
        className: "completion-keyword"
      });
    });
    atoms.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-atom"
      });
    });
    builtinTypes.forEach((text) => {
      addCompletionVariant({
        text,
        displayText: text,
        className: "completion-type"
      });
    });
    return variants;
  }
  __name(getCompletions, "getCompletions");
  var hintHelper = /* @__PURE__ */ __name((editor) => computeCompletionVariants(editor), "hintHelper");
  CodeMirror.registerHelper("hint", "v", hintHelper);

  // src/v.ts
  var Context = class {
    constructor(indentation, column, type, align, prev) {
      this.indentation = indentation;
      this.column = column;
      this.type = type;
      this.align = align;
      this.prev = prev;
      /**
       * Whenever current position inside a string.
       */
      this.insideString = false;
      /**
       * Current quotation mark.
       * Valid only when insideString is true.
       */
      this.stringQuote = null;
      /**
       * Whenever next token expected to be an import name.
       * Used for highlighting import names in import statements.
       */
      this.expectedImportName = false;
      /**
       * Set of imports in current context.
       * Used for highlighting import names in code.
       */
      this.knownImports = /* @__PURE__ */ new Set();
    }
  };
  __name(Context, "Context");
  var keywords = /* @__PURE__ */ new Set([
    "as",
    "asm",
    "assert",
    "atomic",
    "break",
    "const",
    "continue",
    "defer",
    "else",
    "enum",
    "fn",
    "for",
    "go",
    "goto",
    "if",
    "import",
    "in",
    "interface",
    "is",
    "isreftype",
    "lock",
    "match",
    "module",
    "mut",
    "none",
    "or",
    "pub",
    "return",
    "rlock",
    "select",
    "shared",
    "sizeof",
    "static",
    "struct",
    "spawn",
    "type",
    "typeof",
    "union",
    "unsafe",
    "volatile",
    "__global",
    "__offsetof"
  ]);
  var pseudoKeywords = /* @__PURE__ */ new Set([
    "sql",
    "chan",
    "thread"
  ]);
  var atoms = /* @__PURE__ */ new Set([
    "true",
    "false",
    "nil",
    "print",
    "println",
    "exit",
    "panic",
    "error",
    "dump"
  ]);
  var builtinTypes = /* @__PURE__ */ new Set([
    "bool",
    "string",
    "i8",
    "i16",
    "int",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "rune",
    "f32",
    "f64",
    "isize",
    "usize",
    "voidptr",
    "any"
  ]);
  CodeMirror.defineMode("v", (config) => {
    var _a;
    const indentUnit = (_a = config.indentUnit) != null ? _a : 0;
    const isOperatorChar = /[+\-*&^%:=<>!?|\/]/;
    let curPunc = null;
    function eatIdentifier(stream) {
      stream.eatWhile(/[\w$_\xa1-\uffff]/);
      return stream.current();
    }
    __name(eatIdentifier, "eatIdentifier");
    function tokenBase(stream, state) {
      const ch = stream.next();
      if (ch === null) {
        return null;
      }
      if (state.context.insideString && ch === "}") {
        stream.eat("}");
        state.tokenize = tokenString(state.context.stringQuote);
        return "end-interpolation";
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (ch === ".") {
        if (!stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)) {
          return "operator";
        }
      }
      if (ch === "[") {
        if (stream.match(simpleAttributesRegexp)) {
          return "attribute";
        }
        if (stream.match(singleKeyValueAttributesRegexp)) {
          return "attribute";
        }
        if (stream.match(severalSingleKeyValueAttributesRegexp)) {
          return "attribute";
        }
        if (stream.match(keyValueAttributesRegexp)) {
          return "attribute";
        }
        if (stream.match(ifAttributesRegexp)) {
          return "attribute";
        }
      }
      if (/[\d.]/.test(ch)) {
        if (ch === "0") {
          stream.match(/^[xX][0-9a-fA-F_]+/) || stream.match(/^o[0-7_]+/) || stream.match(/^b[0-1_]+/);
        } else {
          stream.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/);
        }
        return "number";
      }
      if (/[\[\]{}(),;:.]/.test(ch)) {
        curPunc = ch;
        return null;
      }
      if (ch === "/") {
        if (stream.eat("*")) {
          state.tokenize = tokenComment;
          return tokenComment(stream, state);
        }
        if (stream.eat("/")) {
          stream.skipToEnd();
          return "comment";
        }
      }
      if (isOperatorChar.test(ch)) {
        stream.eatWhile(isOperatorChar);
        return "operator";
      }
      if (ch === "@") {
        eatIdentifier(stream);
        return "at-identifier";
      }
      if (ch === "$") {
        const ident = eatIdentifier(stream).slice(1);
        if (keywords.has(ident)) {
          return "keyword";
        }
        return "compile-time-identifier";
      }
      stream.backUp(2);
      const wasDot = stream.next() === ".";
      stream.next();
      const cur = eatIdentifier(stream);
      if (cur === "import") {
        state.context.expectedImportName = true;
      }
      if (keywords.has(cur))
        return "keyword";
      if (pseudoKeywords.has(cur))
        return "keyword";
      if (atoms.has(cur))
        return "atom";
      if (builtinTypes.has(cur))
        return "builtin";
      if (cur.length > 0 && cur[0].toUpperCase() === cur[0]) {
        return "type";
      }
      const next = stream.peek();
      if (next === "(" || next === "<") {
        return "function";
      }
      if (next === "[") {
        stream.next();
        const after = stream.next();
        stream.backUp(2);
        if (after != null && after.match(/[A-Z]/i)) {
          return "function";
        }
      }
      if (wasDot) {
        return "property";
      }
      if (state.context.expectedImportName && stream.peek() != ".") {
        state.context.expectedImportName = false;
        if (state.context.knownImports === void 0) {
          state.context.knownImports = /* @__PURE__ */ new Set();
        }
        state.context.knownImports.add(cur);
        return "import-name";
      }
      if (state.context.knownImports.has(cur) && stream.peek() == ".") {
        return "import-name";
      }
      return "variable";
    }
    __name(tokenBase, "tokenBase");
    function tokenLongInterpolation(stream, state) {
      if (stream.match("}")) {
        state.tokenize = tokenString(state.context.stringQuote);
        return "end-interpolation";
      }
      state.tokenize = tokenBase;
      return state.tokenize(stream, state);
    }
    __name(tokenLongInterpolation, "tokenLongInterpolation");
    function tokenShortInterpolation(stream, state) {
      const ch = stream.next();
      if (ch === " ") {
        state.tokenize = tokenString(state.context.stringQuote);
        return state.tokenize(stream, state);
      }
      if (ch === ".") {
        return "operator";
      }
      const ident = eatIdentifier(stream);
      if (ident[0].toLowerCase() === ident[0].toUpperCase()) {
        state.tokenize = tokenString(state.context.stringQuote);
        return state.tokenize(stream, state);
      }
      const next = stream.next();
      stream.backUp(1);
      if (next === ".") {
        state.tokenize = tokenShortInterpolation;
      } else {
        state.tokenize = tokenString(state.context.stringQuote);
      }
      return "variable";
    }
    __name(tokenShortInterpolation, "tokenShortInterpolation");
    function tokenNextInterpolation(stream, state) {
      let next = stream.next();
      if (next === "$" && stream.eat("{")) {
        state.tokenize = tokenLongInterpolation;
        return "start-interpolation";
      }
      if (next === "$") {
        state.tokenize = tokenShortInterpolation;
        return "start-interpolation";
      }
      return "string";
    }
    __name(tokenNextInterpolation, "tokenNextInterpolation");
    function tokenString(quote) {
      return function(stream, state) {
        state.context.insideString = true;
        state.context.stringQuote = quote;
        let next = "";
        let escaped = false;
        let end = false;
        while ((next = stream.next()) != null) {
          if (next === quote && !escaped) {
            end = true;
            break;
          }
          if (next === "$" && !escaped && stream.eat("{")) {
            state.tokenize = tokenNextInterpolation;
            stream.backUp(2);
            return "string";
          }
          if (next === "$" && !escaped) {
            state.tokenize = tokenNextInterpolation;
            stream.backUp(1);
            return "string";
          }
          escaped = !escaped && next === "\\";
        }
        if (end || escaped) {
          state.tokenize = tokenBase;
        }
        state.context.insideString = false;
        state.context.stringQuote = null;
        return "string";
      };
    }
    __name(tokenString, "tokenString");
    function tokenComment(stream, state) {
      let maybeEnd = false;
      let ch;
      while (ch = stream.next()) {
        if (ch === "/" && maybeEnd) {
          state.tokenize = tokenBase;
          break;
        }
        maybeEnd = ch === "*";
      }
      return "comment";
    }
    __name(tokenComment, "tokenComment");
    function pushContext(state, column, type) {
      return state.context = new Context(state.indention, column, type, null, state.context);
    }
    __name(pushContext, "pushContext");
    function popContext(state) {
      if (!state.context.prev)
        return;
      const t = state.context.type;
      if (t === ")" || t === "]" || t === "}")
        state.indention = state.context.indentation;
      state.context = state.context.prev;
      return state.context;
    }
    __name(popContext, "popContext");
    return {
      startState: function() {
        return {
          tokenize: null,
          context: new Context(0, 0, "top", false),
          indention: 0,
          startOfLine: true
        };
      },
      token: function(stream, state) {
        const ctx = state.context;
        if (stream.sol()) {
          if (ctx.align == null) {
            ctx.align = false;
          }
          state.indention = stream.indentation();
          state.startOfLine = true;
        }
        if (stream.eatSpace()) {
          return null;
        }
        curPunc = null;
        const style = (state.tokenize || tokenBase)(stream, state);
        if (style === "comment") {
          return style;
        }
        if (ctx.align == null) {
          ctx.align = true;
        }
        if (curPunc === "{")
          pushContext(state, stream.column(), "}");
        else if (curPunc === "[")
          pushContext(state, stream.column(), "]");
        else if (curPunc === "(")
          pushContext(state, stream.column(), ")");
        else if (curPunc === "}" && ctx.type === "}")
          popContext(state);
        else if (curPunc === ctx.type)
          popContext(state);
        state.startOfLine = false;
        return style;
      },
      indent: function(state, textAfter) {
        if (state.tokenize !== tokenBase && state.tokenize != null) {
          return 0;
        }
        if (state.context.type == "top") {
          return 0;
        }
        const ctx = state.context;
        const firstChar = textAfter.charAt(0);
        const closing = firstChar === ctx.type;
        if (ctx.align) {
          return ctx.column + (closing ? 0 : 1);
        }
        return ctx.indentation + (closing ? 0 : indentUnit);
      },
      // @ts-ignore
      electricChars: "{}):",
      // @ts-ignore
      closeBrackets: "()[]{}''\"\"``",
      fold: "brace",
      blockCommentStart: "/*",
      blockCommentEnd: "*/",
      lineComment: "//"
    };
  });
  CodeMirror.defineMIME("text/x-v", "v");

  // src/Repositories/LocalCodeRepository.ts
  var _LocalCodeRepository = class {
    saveCode(code) {
      window.localStorage.setItem(_LocalCodeRepository.LOCAL_STORAGE_KEY, code);
    }
    getCode(onReady) {
      const localCode = window.localStorage.getItem(_LocalCodeRepository.LOCAL_STORAGE_KEY);
      if (localCode === null || localCode === void 0) {
        onReady(_LocalCodeRepository.WELCOME_CODE);
        return;
      }
      onReady(localCode);
    }
  };
  var LocalCodeRepository = _LocalCodeRepository;
  __name(LocalCodeRepository, "LocalCodeRepository");
  LocalCodeRepository.LOCAL_STORAGE_KEY = "code";
  // language=V
  LocalCodeRepository.WELCOME_CODE = `
// Welcome to the V Playground!
// Here you can edit, run, and share V code.
// Let's start with a simple "Hello, Playground!" example:
println('Hello, Playground!')

// To run the code, click the "Run" button or just press Ctrl + R.
// To format the code, click the "Format" button or just press Ctrl + L.
// See all shortcuts in the "Help" in the bottom right corner.

// More examples are available in right dropdown list.
// You can find Help for shortcuts in the bottom right corner or just press Ctrl + I.
// See also change theme button in the top right corner. 
// If you want to learn more about V, visit https://vlang.io
// Join us on Discord: https://discord.gg/vlang
// Enjoy!
`.trimStart();

  // src/Repositories/SharedCodeRepository.ts
  var SharedCodeRepository = class {
    constructor(hash) {
      this.hash = hash;
    }
    saveCode(_) {
    }
    getCode(onReady) {
      return this.getSharedCode(onReady);
    }
    getSharedCode(onReady) {
      const data = new FormData();
      data.append("hash", this.hash);
      fetch("/query", {
        method: "post",
        body: data
      }).then((resp) => resp.text()).then((data2) => {
        onReady(data2);
      }).catch((err) => {
        console.log(err);
      });
    }
  };
  __name(SharedCodeRepository, "SharedCodeRepository");
  SharedCodeRepository.QUERY_PARAM_NAME = "query";
  SharedCodeRepository.CODE_NOT_FOUND = "Not found.";

  // src/Repositories/TextCodeRepository.ts
  var TextCodeRepository = class {
    constructor(text) {
      this.text = text;
    }
    saveCode(_) {
    }
    getCode(onReady) {
      onReady(this.text);
    }
  };
  __name(TextCodeRepository, "TextCodeRepository");

  // src/Terminal/Terminal.ts
  var Terminal = class {
    constructor(element) {
      this.onClose = null;
      this.onWrite = null;
      this.filters = [];
      this.element = element;
    }
    registerCloseHandler(handler) {
      this.onClose = handler;
    }
    registerWriteHandler(handler) {
      this.onWrite = handler;
    }
    registerFilter(filter) {
      this.filters.push(filter);
    }
    write(text) {
      const lines = text.split("\n");
      const outputElement = this.getTerminalOutputElement();
      const filteredLines = lines.filter((line) => this.filters.every((filter) => filter(line)));
      const newText = filteredLines.join("\n");
      outputElement.innerHTML += newText + "\n";
      if (this.onWrite !== null) {
        this.onWrite(text);
      }
    }
    writeTestPassed() {
      const testPassedElement = `
<span class="test-passed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#38a13b"/>
        <path d="M5.06188 8.93582L8.00653 10.9566L11.4065 5.35109" stroke="#38a13b"/>
    </svg>

    <span>Tests passed</span>
</span>
`;
      const outputElement = this.getTerminalOutputElement();
      outputElement.innerHTML += testPassedElement + "\n";
      if (this.onWrite !== null) {
        this.onWrite("");
      }
    }
    writeTestFailed() {
      const testFailedElement = `
<span class="test-failed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#AF5050"/>
        <path d="M9.05936 4.27274L8.97413 10.5455H7.9855L7.90027 4.27274H9.05936ZM8.47981 13.0682C8.26959 13.0682 8.08919 12.9929 7.93862 12.8423C7.78805 12.6918 7.71277 12.5114 7.71277 12.3011C7.71277 12.0909 7.78805 11.9105 7.93862 11.76C8.08919 11.6094 8.26959 11.5341 8.47981 11.5341C8.69004 11.5341 8.87044 11.6094 9.02101 11.76C9.17158 11.9105 9.24686 12.0909 9.24686 12.3011C9.24686 12.4403 9.21135 12.5682 9.14033 12.6847C9.07214 12.8011 8.97981 12.8949 8.86334 12.9659C8.7497 13.0341 8.62186 13.0682 8.47981 13.0682Z" fill="#AF5050"/>
    </svg>

    <span>Tests failed</span>
</span>
`;
      const outputElement = this.getTerminalOutputElement();
      outputElement.innerHTML += testFailedElement + "\n";
      if (this.onWrite !== null) {
        this.onWrite("");
      }
    }
    clear() {
      this.getTerminalOutputElement().innerHTML = "";
    }
    mount() {
      const closeButton = this.element.querySelector(".js-terminal__close-button");
      if (closeButton === null || closeButton === void 0 || this.onClose === null) {
        return;
      }
      closeButton.addEventListener("click", this.onClose);
    }
    getTerminalOutputElement() {
      return this.element.querySelector(".js-terminal__output");
    }
  };
  __name(Terminal, "Terminal");

  // src/Snippet.ts
  var Snippet = class {
    constructor(code) {
      this.removedIndent = 0;
      this.state = 0 /* Folded */;
      this.wasUnfolded = false;
      this.foldedCode = null;
      this.unfoldedCode = null;
      this.currentCodeObtainer = /* @__PURE__ */ __name(() => "", "currentCodeObtainer");
      const normalizedCode = this.normalizeCode(code);
      this.range = this.getSnippetRange(normalizedCode);
      this.code = this.removeRangeMarkers(normalizedCode);
    }
    registerCurrentCodeObtainer(obtainer) {
      this.currentCodeObtainer = obtainer;
    }
    noFolding() {
      return this.range.start == -1;
    }
    getCode() {
      if (this.noFolding()) {
        return this.code;
      }
      if (this.state == 1 /* Unfolded */) {
        return this.getUnfoldedCode();
      }
      return this.getFoldedCode();
    }
    getRunnableCode() {
      if (this.state == 1 /* Unfolded */) {
        return this.currentCodeObtainer();
      }
      return this.getUnfoldedCodeWithoutCaching();
    }
    getUnfoldedCode() {
      if (this.unfoldedCode != null) {
        return this.unfoldedCode;
      }
      return this.getUnfoldedCodeWithoutCaching();
    }
    getUnfoldedCodeWithoutCaching() {
      if (this.noFolding()) {
        return this.currentCodeObtainer();
      }
      const visibleCode = this.currentCodeObtainer();
      const indent = " ".repeat(this.removedIndent);
      const indented = visibleCode.split("\n").map((line) => indent + line).join("\n");
      const lines = this.code.split("\n");
      const prefix = lines.slice(0, this.range.start).join("\n");
      const suffix = lines.slice(lines.length - this.range.startFromEnd).join("\n");
      const code = prefix + "\n" + indented + "\n" + suffix;
      this.unfoldedCode = code;
      return code;
    }
    getFoldedCode() {
      if (this.noFolding()) {
        return this.currentCodeObtainer();
      }
      if (this.foldedCode != null) {
        return this.foldedCode;
      }
      if (this.wasUnfolded) {
        this.code = this.currentCodeObtainer();
      }
      const lines = this.code.split("\n");
      const rawFoldedCode = lines.slice(this.range.start, lines.length - this.range.startFromEnd).join("\n");
      const code = this.normalizeIndents(rawFoldedCode);
      this.foldedCode = code;
      return code;
    }
    toggle() {
      if (this.state == 0 /* Folded */) {
        this.state = 1 /* Unfolded */;
        this.wasUnfolded = true;
        this.foldedCode = null;
      } else {
        this.state = 0 /* Folded */;
        this.unfoldedCode = null;
      }
    }
    getSnippetRange(code) {
      const lines = code.split("\n");
      const startLine = lines.findIndex((line) => line.trim().startsWith("//code::start"));
      const endLine = lines.findIndex((line) => line.trim().startsWith("//code::end"));
      if (startLine == -1 || endLine == -1) {
        return { start: -1, startFromEnd: 0 };
      }
      return {
        start: startLine,
        startFromEnd: lines.length - endLine - 1
      };
    }
    // code:
    // ```
    //
    //     fn foo() {
    //       println!("Hello, world!");
    //     }
    //
    // ```
    // output:
    // ```
    // fn foo() {
    //   println!("Hello, world!");
    // }
    // ```
    normalizeCode(code) {
      const trimmed = this.normalizeIndents(code).split("\n");
      if (trimmed.length > 1) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if (first.trim().length == 0) {
          trimmed.shift();
        }
        if (last.trim().length == 0) {
          trimmed.pop();
        }
      }
      return trimmed.join("\n");
    }
    normalizeIndents(code) {
      const lines = code.split("\n");
      const indents = lines.map((line) => this.lineIndent(line));
      const minIndent = Math.min(...indents);
      const trimmed = lines.map((line) => line.substring(minIndent));
      this.removedIndent = minIndent;
      return trimmed.join("\n");
    }
    lineIndent(line) {
      for (let i = 0; i < line.length; i++) {
        if (line[i] !== " " && line[i] != "	") {
          const substring = line.substring(0, i).replaceAll("	", "    ");
          return substring.length;
        }
      }
      return Number.MAX_VALUE;
    }
    removeRangeMarkers(code) {
      const lines = code.split("\n");
      const filtered = lines.filter((line) => !line.trim().startsWith("//code::"));
      return filtered.join("\n");
    }
  };
  __name(Snippet, "Snippet");

  // src/Editor/Editor.ts
  var Editor = class {
    constructor(wrapper, repository, readonly, showLineNumbers) {
      this.snippet = null;
      const editorConfig = {
        mode: "v",
        lineNumbers: showLineNumbers,
        // @ts-ignore
        matchBrackets: true,
        extraKeys: {
          "Ctrl-Space": "autocomplete",
          "Ctrl-/": "toggleComment"
        },
        indentWithTabs: true,
        indentUnit: 4,
        autoCloseBrackets: true,
        showHint: true,
        lint: {
          async: true,
          lintOnChange: true,
          delay: 20
        },
        toggleLineComment: {
          indent: true,
          padding: " "
        },
        theme: "dark",
        readOnly: readonly ? "nocursor" : false,
        // @ts-ignore
        scrollbarStyle: "overlay"
      };
      this.wrapperElement = wrapper;
      const place = wrapper.querySelector("textarea");
      this.editor = CodeMirror.fromTextArea(place, editorConfig);
      this.repository = repository;
      this.repository.getCode((code) => {
        if (code === SharedCodeRepository.CODE_NOT_FOUND) {
          this.terminal.write("Code for shared link not found.");
          return;
        }
        this.snippet = new Snippet(code);
        this.snippet.registerCurrentCodeObtainer(() => this.editor.getValue());
        this.setCode(this.snippet.getCode());
      });
      const terminalElement = wrapper.querySelector(".js-terminal");
      if (terminalElement === null || terminalElement === void 0) {
        throw new Error("Terminal not found, please check that terminal inside editor element");
      }
      this.terminal = new Terminal(terminalElement);
      this.terminal.registerCloseHandler(() => {
        this.closeTerminal();
        this.editor.refresh();
      });
      this.terminal.registerWriteHandler((_) => {
        this.openTerminal();
      });
      this.terminal.registerFilter((line) => {
        return !line.trim().startsWith("Failed command");
      });
      this.terminal.mount();
      this.closeTerminal();
    }
    setEditorFontSize(size) {
      const cm = this.wrapperElement.querySelector(".CodeMirror");
      let normalizedSize = size;
      if (normalizedSize.endsWith("px")) {
        normalizedSize = normalizedSize.slice(0, -2);
      }
      cm.style.fontSize = normalizedSize + "px";
      this.refresh();
    }
    setCode(code, preserveCursor = false) {
      const cursor = this.editor.getCursor();
      this.editor.setValue(code);
      this.repository.saveCode(code);
      if (preserveCursor) {
        this.editor.setCursor(cursor);
      }
    }
    getCode() {
      var _a;
      return (_a = this.snippet) == null ? void 0 : _a.getCode();
    }
    saveCode() {
      const isSharedCodeRepository = this.repository instanceof SharedCodeRepository;
      if (isSharedCodeRepository) {
        this.repository = new LocalCodeRepository();
      }
      this.repository.saveCode(this.getCode());
    }
    copyCode() {
      const code = this.getCode();
      navigator.clipboard.writeText(code).then((r) => {
        this.terminal.write("Code copied to clipboard.");
      }).catch((e) => {
        this.terminal.write("Failed to copy code to clipboard.");
      });
    }
    toggleSnippet() {
      if (this.snippet === null) {
        return;
      }
      this.snippet.toggle();
      this.setCode(this.snippet.getCode());
      if (this.snippet.state == 1 /* Unfolded */) {
        const code = this.snippet.getCode();
        const countLines = code.split("\n").length;
        const startRange = this.snippet.range.start;
        const endRange = countLines - this.snippet.range.startFromEnd;
        this.editor.markText(
          { line: 0, ch: 0 },
          { line: startRange, ch: 0 },
          {
            readOnly: true,
            inclusiveLeft: true,
            inclusiveRight: false
          }
        );
        this.editor.markText(
          { line: endRange, ch: 0 },
          { line: countLines, ch: 0 },
          {
            readOnly: true,
            inclusiveLeft: true,
            inclusiveRight: false
          }
        );
        this.editor.operation(() => {
          for (let i = 0; i < startRange; i++) {
            this.editor.addLineClass(i, "background", "unmodifiable-line");
          }
          for (let i = endRange; i < countLines; i++) {
            this.editor.addLineClass(i, "background", "unmodifiable-line");
          }
        });
      }
      this.refresh();
    }
    openTerminal() {
      this.wrapperElement.classList.remove("closed-terminal");
    }
    closeTerminal() {
      this.wrapperElement.classList.add("closed-terminal");
    }
    setTheme(theme) {
      var _a;
      this.editor.setOption("theme", theme.name());
      (_a = this.wrapperElement) == null ? void 0 : _a.setAttribute("data-theme", theme.name());
    }
    showCompletion() {
      this.editor.execCommand("autocomplete");
    }
    refresh() {
      this.editor.refresh();
    }
  };
  __name(Editor, "Editor");

  // src/CodeRunner/CodeRunner.ts
  var CodeRunner = class {
    static runCode(code) {
      const data = new FormData();
      data.append("code", code);
      const url = this.buildUrl("run");
      return fetch(url, {
        method: "post",
        body: data
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run code");
        }
        return resp;
      }).then((resp) => resp.json()).then((data2) => JSON.parse(data2));
    }
    static runTest(code) {
      const data = new FormData();
      data.append("code", code);
      const url = this.buildUrl("run_test");
      return fetch(url, {
        method: "post",
        body: data
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run test");
        }
        return resp;
      }).then((resp) => resp.json()).then((data2) => JSON.parse(data2));
    }
    static buildUrl(path) {
      if (this.server !== null && this.server !== void 0) {
        const server = this.server.endsWith("/") ? this.server.slice(0, -1) : this.server;
        return `${server}/${path}`;
      }
      return `/${path}`;
    }
  };
  __name(CodeRunner, "CodeRunner");

  // src/template.ts
  var expandSnippetIcons = `
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8.5" y1="2" x2="8.5" y2="15" stroke="black"/>
    <line x1="15" y1="8.5" x2="2" y2="8.5" stroke="black"/>
</svg>
`;
  var collapseSnippetIcons = `
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="3.90385" y1="3.9038" x2="13.0962" y2="13.0962" stroke="black"/>
    <line x1="13.0962" y1="3.90382" x2="3.90384" y2="13.0962" stroke="black"/>
</svg>
`;
  var template = `<div class="js-playground v-playground">
  <div class="playground__wrapper">
    <div class="playground__editor">
      <div class="js-playground__action-show-all show-all-button">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="8.5" y1="2" x2="8.5" y2="15" stroke="black"/>
              <line x1="15" y1="8.5" x2="2" y2="8.5" stroke="black"/>
          </svg>
      </div>
      <div class="js-playground__action-run run-style-button">
        <div class="icon">
          <svg class="run-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_14_12)">
              <path d="M14.0548 8.75068L3.25542 14.9857C2.92209 15.1782 2.50542 14.9376 2.50542 14.5527L2.50542 2.08263C2.50542 1.69774 2.92208 1.45717 3.25542 1.64962L14.0548 7.88465C14.3881 8.0771 14.3881 8.55823 14.0548 8.75068Z"
                    fill="#659360" fill-opacity="0.2" stroke="#659360"/>
            </g>
            <defs>
              <clipPath id="clip0_14_12">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      
      <div class="js-playground__action-copy copy-button bottom">
         <svg xmlns='http://www.w3.org/2000/svg' 
              fill='none' 
              height='20' 
              width='20' 
              stroke='rgba(128,128,128,1)' 
              stroke-width='2' 
              viewBox='0 0 24 24'>
              <path stroke-linecap='round' stroke-linejoin='round' d='M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2'/>
         </svg>
      </div>
      
      <!-- Place for CodeMirror editor -->
      <textarea></textarea>
    </div>
    
    <div class="js-terminal playground__terminal">
      <button class="js-terminal__close-button terminal__close-button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect class="close-terminal-button-rect" x="1" y="8" width="13" height="1"/>
        </svg>
      </button>
      <pre class="js-terminal__output terminal__output"></pre>
    </div>
  </div>
  
  <div class="js-playground__footer playground__footer">
    <span class="js-playground-link playground-link">Playground \u2192</span>
  </div>
</div>
`;

  // src/themes/Dark.ts
  var Dark = class {
    name() {
      return "dark";
    }
  };
  __name(Dark, "Dark");

  // src/themes/Light.ts
  var Light = class {
    name() {
      return "light";
    }
  };
  __name(Light, "Light");

  // src/ThemeManager/ThemeManager.ts
  var ThemeManager = class {
    constructor(predefinedTheme = null) {
      this.currentTheme = null;
      this.onChange = [];
      this.changeThemeButton = null;
      this.predefinedTheme = null;
      this.predefinedTheme = predefinedTheme;
      this.changeThemeButton = document.querySelector(".js-playground__action-change-theme");
    }
    registerOnChange(callback) {
      this.onChange.push(callback);
    }
    loadTheme() {
      if (this.predefinedTheme !== null && this.predefinedTheme !== void 0) {
        this.turnTheme(this.predefinedTheme);
        return;
      }
      this.turnTheme(new Dark());
    }
    turnTheme(theme) {
      this.currentTheme = theme;
      this.onChange.forEach((callback) => callback(theme));
    }
    turnDarkTheme() {
      this.turnTheme(new Dark());
    }
    turnLightTheme() {
      this.turnTheme(new Light());
    }
    toggleTheme() {
      if (!this.currentTheme) {
        return;
      }
      if (this.currentTheme.name() === "light") {
        this.turnDarkTheme();
      } else {
        this.turnLightTheme();
      }
    }
    static findTheme(name) {
      let foundThemes = this.themes.filter((theme2) => theme2.name() === name);
      const theme = foundThemes[0];
      if (theme === void 0) {
        throw new Error(`Theme ${name} not found`);
      }
      return theme;
    }
  };
  __name(ThemeManager, "ThemeManager");
  ThemeManager.themes = [new Dark(), new Light()];

  // src/utils.ts
  var toBool = /* @__PURE__ */ __name((value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    return value === "true";
  }, "toBool");
  var definedProps = /* @__PURE__ */ __name((obj) => Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => v !== void 0)
  ), "definedProps");

  // src/Playground.ts
  var Playground = class {
    constructor(config) {
      this.onSuccessfulRun = [];
      this.onFailedRun = [];
      var _a, _b, _c, _d, _e, _f;
      if (config.selector) {
        this.playgroundElement = document.querySelector(config.selector);
      } else if (config.element) {
        this.playgroundElement = config.element;
      } else {
        throw new Error("No selector or element provided");
      }
      const code = (_b = (_a = config.code) != null ? _a : this.playgroundElement.textContent) != null ? _b : "";
      this.mount(this.playgroundElement);
      this.runAsTests = config.configuration === "tests";
      this.repository = new TextCodeRepository(code);
      const editorElement = this.playgroundElement.querySelector(".v-playground");
      this.editor = new Editor(editorElement, this.repository, (_c = config.highlightOnly) != null ? _c : false, (_d = config.showLineNumbers) != null ? _d : true);
      if (config.fontSize) {
        this.editor.setEditorFontSize(config.fontSize);
      }
      const theme = (_e = config.theme) != null ? _e : "light";
      this.themeManager = new ThemeManager(ThemeManager.findTheme(theme));
      this.themeManager.registerOnChange((theme2) => {
        this.setThemeImpl(theme2);
      });
      this.themeManager.loadTheme();
      this.registerRunAction(config.customRunButton, () => {
        this.run();
      });
      this.registerAction("copy" /* COPY */, () => {
        this.editor.copyCode();
      });
      this.registerAction("show-all", () => {
        var _a2;
        this.editor.toggleSnippet();
        const showAllActionButton = this.getActionElement("show-all");
        if (((_a2 = this.editor.snippet) == null ? void 0 : _a2.state) === 0 /* Folded */) {
          showAllActionButton.innerHTML = expandSnippetIcons;
        } else {
          showAllActionButton.innerHTML = collapseSnippetIcons;
        }
      });
      this.setupPlaygroundLink();
      if (config.showFoldedCodeButton === false || ((_f = this.editor.snippet) == null ? void 0 : _f.noFolding())) {
        const showAllActionButton = this.getActionElement("show-all");
        showAllActionButton.style.display = "none";
      }
      const footer = this.playgroundElement.querySelector(".js-playground__footer");
      if (config.showFooter === false) {
        footer.style.display = "none";
        editorElement.classList.add("no-footer");
      }
      if (config.highlightOnly === true) {
        const runActionButton = this.getActionElement("run" /* RUN */);
        runActionButton.style.display = "none";
        const copyActionButton = this.getActionElement("copy" /* COPY */);
        if (config.showCopyButton === true) {
          copyActionButton.style.display = "block";
          copyActionButton.classList.remove("bottom");
        } else {
          copyActionButton.style.display = "none";
        }
        footer.style.display = "none";
      }
      if (config.server !== void 0) {
        CodeRunner.server = config.server;
      }
    }
    setTheme(name) {
      this.setThemeImpl(ThemeManager.findTheme(name));
    }
    setThemeImpl(theme) {
      this.editor.setTheme(theme);
    }
    setupPlaygroundLink() {
      const playgroundLink = this.playgroundElement.querySelector(".js-playground-link");
      playgroundLink.addEventListener("click", () => {
        var _a;
        const baseUrl = "https://play.vlang.foundation/?base64=";
        const code = (_a = this.editor.snippet) == null ? void 0 : _a.getRunnableCode();
        const base64Code = btoa(code);
        const url = baseUrl + base64Code;
        window.open(url, "_blank");
      });
    }
    static create(element, config) {
      const defaultConfiguration = this.getDefaultConfiguration();
      const configuration = this.getConfigurationFromElement(element);
      return new Playground(__spreadProps(__spreadValues(__spreadValues(__spreadValues({}, defaultConfiguration), definedProps(config != null ? config : {})), definedProps(configuration)), { element }));
    }
    static getDefaultConfiguration() {
      return {
        configuration: "run" /* RUN */,
        theme: "light",
        fontSize: "12px",
        showLineNumbers: true,
        highlightOnly: false,
        showFoldedCodeButton: true,
        showFooter: true,
        showCopyButton: true,
        server: "https://play.vlang.foundation/"
      };
    }
    static getConfigurationFromElement(element) {
      var _a, _b, _c, _d, _e;
      const configuration = (_a = element == null ? void 0 : element.getAttribute("data-configuration")) != null ? _a : void 0;
      const theme = (_b = element == null ? void 0 : element.getAttribute("data-theme")) != null ? _b : void 0;
      const fontSize = (_c = element.getAttribute("data-font-size")) != null ? _c : void 0;
      const showLineNumbers = toBool(element == null ? void 0 : element.getAttribute("data-show-line-numbers"));
      const highlightOnly = toBool(element.getAttribute("data-highlight-only"));
      const showFoldedCodeButton = toBool(element == null ? void 0 : element.getAttribute("data-show-folded-code-button"));
      const showFooter = toBool(element.getAttribute("data-show-footer"));
      const showCopyButton = toBool(element.getAttribute("data-show-copy-button"));
      const customRunButton = (_d = element == null ? void 0 : element.getAttribute("data-custom-run-button")) != null ? _d : void 0;
      const server = (_e = element == null ? void 0 : element.getAttribute("data-server")) != null ? _e : void 0;
      return {
        configuration,
        theme,
        fontSize,
        showLineNumbers,
        highlightOnly,
        showFoldedCodeButton,
        showFooter,
        customRunButton,
        showCopyButton,
        server
      };
    }
    registerOnSuccessfulRun(callback) {
      this.onSuccessfulRun.push(callback);
    }
    registerOnFailedRun(callback) {
      this.onFailedRun.push(callback);
    }
    registerRunAction(customSelector, callback) {
      if (customSelector) {
        const customButton = document.querySelector(customSelector);
        if (customButton === void 0) {
          throw new Error(`Can't find custom button with selector ${customSelector}`);
        }
        customButton.addEventListener("click", callback);
        const actionElement = this.getActionElement("run" /* RUN */);
        actionElement.style.display = "none";
        return;
      }
      this.registerAction("run" /* RUN */, callback);
    }
    mount(element) {
      if (element === null) {
        return;
      }
      element.innerHTML = template;
    }
    /**
     * Register a handler for the default or new action.
     * @param name - The name of the action.
     * @param callback - The callback to be called when the action is triggered.
     */
    registerAction(name, callback) {
      const actionButton = this.playgroundElement.querySelector(`.js-playground__action-${name}`);
      if (actionButton === void 0) {
        throw new Error(`Can't find action button with class js-playground__action-${name}`);
      }
      actionButton.addEventListener("click", callback);
    }
    getActionElement(name) {
      return this.playgroundElement.querySelector(`.js-playground__action-${name}`);
    }
    run() {
      if (this.runAsTests) {
        this.runTests();
        return;
      }
      this.runCode();
    }
    runCode() {
      var _a;
      this.clearTerminal();
      this.writeToTerminal("Running code...");
      const code = (_a = this.editor.snippet) == null ? void 0 : _a.getRunnableCode();
      CodeRunner.runCode(code).then((result) => {
        this.clearTerminal();
        this.writeToTerminal(result.output);
        this.onRunFinished(result);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run code. Please try again.");
        this.onFailedRun.forEach((callback) => callback());
      });
    }
    runTests() {
      var _a;
      this.clearTerminal();
      this.writeToTerminal("Running tests...");
      const code = (_a = this.editor.snippet) == null ? void 0 : _a.getRunnableCode();
      CodeRunner.runTest(code).then((result) => {
        this.clearTerminal();
        if (result.ok) {
          this.editor.terminal.writeTestPassed();
        } else {
          this.editor.terminal.writeTestFailed();
          const output = result.output.split("\n").slice(2, -6).join("\n");
          this.writeToTerminal(output);
        }
        this.onRunFinished(result);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run tests. Please try again.");
        this.onFailedRun.forEach((callback) => callback());
      });
    }
    onRunFinished(result) {
      if (result.ok) {
        this.onSuccessfulRun.forEach((callback) => callback());
      } else {
        this.onFailedRun.forEach((callback) => callback());
      }
    }
    setupShortcuts() {
      this.editor.editor.on("keypress", (cm, event) => {
        if (!cm.state.completionActive && // Enables keyboard navigation in autocomplete list
        event.key.length === 1 && event.key.match(/[a-z0-9]/i)) {
          this.editor.showCompletion();
        }
      });
      document.addEventListener("keydown", (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
          this.editor.saveCode();
          ev.preventDefault();
        } else {
          this.editor.saveCode();
        }
      });
    }
    clearTerminal() {
      this.editor.terminal.clear();
    }
    writeToTerminal(text) {
      this.editor.terminal.write(text);
    }
    setEditorFontSize(size) {
      this.editor.setEditorFontSize(size);
    }
  };
  __name(Playground, "Playground");

  // src/main.ts
  var currentScript = document.currentScript;
  var selector = currentScript == null ? void 0 : currentScript.getAttribute("data-selector");
  var scriptConfiguration = Playground.getConfigurationFromElement(currentScript);
  if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll(selector).forEach((element) => {
        Playground.create(element, scriptConfiguration);
      });
    });
  }
  window.Playground = Playground;
})();
//# sourceMappingURL=playground.js.map
