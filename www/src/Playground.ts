import {CodeRepository, TextCodeRepository} from "./Repositories"

import {Editor} from "./Editor/Editor"
import {CodeRunner, RunCodeResult} from "./CodeRunner/CodeRunner"
import {collapseSnippetIcons, expandSnippetIcons, template} from "./template"
import {ThemeManager} from "./ThemeManager/ThemeManager"
import {SnippetState} from "./Snippet"

/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
export enum PlaygroundDefaultAction {
    RUN = "run",
}

export interface PlaygroundConfig {
    selector?: string
    element?: HTMLElement
    code?: string
    configuration?: string
    fontSize?: string
    showLineNumbers?: boolean
    highlightOnly?: boolean
    showFoldedCodeButton?: boolean
    showFooter?: boolean
    customRunButton?: string
    server?: string
}

/**
 * Playground is responsible for managing the all playground.
 */
export class Playground {
    private readonly playgroundElement: HTMLElement
    private readonly repository: CodeRepository
    private readonly editor: Editor
    private readonly themeManager: ThemeManager
    private readonly runAsTests: boolean
    private onSuccessfulRun: (() => void)[] = []
    private onFailedRun: (() => void)[] = []

    constructor(config: PlaygroundConfig) {
        if (config.selector) {
            this.playgroundElement = document.querySelector(config.selector) as HTMLElement
        } else if (config.element) {
            this.playgroundElement = config.element
        } else {
            throw new Error("No selector or element provided")
        }

        const code = config.code ?? this.playgroundElement.textContent ?? ""
        this.mount(this.playgroundElement)

        const theme = this.playgroundElement.getAttribute("data-theme") ?? "dark"

        this.runAsTests = config.configuration === "tests"
        this.repository = new TextCodeRepository(code)
        const editorElement = this.playgroundElement.querySelector(".v-playground") as HTMLElement
        this.editor = new Editor(editorElement, this.repository, config.highlightOnly ?? false, config.showLineNumbers ?? true)

        if (config.fontSize) {
            this.editor.setEditorFontSize(config.fontSize)
        }

        this.themeManager = new ThemeManager(ThemeManager.findTheme(theme))
        this.themeManager.registerOnChange((theme) => {
            this.editor.setTheme(theme)
            editorElement?.setAttribute("data-theme", theme.name())
        })
        this.themeManager.loadTheme()

        this.registerRunAction(config.customRunButton, () => {
            this.run()
        })

        this.registerAction("show-all", () => {
            this.editor.toggleSnippet()

            const showAllActionButton = this.getActionElement("show-all")
            if (this.editor.snippet?.state === SnippetState.Folded) {
                showAllActionButton.innerHTML = expandSnippetIcons
            } else {
                showAllActionButton.innerHTML = collapseSnippetIcons
            }
        })

        if (config.showFoldedCodeButton === false || this.editor.snippet?.noFolding()) {
            const showAllActionButton = this.getActionElement("show-all")
            showAllActionButton.style.display = "none"
        }

        const footer = this.playgroundElement.querySelector(".js-playground__footer") as HTMLElement
        if (config.showFooter === false) {
            footer.style.display = "none"
            editorElement.classList.add("no-footer")
        }

        if (config.highlightOnly === true) {
            const runActionButton = this.getActionElement(PlaygroundDefaultAction.RUN)
            runActionButton.style.display = "none"

            footer.style.display = "none"
        }

        if (config.server !== undefined) {
            CodeRunner.server = config.server
        }
    }

    public static create(element: HTMLElement, code?: string): Playground {
        const configuration = element?.getAttribute("data-configuration") ?? "run"
        const fontSize = element.getAttribute("data-font-size") ?? "12px"
        const showLineNumbers = element?.getAttribute("data-show-line-numbers") ?? "true"
        const highlightOnly = element.getAttribute("data-highlight-only") ?? "false"
        const showFoldedCodeButton = element?.getAttribute("data-show-folded-code-button") ?? "true"
        const showFooter = element?.getAttribute("data-show-footer") ?? "true"
        const customRunButton = element?.getAttribute("data-custom-run-button")
        const server = element?.getAttribute("data-server")

        return new Playground({
            element: element,
            code: code,
            configuration: configuration,
            fontSize: fontSize,
            showLineNumbers: showLineNumbers === "true",
            highlightOnly: highlightOnly === "true",
            showFoldedCodeButton: showFoldedCodeButton === "true",
            showFooter: showFooter === "true",
            customRunButton: customRunButton ?? undefined,
            server: server ?? undefined,
        })
    }

    public registerOnSuccessfulRun(callback: () => void): void {
        this.onSuccessfulRun.push(callback)
    }

    public registerOnFailedRun(callback: () => void): void {
        this.onFailedRun.push(callback)
    }

    public registerRunAction(customSelector: string | undefined, callback: () => void): void {
        if (customSelector) {
            const customButton = document.querySelector(customSelector) as HTMLElement
            if (customButton === undefined) {
                throw new Error(`Can't find custom button with selector ${customSelector}`)
            }

            customButton.addEventListener("click", callback)

            const actionElement = this.getActionElement(PlaygroundDefaultAction.RUN)
            actionElement.style.display = "none"
            return
        }

        this.registerAction(PlaygroundDefaultAction.RUN, callback)
    }

    private mount(element: HTMLElement) {
        if (element === null) {
            return
        }
        element.innerHTML = template
    }

    /**
     * Register a handler for the default or new action.
     * @param name - The name of the action.
     * @param callback - The callback to be called when the action is triggered.
     */
    public registerAction(name: PlaygroundDefaultAction | string, callback: () => void): void {
        const actionButton = this.playgroundElement.querySelector(`.js-playground__action-${name}`) as HTMLElement
        if (actionButton === undefined) {
            throw new Error(`Can't find action button with class js-playground__action-${name}`)
        }

        actionButton.addEventListener("click", callback)
    }

    public getActionElement(name: PlaygroundDefaultAction | string): HTMLElement {
        return this.playgroundElement.querySelector(`.js-playground__action-${name}`) as HTMLElement
    }

    public run(): void {
        if (this.runAsTests) {
            this.runTests()
            return
        }
        this.runCode()
    }

    public runCode(): void {
        this.clearTerminal()
        this.writeToTerminal("Running code...")

        const code = this.editor.snippet?.getRunnableCode()!
        CodeRunner.runCode(code)
            .then(result => {
                this.clearTerminal()
                this.writeToTerminal(result.output)
                this.onRunFinished(result)
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't run code. Please try again.")
                this.onFailedRun.forEach(callback => callback())
            })
    }

    public runTests(): void {
        this.clearTerminal()
        this.writeToTerminal("Running tests...")

        const code = this.editor.snippet?.getRunnableCode()!
        CodeRunner.runTest(code)
            .then(result => {
                this.clearTerminal()
                this.writeToTerminal(result.output)
                this.onRunFinished(result)
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't run tests. Please try again.")
                this.onFailedRun.forEach(callback => callback())
            })
    }

    private onRunFinished(result: RunCodeResult) {
        if (result.ok) {
            this.onSuccessfulRun.forEach(callback => callback())
        } else {
            this.onFailedRun.forEach(callback => callback())
        }
    }

    public setupShortcuts(): void {
        this.editor.editor.on("keypress", (cm, event) => {
            if (!cm.state.completionActive && // Enables keyboard navigation in autocomplete list
                event.key.length === 1 && event.key.match(/[a-z0-9]/i)) { // Only letters and numbers trigger autocomplete
                this.editor.showCompletion()
            }
        })

        document.addEventListener("keydown", ev => {
            if ((ev.ctrlKey || ev.metaKey) && ev.key === "s") {
                this.editor.saveCode()
                ev.preventDefault()
            } else {
                this.editor.saveCode()
            }
        })
    }

    public clearTerminal(): void {
        this.editor.terminal.clear()
    }

    public writeToTerminal(text: string): void {
        this.editor.terminal.write(text)
    }

    public setEditorFontSize(size: string) {
        this.editor.setEditorFontSize(size)
    }
}
