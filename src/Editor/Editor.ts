import {CodeRepository, LocalCodeRepository, SharedCodeRepository, SharedCodeRunConfiguration} from "../Repositories"
import {Terminal} from "../Terminal/Terminal"
import {ITheme} from "../themes"
import {Snippet, SnippetState} from "../Snippet"
import {EditorConfiguration} from "codemirror"
import {RunnableCodeSnippet} from "../CodeRunner/CodeRunner";

export class Editor {
    private wrapperElement: HTMLElement
    private repository: CodeRepository
    public editor: CodeMirror.Editor
    public terminal: Terminal
    public snippet: Snippet | null = null
    private onTerminalOpen: (() => void)[] = [];
    private onTerminalClose: (() => void)[] = [];
    private onCodeChange: ((newCode: string) => void)[] = [];

    constructor(wrapper: HTMLElement, repository: CodeRepository, readonly: boolean, showLineNumbers: boolean) {
        const editorConfig: EditorConfiguration = {
            mode: "v",
            lineNumbers: showLineNumbers,
            // @ts-ignore
            matchBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-/": "toggleComment",
            },
            indentWithTabs: true,
            indentUnit: 4,
            autoCloseBrackets: true,
            showHint: true,
            lint: {
                async: true,
                lintOnChange: true,
                delay: 20,
            },
            toggleLineComment: {
                indent: true,
                padding: " ",
            },
            theme: "dark",
            readOnly: readonly ? "nocursor" : false,
            // @ts-ignore
            scrollbarStyle: "overlay",
        }

        this.wrapperElement = wrapper

        const place = wrapper.querySelector("textarea")!
        // @ts-ignore
        this.editor = CodeMirror.fromTextArea(place, editorConfig)
        this.repository = repository
        this.repository.getCode((snippet) => {
            if (snippet.code === SharedCodeRepository.CODE_NOT_FOUND) {
                // If the code is not found, use default Hello World example.
                this.terminal.write("Code for shared link not found.")
                return
            }

            this.updateCode(snippet.code);
        })

        this.editor.on('change', () => {
            const code = this.snippet?.getRunnableCode() ?? this.editor.getValue()
            this.onCodeChange.forEach((callback) => callback(code))
        });

        const terminalElement = wrapper.querySelector(".js-terminal") as HTMLElement
        if (terminalElement === null || terminalElement === undefined) {
            throw new Error("Terminal not found, please check that terminal inside editor element")
        }
        this.terminal = new Terminal(terminalElement)
        this.terminal.registerCloseHandler(() => {
            this.closeTerminal()
            this.editor.refresh()
        })
        this.terminal.registerWriteHandler((_) => {
            this.openTerminal()
        })
        this.terminal.registerFilter((line) => {
            return !line.trim().startsWith("Failed command")
        })
        this.terminal.mount()

        this.closeTerminal()
    }

    public updateCode(code: string) {
        this.snippet = new Snippet(code)
        this.snippet.registerCurrentCodeObtainer(() => this.editor.getValue())
        this.setCode(this.snippet.getCode())
    }

    public setEditorFontSize(size: string) {
        const cm = this.wrapperElement.querySelector(".CodeMirror") as HTMLElement
        let normalizedSize = size
        if (normalizedSize.endsWith("px")) {
            normalizedSize = normalizedSize.slice(0, -2)
        }
        cm.style.fontSize = normalizedSize + "px"
        this.refresh()
    }

    public setCode(code: string, preserveCursor: boolean = false) {
        const cursor = this.editor.getCursor()
        this.editor.setValue(code)
        this.repository.saveCode(code)

        if (preserveCursor) {
            this.editor.setCursor(cursor)
        }
    }

    public getCode(): string {
        return this.snippet?.getCode()!
    }

    public saveCode() {
        const isSharedCodeRepository = this.repository instanceof SharedCodeRepository

        if (isSharedCodeRepository) {
            this.repository = new LocalCodeRepository()
        }

        this.repository.saveCode(this.getCode())
    }

    public copyCode(): Promise<void> {
        const code = this.getCode()
        return navigator.clipboard.writeText(code)
    }

    public getRunnableCodeSnippet(buildArguments: string[], runArguments: string[], runConfiguration: SharedCodeRunConfiguration): RunnableCodeSnippet {
        return new RunnableCodeSnippet(this.snippet?.getRunnableCode()!, buildArguments, runArguments, runConfiguration)
    }

    public toggleSnippet() {
        if (this.snippet === null) {
            return
        }

        this.snippet.toggle()
        this.setCode(this.snippet.getCode())

        if (this.snippet.state == SnippetState.Unfolded) {
            const code = this.snippet.getCode()
            const countLines = code.split("\n").length
            const startRange = this.snippet.range.start
            const endRange = countLines - this.snippet.range.startFromEnd

            this.editor.markText(
                {line: 0, ch: 0},
                {line: startRange, ch: 0},
                {
                    readOnly: true,
                    inclusiveLeft: true,
                    inclusiveRight: false,
                },
            )

            this.editor.markText(
                {line: endRange, ch: 0},
                {line: countLines, ch: 0},
                {
                    readOnly: true,
                    inclusiveLeft: true,
                    inclusiveRight: false,
                },
            )

            this.editor.operation(() => {
                for (let i = 0; i < startRange; i++) {
                    this.editor.addLineClass(i, "background", "unmodifiable-line")
                }

                for (let i = endRange; i < countLines; i++) {
                    this.editor.addLineClass(i, "background", "unmodifiable-line")
                }
            })
        }

        this.refresh()
    }

    public openTerminal() {
        if (!this.terminalSsClosed()) {
            return
        }
        this.wrapperElement.classList.remove("closed-terminal")
        this.onTerminalOpen.forEach((callback) => callback())
    }

    public closeTerminal() {
        if (this.terminalSsClosed()) {
            return
        }
        this.wrapperElement.classList.add("closed-terminal")
        this.onTerminalClose.forEach((callback) => callback())
    }

    public terminalSsClosed(): boolean {
        return this.wrapperElement.classList.contains("closed-terminal")
    }

    public setTheme(theme: ITheme) {
        this.editor.setOption("theme", theme.name())
        this.wrapperElement?.setAttribute("data-theme", theme.name())
    }

    public showCompletion() {
        this.editor.execCommand("autocomplete")
    }

    public refresh() {
        this.editor.refresh()
    }

    public registerOnTerminalOpen(callback: () => void): void {
        this.onTerminalOpen.push(callback)
    }

    public registerOnTerminalClose(callback: () => void): void {
        this.onTerminalClose.push(callback)
    }

    public registerOnCodeChange(callback: (code: string) => void): void {
        this.onCodeChange.push(callback)
    }
}
