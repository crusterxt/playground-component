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

  // src/v.ts
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
  var Context = class {
    constructor(indentation, column, type, align, prev, knownImports = /* @__PURE__ */ new Set()) {
      this.indentation = indentation;
      this.column = column;
      this.type = type;
      this.align = align;
      this.prev = prev;
      this.knownImports = knownImports;
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
  var hashDirectives = /* @__PURE__ */ new Set([
    "#flag",
    "#include",
    "#pkgconfig"
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
    "i32",
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
    "voidptr"
  ]);
  CodeMirror.defineMode("v", (config) => {
    var _a2;
    const indentUnit = (_a2 = config.indentUnit) != null ? _a2 : 0;
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
      if ((ch === "r" || ch === "c") && (stream.peek() == '"' || stream.peek() == "'")) {
        const next2 = stream.next();
        if (next2 === null) {
          return "string";
        }
        state.tokenize = tokenRawString(next2);
        return "string";
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
      if (hashDirectives.has(cur))
        return "hash-directive";
      if (!wasDot) {
        if (builtinTypes.has(cur))
          return "builtin";
      }
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
      if (state.context.expectedImportName && stream.peek() !== ".") {
        state.context.expectedImportName = false;
        if (state.context.knownImports === void 0) {
          state.context.knownImports = /* @__PURE__ */ new Set();
        }
        state.context.knownImports.add(cur);
        return "import-name";
      }
      if (wasDot) {
        return "property";
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
    function tokenNextEscape(stream, state) {
      let next = stream.next();
      if (next === "\\") {
        stream.next();
        state.tokenize = tokenString(state.context.stringQuote);
        return "valid-escape";
      }
      return "string";
    }
    __name(tokenNextEscape, "tokenNextEscape");
    function isValidEscapeChar(ch) {
      return ch === "n" || ch === "t" || ch === "r" || ch === "\\" || ch === '"' || ch === "'" || ch === "0";
    }
    __name(isValidEscapeChar, "isValidEscapeChar");
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
          if (escaped && isValidEscapeChar(next)) {
            stream.backUp(2);
            state.tokenize = tokenNextEscape;
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
    function tokenRawString(quote) {
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
    __name(tokenRawString, "tokenRawString");
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
      return state.context = new Context(state.indention, column, type, null, state.context, state.context.knownImports);
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

  // src/vmod.ts
  var Context2 = class {
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
    }
  };
  __name(Context2, "Context");
  var keywords2 = /* @__PURE__ */ new Set([
    "Module"
  ]);
  CodeMirror.defineMode("vmod", (config) => {
    var _a2;
    const indentUnit = (_a2 = config.indentUnit) != null ? _a2 : 0;
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
      if (ch === '"' || ch === "'" || ch === "`") {
        state.tokenize = tokenString(ch);
        return state.tokenize(stream, state);
      }
      if (ch === ".") {
        if (!stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)) {
          return "operator";
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
      const cur = eatIdentifier(stream);
      if (keywords2.has(cur))
        return "keyword";
      const next = stream.peek();
      if (next === "(" || next === "<") {
        return "function";
      }
      if (next === ":") {
        return "property";
      }
      return "variable";
    }
    __name(tokenBase, "tokenBase");
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
      return state.context = new Context2(state.indention, column, type, null, state.context);
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
          context: new Context2(0, 0, "top", false),
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
  CodeMirror.defineMIME("text/x-vmod", "vmod");

  // src/Repositories/SharedCodeRepository.ts
  var _SharedCodeRepository = class {
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
      }).then((resp) => resp.json()).then((data2) => data2).then((resp) => {
        console.log(resp);
        if (!resp.found) {
          onReady({ code: _SharedCodeRepository.CODE_NOT_FOUND });
          return;
        }
        if (resp.error != "") {
          console.error(resp.error);
          onReady({ code: _SharedCodeRepository.CODE_NOT_FOUND });
          return;
        }
        onReady(resp.snippet);
      }).catch((err) => {
        console.log(err);
      });
    }
  };
  var SharedCodeRepository = _SharedCodeRepository;
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
      onReady({ code: this.text });
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
    writeOutputEqual() {
      const testPassedElement = `
<span class="test-passed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#38a13b"/>
        <path d="M5.06188 8.93582L8.00653 10.9566L11.4065 5.35109" stroke="#38a13b"/>
    </svg>

    <span>Output Equal</span>
</span>
`;
      const outputElement = this.getTerminalOutputElement();
      outputElement.innerHTML += testPassedElement + "\n";
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
    getRunnableCodeWithMarkers() {
      return this.getUnfoldedCodeWithoutCaching(true);
    }
    getUnfoldedCode() {
      if (this.unfoldedCode != null) {
        return this.unfoldedCode;
      }
      return this.getUnfoldedCodeWithoutCaching();
    }
    getUnfoldedCodeWithoutCaching(withMarkers = false) {
      if (this.noFolding()) {
        return this.currentCodeObtainer();
      }
      const visibleCode = this.currentCodeObtainer();
      const indent = " ".repeat(this.removedIndent);
      const indented = visibleCode.split("\n").map((line) => indent + line).join("\n");
      const lines = this.code.split("\n");
      const prefix = lines.slice(0, this.range.start).join("\n");
      const suffix = lines.slice(lines.length - this.range.startFromEnd).join("\n");
      const parts = [];
      parts.push(prefix);
      if (withMarkers) {
        parts.push("//code::start");
      }
      parts.push(indented);
      if (withMarkers) {
        parts.push("//code::end");
      }
      parts.push(suffix);
      const code = parts.join("\n");
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

  // src/CodeRunner/CodeRunner.ts
  var RunnableCodeSnippet = class {
    constructor(code, buildArguments, runArguments, runConfiguration) {
      this.code = code;
      this.buildArguments = buildArguments;
      this.runArguments = runArguments;
      this.runConfiguration = runConfiguration;
    }
    toFormData() {
      const data = new FormData();
      data.append("code", this.code);
      data.append("build-arguments", this.buildArguments.join(" "));
      data.append("run-arguments", this.runArguments.join(" "));
      data.append("run-configuration", this.runConfiguration.toString());
      return data;
    }
  };
  __name(RunnableCodeSnippet, "RunnableCodeSnippet");
  var CodeRunner = class {
    static runCode(snippet) {
      return fetch(this.buildUrl("run"), {
        method: "post",
        body: snippet.toFormData()
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run code");
        }
        return resp;
      }).then((resp) => resp.json()).then((data) => data);
    }
    static runTest(snippet) {
      return fetch(this.buildUrl("run_test"), {
        method: "post",
        body: snippet.toFormData()
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run test");
        }
        return resp;
      }).then((resp) => resp.json()).then((data) => data);
    }
    static runCheckOutput(snippet, expectedOutput) {
      const formData = snippet.toFormData();
      formData.append("expected-output", expectedOutput);
      return fetch(this.buildUrl("check_output"), {
        method: "post",
        body: formData
      }).then((resp) => {
        if (resp.status != 200) {
          throw new Error("Can't run output checking");
        }
        return resp;
      }).then((resp) => resp.json()).then((data) => data);
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

  // src/Editor/Editor.ts
  var Editor = class {
    constructor(wrapper, repository, readonly, showLineNumbers, mode = "v") {
      this.snippet = null;
      this.onTerminalOpen = [];
      this.onTerminalClose = [];
      this.onCodeChange = [];
      const editorConfig = {
        mode,
        lineNumbers: showLineNumbers,
        // @ts-ignore
        matchBrackets: !readonly,
        extraKeys: {
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
        readOnly: readonly,
        cursorBlinkRate: readonly ? -1 : 530,
        // due to bug in cm5, we should not use "nocursor" for readOnly because it breaks copying. We should instead hide the cursor with this option
        // @ts-ignore
        scrollbarStyle: "overlay"
      };
      this.wrapperElement = wrapper;
      const place = wrapper.querySelector("textarea");
      this.editor = CodeMirror.fromTextArea(place, editorConfig);
      this.repository = repository;
      this.repository.getCode((snippet) => {
        if (snippet.code === SharedCodeRepository.CODE_NOT_FOUND) {
          this.terminal.write("Code for shared link not found.");
          return;
        }
        this.updateCode(snippet.code);
      });
      this.editor.on("change", () => {
        var _a2, _b;
        const code = (_b = (_a2 = this.snippet) == null ? void 0 : _a2.getRunnableCode()) != null ? _b : this.editor.getValue();
        this.onCodeChange.forEach((callback) => callback(code));
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
    updateCode(code) {
      this.snippet = new Snippet(code);
      this.snippet.registerCurrentCodeObtainer(() => this.editor.getValue());
      this.setCode(this.snippet.getCode());
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
      var _a2;
      return (_a2 = this.snippet) == null ? void 0 : _a2.getCode();
    }
    copyCode() {
      const code = this.getCode();
      return navigator.clipboard.writeText(code);
    }
    getRunnableCodeSnippet(buildArguments, runArguments, runConfiguration) {
      var _a2;
      return new RunnableCodeSnippet((_a2 = this.snippet) == null ? void 0 : _a2.getRunnableCode(), buildArguments, runArguments, runConfiguration);
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
      if (!this.terminalSsClosed()) {
        return;
      }
      this.wrapperElement.classList.remove("closed-terminal");
      this.onTerminalOpen.forEach((callback) => callback());
    }
    closeTerminal() {
      if (this.terminalSsClosed()) {
        return;
      }
      this.wrapperElement.classList.add("closed-terminal");
      this.onTerminalClose.forEach((callback) => callback());
    }
    terminalSsClosed() {
      return this.wrapperElement.classList.contains("closed-terminal");
    }
    setTheme(theme) {
      var _a2;
      this.editor.setOption("theme", theme.name());
      (_a2 = this.wrapperElement) == null ? void 0 : _a2.setAttribute("data-theme", theme.name());
    }
    refresh() {
      this.editor.refresh();
    }
    registerOnTerminalOpen(callback) {
      this.onTerminalOpen.push(callback);
    }
    registerOnTerminalClose(callback) {
      this.onTerminalClose.push(callback);
    }
    registerOnCodeChange(callback) {
      this.onCodeChange.push(callback);
    }
  };
  __name(Editor, "Editor");

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
      <textarea aria-label="Code snippet area"></textarea>
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
      this.onTerminalOpen = [];
      this.onTerminalClose = [];
      this.onCodeChange = [];
      var _a2, _b, _c, _d, _e, _f;
      if (config.selector) {
        this.playgroundElement = document.querySelector(config.selector);
      } else if (config.element) {
        this.playgroundElement = config.element;
      } else {
        throw new Error("No selector or element provided");
      }
      const code = (_b = (_a2 = config.code) != null ? _a2 : this.playgroundElement.textContent) != null ? _b : "";
      this.mount(this.playgroundElement);
      this.runAsTests = config.configuration === "tests";
      this.runAsCheckOutput = config.configuration === "check-output";
      this.repository = new TextCodeRepository(code);
      const editorElement = this.playgroundElement.querySelector(".v-playground");
      const codeMirrorMode = config.isModuleFile ? "vmod" : "v";
      this.editor = new Editor(editorElement, this.repository, (_c = config.highlightOnly) != null ? _c : false, (_d = config.showLineNumbers) != null ? _d : true, codeMirrorMode);
      if (config.fontSize) {
        this.editor.setEditorFontSize(config.fontSize);
      }
      if (config.expectedOutput) {
        this.expectedOutput = config.expectedOutput;
      }
      this.editor.registerOnTerminalOpen(() => {
        this.onTerminalOpen.forEach((callback) => callback());
      });
      this.editor.registerOnTerminalClose(() => {
        this.onTerminalClose.forEach((callback) => callback());
      });
      this.editor.registerOnCodeChange((newCode) => {
        this.onCodeChange.forEach((callback) => callback(newCode));
      });
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
        const promise = this.editor.copyCode();
        const copyActionButton2 = this.getActionElement("copy" /* COPY */);
        promise.then((r) => {
          copyActionButton2.classList.add("copy-success");
          setTimeout(() => {
            copyActionButton2.classList.remove("copy-success");
          }, 1e3);
        }).catch((e) => {
          copyActionButton2.classList.add("copy-error");
          setTimeout(() => {
            copyActionButton2.classList.remove("copy-error");
          }, 1e3);
          console.log(e);
          this.editor.terminal.clear();
          this.editor.terminal.write("Failed to copy code to clipboard.");
          this.editor.terminal.write(e);
        });
      });
      this.registerAction("show-all", () => {
        var _a3;
        this.editor.toggleSnippet();
        const showAllActionButton = this.getActionElement("show-all");
        if (((_a3 = this.editor.snippet) == null ? void 0 : _a3.state) === 0 /* Folded */) {
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
      const copyActionButton = this.getActionElement("copy" /* COPY */);
      if (config.highlightOnly === true || config.isModuleFile === true) {
        const runActionButton = this.getActionElement("run" /* RUN */);
        runActionButton.style.display = "none";
        if (config.showCopyButton === true) {
          copyActionButton.classList.remove("bottom");
        }
        footer.style.display = "none";
      }
      if (!config.showCopyButton) {
        copyActionButton.style.display = "none";
      }
      if (config.server !== void 0) {
        CodeRunner.server = config.server;
      }
    }
    setCode(code) {
      this.editor.updateCode(code);
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
        var _a2;
        const baseUrl = "https://play.vosca.dev/?base64=";
        const code = (_a2 = this.editor.snippet) == null ? void 0 : _a2.getRunnableCode();
        const base64Code = btoa(code);
        const url = baseUrl + base64Code;
        window.open(url, "_blank");
      });
    }
    static create(element, config) {
      const defaultConfiguration = this.getDefaultConfiguration();
      const configuration = this.getConfigurationFromElement(element);
      return new Playground(__spreadProps(__spreadValues(__spreadValues(__spreadValues({}, defaultConfiguration), definedProps(config != null ? config : {})), definedProps(configuration)), {
        element
      }));
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
        server: "https://play.vosca.dev/"
      };
    }
    static getConfigurationFromElement(element) {
      var _a2, _b, _c, _d, _e, _f, _g;
      if (element === null) {
        return {};
      }
      const configuration = (_a2 = element == null ? void 0 : element.getAttribute("data-configuration")) != null ? _a2 : void 0;
      const theme = (_b = element == null ? void 0 : element.getAttribute("data-theme")) != null ? _b : void 0;
      const fontSize = (_c = element.getAttribute("data-font-size")) != null ? _c : void 0;
      const showLineNumbers = toBool(element == null ? void 0 : element.getAttribute("data-show-line-numbers"));
      const highlightOnly = toBool(element.getAttribute("data-highlight-only"));
      const showFoldedCodeButton = toBool(element == null ? void 0 : element.getAttribute("data-show-folded-code-button"));
      const showFooter = toBool(element.getAttribute("data-show-footer"));
      const showCopyButton = toBool(element.getAttribute("data-show-copy-button"));
      const customRunButton = (_d = element == null ? void 0 : element.getAttribute("data-custom-run-button")) != null ? _d : void 0;
      const server = (_e = element == null ? void 0 : element.getAttribute("data-server")) != null ? _e : void 0;
      const expectedOutput = (_f = element == null ? void 0 : element.getAttribute("data-expected-output")) != null ? _f : void 0;
      const isModuleFile = toBool(element == null ? void 0 : element.getAttribute("data-is-module-file"));
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
        server,
        isModuleFile,
        expectedOutput: (_g = expectedOutput == null ? void 0 : expectedOutput.split("\\n")) == null ? void 0 : _g.join("\n")
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
      } else if (this.runAsCheckOutput) {
        this.runCheckOutput();
        return;
      }
      this.runCode();
    }
    runCode() {
      this.clearTerminal();
      this.writeToTerminal("Running code...");
      const snippet = this.getRunnableCodeSnippet();
      CodeRunner.runCode(snippet).then((result) => {
        if (result.error != "") {
          this.writeToTerminal(result.error);
          this.onFailedRun.forEach((callback) => callback());
          return;
        }
        this.clearTerminal();
        this.writeToTerminal(result.output.split("\n").slice(0, -1).join("\n"));
        this.onRunFinished(result);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run code. Please try again.");
        this.onFailedRun.forEach((callback) => callback());
      });
    }
    runTests() {
      this.clearTerminal();
      this.writeToTerminal("Running tests...");
      const snippet = this.getRunnableCodeSnippet();
      CodeRunner.runTest(snippet).then((result) => {
        this.clearTerminal();
        if (result.error == "") {
          this.editor.terminal.writeTestPassed();
        } else {
          this.editor.terminal.writeTestFailed();
          const output = result.error.split("\n").slice(2, -6).join("\n");
          this.writeToTerminal(output);
        }
        this.onRunFinished(result);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't run tests. Please try again.");
        this.onFailedRun.forEach((callback) => callback());
      });
    }
    runCheckOutput() {
      var _a2;
      this.clearTerminal();
      this.writeToTerminal("Running checking for output...");
      const snippet = this.getRunnableCodeSnippet();
      CodeRunner.runCheckOutput(snippet, (_a2 = this.expectedOutput) != null ? _a2 : "").then((result) => {
        var _a3;
        if (result.error != "") {
          this.writeToTerminal(result.error);
          this.onFailedRun.forEach((callback) => callback());
          return;
        }
        this.clearTerminal();
        if (result.is_equal) {
          this.editor.terminal.writeOutputEqual();
        } else {
          this.writeToTerminal("Output is not equal to expected:");
          this.writeToTerminal("---- Output ----");
          this.writeToTerminal(result.output + "&lt;end>");
          this.writeToTerminal("----");
          this.writeToTerminal("---- Expected Output ----");
          this.writeToTerminal(((_a3 = this.expectedOutput) != null ? _a3 : "") + "&lt;end>");
          this.writeToTerminal("----");
          this.writeToTerminal(result.diff);
        }
        this.onRunFinished(result);
      }).catch((err) => {
        console.log(err);
        this.writeToTerminal("Can't check output. Please try again.");
        this.onFailedRun.forEach((callback) => callback());
      });
    }
    getRunnableCodeSnippet() {
      let configuration = 0 /* Run */;
      if (this.runAsTests) {
        configuration = 1 /* Test */;
      }
      return this.editor.getRunnableCodeSnippet([], [], configuration);
    }
    onRunFinished(result) {
      if (result.error == "") {
        this.onSuccessfulRun.forEach((callback) => callback());
      } else {
        this.onFailedRun.forEach((callback) => callback());
      }
    }
    registerOnTerminalOpen(callback) {
      this.onTerminalOpen.push(callback);
    }
    registerOnTerminalClose(callback) {
      this.onTerminalClose.push(callback);
    }
    registerOnCodeChange(callback) {
      this.onCodeChange.push(callback);
    }
    clearTerminal() {
      this.editor.terminal.clear();
    }
    writeToTerminal(text) {
      this.editor.terminal.write(text);
    }
    openTerminal() {
      this.editor.openTerminal();
    }
    closeTerminal() {
      this.editor.closeTerminal();
    }
    setEditorFontSize(size) {
      this.editor.setEditorFontSize(size);
    }
  };
  __name(Playground, "Playground");

  // src/main.ts
  var currentScript = document.currentScript;
  var _a;
  var selector = (_a = currentScript == null ? void 0 : currentScript.getAttribute("data-selector")) != null ? _a : null;
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
