"use strict";
(() => {
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
    const isOperatorChar = /[+\-*&^%:=<>!|\/]/;
    let curPunc = null;
    function eatIdentifier(stream) {
      stream.eatWhile(/[\w$_\xa1-\uffff]/);
      return stream.current();
    }
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
      if (/[\d.]/.test(ch)) {
        if (ch === ".") {
          if (!stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)) {
            return "operator";
          }
        } else if (ch === "0") {
          stream.match(/^[xX][0-9a-fA-F]+/) || stream.match(/^0[0-7]+/);
        } else {
          stream.match(/^[0-9]*\.?[0-9]*([eE][\-+]?[0-9]+)?/);
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
      if (cur[0].toUpperCase() === cur[0]) {
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
    function tokenLongInterpolation(stream, state) {
      if (stream.match("}")) {
        state.tokenize = tokenString(state.context.stringQuote);
        return "end-interpolation";
      }
      state.tokenize = tokenBase;
      return state.tokenize(stream, state);
    }
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
    function pushContext(state, column, type) {
      return state.context = new Context(state.indention, column, type, null, state.context);
    }
    function popContext(state) {
      if (!state.context.prev)
        return;
      const t = state.context.type;
      if (t === ")" || t === "]" || t === "}")
        state.indention = state.context.indentation;
      state.context = state.context.prev;
      return state.context;
    }
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
  function getCompletions(token, knownImports, context) {
    const variants = [];
    const tokenValue = token.string;
    function addCompletionVariant(variant) {
      const variantText = variant.text;
      if (variantText.indexOf(tokenValue) === -1) {
        return;
      }
      const alreadyContains = variants.find((f) => f.text === variantText);
      if (!alreadyContains) {
        variants.push(variant);
      }
    }
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
  var hintHelper = (editor) => computeCompletionVariants(editor);
  CodeMirror.registerHelper("hint", "v", hintHelper);

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
    clear() {
      this.getTerminalOutputElement().innerHTML = "";
    }
    mount() {
      const closeButton = this.element.querySelector(".js-terminal__close-buttom");
      if (closeButton === null || closeButton === void 0 || this.onClose === null) {
        return;
      }
      closeButton.addEventListener("click", this.onClose);
    }
    getTerminalOutputElement() {
      return this.element.querySelector(".js-terminal__output");
    }
  };

  // src/Snippet.ts
  var Snippet = class {
    constructor(code) {
      this.state = 0 /* Folded */;
      const normalizedCode = this.normalizeCode(code);
      this.range = this.getSnippetRange(normalizedCode);
      const parts = this.separateCodeBySnippetRange(normalizedCode, this.range);
      this.original = this.removeRangeMarkers(normalizedCode);
      this.prefix = parts.prefix;
      this.foldedCode = this.normalizeCode(parts.code);
      this.suffix = parts.suffix;
    }
    noFolding() {
      return this.range.start == -1 && this.range.end == -1;
    }
    countLines() {
      return this.code().split("\n").length;
    }
    code() {
      if (this.state == 1 /* Unfolded */) {
        return this.original;
      }
      return this.foldedCode;
    }
    toggle() {
      if (this.state == 0 /* Folded */) {
        this.state = 1 /* Unfolded */;
      } else {
        this.state = 0 /* Folded */;
      }
    }
    getSnippetRange(code) {
      const lines = code.split("\n");
      const startLine = lines.findIndex((line) => line.trim().startsWith("//code::start"));
      const endLine = lines.findIndex((line) => line.trim().startsWith("//code::end"));
      if (startLine == -1 || endLine == -1) {
        return {
          start: -1,
          end: -1
        };
      }
      return {
        start: startLine + 1,
        end: endLine - 1
      };
    }
    separateCodeBySnippetRange(code, range) {
      if (range.start == -1 && range.end == -1) {
        return {
          prefix: "",
          code,
          suffix: ""
        };
      }
      const lines = code.split("\n");
      const prefix = lines.slice(0, range.start + 1).join("\n");
      const codeSnippet = lines.slice(range.start, range.end + 1).join("\n");
      const suffix = lines.slice(range.end + 3).join("\n");
      return {
        prefix,
        code: codeSnippet,
        suffix
      };
    }
    lineIndent(line) {
      for (let i = 0; i < line.length; i++) {
        if (line[i] !== " ") {
          return i;
        }
      }
      return Number.MAX_VALUE;
    }
    // code:
    // ```
    //     fn foo() {
    //       println!("Hello, world!");
    //     }
    // ```
    // output:
    // ```
    // fn foo() {
    //   println!("Hello, world!");
    // }
    // ```
    normalizeCode(code) {
      const lines = code.split("\n");
      const indents = lines.map((line) => this.lineIndent(line));
      const minIndent = Math.min(...indents);
      const trimmed = lines.map((line) => line.substring(minIndent));
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
    removeRangeMarkers(code) {
      const lines = code.split("\n");
      const filtered = lines.filter((line) => !line.trim().startsWith("//code::"));
      return filtered.join("\n");
    }
  };

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
        readOnly: readonly ? "nocursor" : false
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
        this.setCode(this.snippet.code());
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
      var _a, _b;
      return (_b = (_a = this.snippet) == null ? void 0 : _a.original) != null ? _b : "";
    }
    saveCode() {
      const isSharedCodeRepository = this.repository instanceof SharedCodeRepository;
      if (isSharedCodeRepository) {
        this.repository = new LocalCodeRepository();
      }
      this.repository.saveCode(this.getCode());
    }
    toggleSnippet() {
      if (this.snippet === null) {
        return;
      }
      this.snippet.toggle();
      this.setCode(this.snippet.code());
      if (this.snippet.state == 1 /* Unfolded */) {
        this.editor.markText(
          { line: 0, ch: 0 },
          { line: this.snippet.range.start - 1, ch: 0 },
          {
            readOnly: true,
            inclusiveLeft: true,
            inclusiveRight: false
          }
        );
        this.editor.markText(
          { line: this.snippet.range.end, ch: 0 },
          { line: this.snippet.countLines(), ch: 0 },
          {
            readOnly: true,
            inclusiveLeft: true,
            inclusiveRight: false
          }
        );
        this.editor.operation(() => {
          for (let i = 0; i < this.snippet.range.start - 1; i++) {
            this.editor.addLineClass(i, "background", "unmodifiable-line");
          }
          for (let i = this.snippet.range.end; i < this.snippet.countLines(); i++) {
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
      this.editor.setOption("theme", theme.name());
    }
    showCompletion() {
      this.editor.execCommand("autocomplete");
    }
    refresh() {
      this.editor.refresh();
    }
  };

  // src/CodeRunner/CodeRunner.ts
  var RunCodeResult = class {
    constructor(output) {
      this.output = output;
    }
  };
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
        return resp.text();
      }).then((output) => new RunCodeResult(output));
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
        return resp.text();
      }).then((output) => new RunCodeResult(output));
    }
    static buildUrl(path) {
      if (this.server !== null && this.server !== void 0) {
        const server = this.server.endsWith("/") ? this.server.slice(0, -1) : this.server;
        return `${server}/${path}`;
      }
      return `/${path}`;
    }
  };

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
      
      <!-- Place for CodeMirror editor -->
      <textarea></textarea>
    </div>
    
    <div class="js-terminal playground__terminal">
      <div class="header">
        <button class="js-terminal__close-buttom terminal__close-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="close-terminal-button-rect" x="1" y="8" width="13" height="1"/>
          </svg>
        </button>
      </div>
      <pre class="js-terminal__output terminal__output"></pre>
    </div>
  </div>
  
  <div class="js-playground__footer playground__footer">
    <a href="#" class="js-playground-link playground-link">Playground \u2192</a>
    </div>
</div>
`;

  // src/themes/Dark.ts
  var Dark = class {
    name() {
      return "dark";
    }
  };

  // src/themes/Light.ts
  var Light = class {
    name() {
      return "light";
    }
  };

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
  ThemeManager.themes = [new Dark(), new Light()];

  // src/Playground.ts
  var Playground = class {
    constructor(config) {
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
      const theme = (_c = this.playgroundElement.getAttribute("data-theme")) != null ? _c : "dark";
      this.runAsTests = config.configuration === "tests";
      this.repository = new TextCodeRepository(code);
      const editorElement = this.playgroundElement.querySelector(".v-playground");
      this.editor = new Editor(editorElement, this.repository, (_d = config.highlightOnly) != null ? _d : false, (_e = config.showLineNumbers) != null ? _e : true);
      if (config.fontSize) {
        this.editor.setEditorFontSize(config.fontSize);
      }
      this.themeManager = new ThemeManager(ThemeManager.findTheme(theme));
      this.themeManager.registerOnChange((theme2) => {
        this.editor.setTheme(theme2);
        editorElement == null ? void 0 : editorElement.setAttribute("data-theme", theme2.name());
      });
      this.themeManager.loadTheme();
      this.registerRunAction(config.customRunButton, () => {
        this.run();
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
        footer.style.display = "none";
      }
      if (config.server !== void 0) {
        CodeRunner.server = config.server;
      }
    }
    static create(element, code) {
      var _a, _b, _c, _d, _e, _f;
      const configuration = (_a = element == null ? void 0 : element.getAttribute("data-configuration")) != null ? _a : "run";
      const fontSize = (_b = element.getAttribute("data-font-size")) != null ? _b : "12px";
      const showLineNumbers = (_c = element == null ? void 0 : element.getAttribute("data-show-line-numbers")) != null ? _c : "true";
      const highlightOnly = (_d = element.getAttribute("data-highlight-only")) != null ? _d : "false";
      const showFoldedCodeButton = (_e = element == null ? void 0 : element.getAttribute("data-show-folded-code-button")) != null ? _e : "true";
      const showFooter = (_f = element == null ? void 0 : element.getAttribute("data-show-footer")) != null ? _f : "true";
      const customRunButton = element == null ? void 0 : element.getAttribute("data-custom-run-button");
      const server = element == null ? void 0 : element.getAttribute("data-server");
      return new Playground({
        element,
        code,
        configuration,
        fontSize,
        showLineNumbers: showLineNumbers === "true",
        highlightOnly: highlightOnly === "true",
        showFoldedCodeButton: showFoldedCodeButton === "true",
        showFooter: showFooter === "true",
        customRunButton: customRunButton != null ? customRunButton : void 0,
        server: server != null ? server : void 0
      });
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
      this.clearTerminal();
      this.writeToTerminal("Running code...");
      const code = this.editor.getCode();
      CodeRunner.runCode(code).then((result) => {
        this.clearTerminal();
        this.writeToTerminal(result.output);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run code. Please try again.");
      });
    }
    runTests() {
      this.clearTerminal();
      this.writeToTerminal("Running tests...");
      const code = this.editor.getCode();
      CodeRunner.runTest(code).then((result) => {
        this.clearTerminal();
        this.writeToTerminal(result.output);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run tests. Please try again.");
      });
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

  // src/main.ts
  var currentScript = document.currentScript;
  var selector = currentScript == null ? void 0 : currentScript.getAttribute("data-selector");
  var globalConfiguration = currentScript == null ? void 0 : currentScript.getAttribute("data-configuration");
  var globalFontSize = currentScript == null ? void 0 : currentScript.getAttribute("data-font-size");
  var globalShowLineNumbers = currentScript == null ? void 0 : currentScript.getAttribute("data-show-line-numbers");
  var globalHighlightOnly = currentScript == null ? void 0 : currentScript.getAttribute("data-highlight-only");
  var globalShowFoldedCodeButton = currentScript == null ? void 0 : currentScript.getAttribute("data-show-folded-code-button");
  var globalShowFooter = currentScript == null ? void 0 : currentScript.getAttribute("data-show-footer");
  var globalServer = currentScript == null ? void 0 : currentScript.getAttribute("data-server");
  if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll(selector).forEach((element) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
        const configuration = (_b = (_a = element == null ? void 0 : element.getAttribute("data-configuration")) != null ? _a : globalConfiguration) != null ? _b : "run";
        const fontSize = (_d = (_c = element.getAttribute("data-font-size")) != null ? _c : globalFontSize) != null ? _d : "12px";
        const showLineNumbers = (_f = (_e = element == null ? void 0 : element.getAttribute("data-show-line-numbers")) != null ? _e : globalShowLineNumbers) != null ? _f : "true";
        const highlightOnly = (_h = (_g = element.getAttribute("data-highlight-only")) != null ? _g : globalHighlightOnly) != null ? _h : "false";
        const showFoldedCodeButton = (_j = (_i = element == null ? void 0 : element.getAttribute("data-show-folded-code-button")) != null ? _i : globalShowFoldedCodeButton) != null ? _j : "true";
        const showFooter = (_l = (_k = element == null ? void 0 : element.getAttribute("data-show-footer")) != null ? _k : globalShowFooter) != null ? _l : "true";
        const customRunButton = element == null ? void 0 : element.getAttribute("data-custom-run-button");
        const server = (_m = element == null ? void 0 : element.getAttribute("data-server")) != null ? _m : globalServer;
        new Playground({
          element,
          configuration,
          fontSize,
          showLineNumbers: showLineNumbers === "true",
          highlightOnly: highlightOnly === "true",
          showFoldedCodeButton: showFoldedCodeButton === "true",
          showFooter: showFooter === "true",
          customRunButton: customRunButton != null ? customRunButton : void 0,
          server: server != null ? server : void 0
        });
      });
    });
  }
  window.Playground = Playground;
})();
