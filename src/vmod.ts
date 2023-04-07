import {EditorConfiguration, Mode, StringStream} from "codemirror"

type Quota = "'" | "\"" | "`"
type Tokenizer = (stream: StringStream, state: ModeState) => string | null

interface ModeState {
    context: Context

    /**
     * Current tokenizer function or null.
     */
    tokenize: Tokenizer | null

    /**
     * Current indentation level.
     */
    indention: number

    /**
     * Whenever current position is a start of line.
     */
    startOfLine: boolean
}

class Context {
    constructor(
        public indentation: number,
        public column: number,
        public type: string,
        public align: boolean | null,
        public prev?: Context) {
    }

    /**
     * Whenever current position inside a string.
     */
    insideString: boolean = false

    /**
     * Current quotation mark.
     * Valid only when insideString is true.
     */
    stringQuote: Quota | null = null
}

export const keywords: Set<string> = new Set<string>([
    "Module",
])

// @ts-ignore
CodeMirror.defineMode("vmod", (config: EditorConfiguration): Mode<ModeState> => {
    const indentUnit = config.indentUnit ?? 0

    const isOperatorChar = /[+\-*&^%:=<>!?|\/]/

    let curPunc: string | null = null

    function eatIdentifier(stream: StringStream): string {
        stream.eatWhile(/[\w$_\xa1-\uffff]/)
        return stream.current()
    }

    function tokenBase(stream: StringStream, state: ModeState): string | null {
        const ch = stream.next()
        if (ch === null) {
            return null
        }

        if (ch === "\"" || ch === "'" || ch === "`") {
            state.tokenize = tokenString(ch)
            return state.tokenize(stream, state)
        }

        if (ch === ".") {
            if (!stream.match(/^[0-9]+([eE][\-+]?[0-9]+)?/)) {
                return "operator"
            }
        }

        if (/[\d.]/.test(ch)) {
            if (ch === "0") {
                stream.match(/^[xX][0-9a-fA-F_]+/) ||
                stream.match(/^o[0-7_]+/) ||
                stream.match(/^b[0-1_]+/)
            } else {
                stream.match(/^[0-9_]*\.?[0-9_]*([eE][\-+]?[0-9_]+)?/)
            }
            return "number"
        }
        if (/[\[\]{}(),;:.]/.test(ch)) {
            curPunc = ch
            return null
        }
        if (ch === "/") {
            if (stream.eat("*")) {
                state.tokenize = tokenComment
                return tokenComment(stream, state)
            }
            if (stream.eat("/")) {
                stream.skipToEnd()
                return "comment"
            }
        }
        if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar)
            return "operator"
        }

        const cur = eatIdentifier(stream)

        if (keywords.has(cur)) return "keyword"

        const next = stream.peek()
        if (next === "(" || next === "<") {
            return "function"
        }

        if (next === ":") {
            return "property"
        }

        return "variable"
    }


    function tokenString(quote: Quota | null) {
        return function (stream: StringStream, state: ModeState) {
            state.context.insideString = true
            state.context.stringQuote = quote

            let next: string | null = ""
            let escaped = false
            let end = false

            while ((next = stream.next()) != null) {
                if (next === quote && !escaped) {
                    end = true
                    break
                }
                escaped = !escaped && next === "\\"
            }

            if (end || escaped) {
                state.tokenize = tokenBase
            }

            state.context.insideString = false
            state.context.stringQuote = null
            return "string"
        }
    }

    function tokenComment(stream: StringStream, state: ModeState) {
        let maybeEnd = false
        let ch: string | null
        while (ch = stream.next()) {
            if (ch === "/" && maybeEnd) {
                state.tokenize = tokenBase
                break
            }
            maybeEnd = (ch === "*")
        }
        return "comment"
    }

    function pushContext(state: ModeState, column: number, type: string) {
        return state.context = new Context(state.indention, column, type, null, state.context)
    }

    function popContext(state: ModeState) {
        if (!state.context.prev) return
        const t = state.context.type
        if (t === ")" || t === "]" || t === "}")
            state.indention = state.context.indentation
        state.context = state.context.prev
        return state.context
    }

    return {
        startState: function (): ModeState {
            return {
                tokenize: null,
                context: new Context(0, 0, "top", false),
                indention: 0,
                startOfLine: true,
            }
        },

        token: function (stream: StringStream, state: ModeState): string | null {
            const ctx = state.context
            if (stream.sol()) {
                if (ctx.align == null) {
                    ctx.align = false
                }
                state.indention = stream.indentation()
                state.startOfLine = true
            }
            if (stream.eatSpace()) {
                return null
            }
            curPunc = null
            const style = (state.tokenize || tokenBase)(stream, state)
            if (style === "comment") {
                return style
            }
            if (ctx.align == null) {
                ctx.align = true
            }

            if (curPunc === "{") pushContext(state, stream.column(), "}")
            else if (curPunc === "[") pushContext(state, stream.column(), "]")
            else if (curPunc === "(") pushContext(state, stream.column(), ")")
            else if (curPunc === "}" && ctx.type === "}") popContext(state)
            else if (curPunc === ctx.type) popContext(state)
            state.startOfLine = false
            return style
        },

        indent: function (state: ModeState, textAfter: string): number {
            if (state.tokenize !== tokenBase && state.tokenize != null) {
                return 0
            }

            if (state.context.type == "top") {
                return 0
            }

            const ctx = state.context
            const firstChar = textAfter.charAt(0)

            const closing = firstChar === ctx.type
            if (ctx.align) {
                return ctx.column + (closing ? 0 : 1)
            }

            return ctx.indentation + (closing ? 0 : indentUnit)
        },

        // @ts-ignore
        electricChars: "{}):",
        // @ts-ignore
        closeBrackets: "()[]{}''\"\"``",
        fold: "brace",
        blockCommentStart: "/*",
        blockCommentEnd: "*/",
        lineComment: "//",
    }
})

// @ts-ignore
CodeMirror.defineMIME("text/x-vmod", "vmod")
