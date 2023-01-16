interface Range {
    start: number
    end: number
}

export enum SnippetState {
    Folded,
    Unfolded,
}

export class Snippet {
    original: string
    prefix: string
    foldedCode: string
    suffix: string
    range: Range
    state: SnippetState = SnippetState.Folded

    constructor(code: string) {
        const normalizedCode = this.normalizeCode(code)

        this.range = this.getSnippetRange(normalizedCode)
        const parts = this.separateCodeBySnippetRange(normalizedCode, this.range)
        this.original = this.removeRangeMarkers(normalizedCode)
        this.prefix = parts.prefix
        this.foldedCode = this.normalizeCode(parts.code)
        this.suffix = parts.suffix
    }

    public noFolding(): boolean {
        return this.range.start == -1 && this.range.end == -1
    }

    public countLines(): number {
        return this.code().split("\n").length
    }

    public code(): string {
        if (this.state == SnippetState.Unfolded) {
            return this.original
        }
        return this.foldedCode
    }

    public toggle() {
        if (this.state == SnippetState.Folded) {
            this.state = SnippetState.Unfolded
        } else {
            this.state = SnippetState.Folded
        }
    }

    private getSnippetRange(code: string): Range {
        const lines = code.split("\n")
        const startLine = lines.findIndex(line => line.trim().startsWith("//code::start"))
        const endLine = lines.findIndex(line => line.trim().startsWith("//code::end"))

        if (startLine == -1 || endLine == -1) {
            return {
                start: -1,
                end: -1,
            }
        }

        return {
            start: startLine + 1,
            end: endLine - 1,
        }
    }

    private separateCodeBySnippetRange(code: string, range: Range): { prefix: string, code: string, suffix: string } {
        if (range.start == -1 && range.end == -1) {
            return {
                prefix: "",
                code: code,
                suffix: "",
            }
        }

        const lines = code.split("\n")
        const prefix = lines.slice(0, range.start + 1).join("\n")

        const codeSnippet = lines.slice(range.start, range.end + 1).join("\n")
        const suffix = lines.slice(range.end + 3).join("\n")

        return {
            prefix,
            code: codeSnippet,
            suffix,
        }
    }

    private lineIndent(line: string): number {
        for (let i = 0; i < line.length; i++) {
            if (line[i] !== " ") {
                return i
            }
        }
        return Number.MAX_VALUE
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
    private normalizeCode(code: string): string {
        const lines = code.split("\n")
        const indents = lines.map(line => this.lineIndent(line))
        const minIndent = Math.min(...indents)
        const trimmed = lines.map(line => line.substring(minIndent))

        if (trimmed.length > 1) {
            const first = trimmed[0]
            const last = trimmed[trimmed.length - 1]
            if (first.trim().length == 0) {
                trimmed.shift()
            }
            if (last.trim().length == 0) {
                trimmed.pop()
            }
        }

        return trimmed.join("\n")
    }

    private removeRangeMarkers(code: string): string {
        const lines = code.split("\n")
        const filtered = lines.filter(line => !line.trim().startsWith("//code::"))
        return filtered.join("\n")
    }
}