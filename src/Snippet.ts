interface Range {
    start: number
    startFromEnd: number
}

export enum SnippetState {
    Folded,
    Unfolded,
}

export class Snippet {
    code: string
    removedIndent: number = 0
    range: Range
    state: SnippetState = SnippetState.Folded
    wasUnfolded: boolean = false
    foldedCode: string | null = null
    unfoldedCode: string | null = null
    currentCodeObtainer: () => string = () => ""

    constructor(code: string) {
        const normalizedCode = this.normalizeCode(code)
        this.range = this.getSnippetRange(normalizedCode)
        this.code = this.removeRangeMarkers(normalizedCode)
    }

    public registerCurrentCodeObtainer(obtainer: () => string) {
        this.currentCodeObtainer = obtainer
    }

    public noFolding(): boolean {
        return this.range.start == -1
    }

    public getCode(): string {
        if (this.noFolding()) {
            return this.code
        }

        if (this.state == SnippetState.Unfolded) {
            return this.getUnfoldedCode()
        }
        return this.getFoldedCode()
    }

    public getRunnableCode(): string {
        if (this.state == SnippetState.Unfolded) {
            return this.currentCodeObtainer()
        }

        return this.getUnfoldedCodeWithoutCaching()
    }

    private getUnfoldedCode() {
        if (this.unfoldedCode != null) {
            return this.unfoldedCode
        }

        return this.getUnfoldedCodeWithoutCaching()
    }

    private getUnfoldedCodeWithoutCaching() {
        if (this.noFolding()) {
            return this.currentCodeObtainer()
        }

        // get current folded code from editor to take care changes from user
        const visibleCode = this.currentCodeObtainer()
        const indent = " ".repeat(this.removedIndent)
        // and recreate original indents
        const indented = visibleCode.split("\n").map((line) => indent + line).join("\n")

        const lines = this.code.split("\n")

        // and gets original prefix and suffix to recreate unfolded state
        const prefix = lines.slice(0, this.range.start).join("\n")
        const suffix = lines.slice(lines.length - this.range.startFromEnd).join("\n")

        const code = prefix + "\n" + indented + "\n" + suffix
        this.unfoldedCode = code
        return code
    }

    private getFoldedCode(): string {
        if (this.noFolding()) {
            return this.currentCodeObtainer()
        }

        if (this.foldedCode != null) {
            return this.foldedCode
        }

        if (this.wasUnfolded) {
            // we update current unfolded code only if code was unfolded earlier
            this.code = this.currentCodeObtainer()
        }
        const lines = this.code.split("\n")
        const rawFoldedCode = lines
            .slice(this.range.start, lines.length - this.range.startFromEnd)
            .join("\n")
        const code = this.normalizeIndents(rawFoldedCode)
        this.foldedCode = code
        return code
    }

    public toggle() {
        if (this.state == SnippetState.Folded) {
            this.state = SnippetState.Unfolded
            this.wasUnfolded = true
            this.foldedCode = null
        } else {
            this.state = SnippetState.Folded
            this.unfoldedCode = null
        }
    }

    private getSnippetRange(code: string): Range {
        const lines = code.split("\n")
        const startLine = lines.findIndex(line => line.trim().startsWith("//code::start"))
        const endLine = lines.findIndex(line => line.trim().startsWith("//code::end"))

        if (startLine == -1 || endLine == -1) {
            return {start: -1, startFromEnd: 0}
        }

        return {
            start: startLine,
            startFromEnd: lines.length - endLine - 1,
        }
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
    private normalizeCode(code: string): string {
        const trimmed = this.normalizeIndents(code).split("\n")

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

    private normalizeIndents(code: string): string {
        const lines = code.split("\n")
        const indents = lines.map(line => this.lineIndent(line))
        const minIndent = Math.min(...indents)
        const trimmed = lines.map(line => line.substring(minIndent))
        this.removedIndent = minIndent
        return trimmed.join("\n")
    }

    private lineIndent(line: string): number {
        for (let i = 0; i < line.length; i++) {
            if (line[i] !== " " && line[i] != "\t") {
                const substring = line.substring(0, i).replaceAll("\t", "    ")
                return substring.length
            }
        }
        return Number.MAX_VALUE
    }

    private removeRangeMarkers(code: string): string {
        const lines = code.split("\n")
        const filtered = lines.filter(line => !line.trim().startsWith("//code::"))
        return filtered.join("\n")
    }
}