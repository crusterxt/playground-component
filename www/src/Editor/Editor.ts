import {CodeRepository, LocalCodeRepository, SharedCodeRepository} from "../Repositories"
import {Terminal} from "../Terminal/Terminal"
import {ITheme} from "../themes/interface"
import {Snippet, SnippetState} from "../Snippet"
import {EditorConfiguration} from "codemirror"

export class Editor {
    private wrapperElement: HTMLElement
    private repository: CodeRepository
    public editor: CodeMirror.Editor
    public terminal: Terminal
    public snippet: Snippet | null = null

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
        }

        this.wrapperElement = wrapper

        const place = wrapper.querySelector("textarea")!
        // @ts-ignore
        this.editor = CodeMirror.fromTextArea(place, editorConfig)
        this.repository = repository
        this.repository.getCode((code) => {
            if (code === SharedCodeRepository.CODE_NOT_FOUND) {
                // If the code is not found, use default Hello World example.
                this.terminal.write("Code for shared link not found.")
                return
            }

            this.snippet = new Snippet(code)
            this.setCode(this.snippet.code())
        })

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

    public getCode() {
        return this.editor.getValue()
    }

    public saveCode() {
        const isSharedCodeRepository = this.repository instanceof SharedCodeRepository

        if (isSharedCodeRepository) {
            this.repository = new LocalCodeRepository()
        }

        this.repository.saveCode(this.getCode())
    }

    public toggleSnippet() {
        if (this.snippet === null) {
            return
        }

        this.snippet.toggle()
        this.setCode(this.snippet.code())

        if (this.snippet.state == SnippetState.Unfolded) {
            this.editor.markText(
                {line: 0, ch: 0},
                {line: this.snippet.range.start - 1, ch: 0},
                {
                    readOnly: true,
                    inclusiveLeft: true,
                    inclusiveRight: false,
                },
            )

            this.editor.markText(
                {line: this.snippet.range.end, ch: 0},
                {line: this.snippet.countLines(), ch: 0},
                {
                    readOnly: true,
                    inclusiveLeft: true,
                    inclusiveRight: false,
                },
            )

            this.editor.operation(() => {
                for (let i = 0; i < this.snippet!.range.start - 1; i++) {
                    this.editor.addLineClass(i, "background", "unmodifiable-line")
                }

                for (let i = this.snippet!.range.end; i < this.snippet!.countLines(); i++) {
                    this.editor.addLineClass(i, "background", "unmodifiable-line")
                }
            })
        }

        this.refresh()
    }

    public openTerminal() {
        this.wrapperElement.classList.remove("closed-terminal")
    }

    public closeTerminal() {
        this.wrapperElement.classList.add("closed-terminal")
    }

    public setTheme(theme: ITheme) {
        this.editor.setOption("theme", theme.name())
    }

    public showCompletion() {
        this.editor.execCommand("autocomplete")
    }

    public refresh() {
        this.editor.refresh()
    }
}
