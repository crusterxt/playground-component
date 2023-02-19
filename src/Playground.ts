import {CodeRepository, TextCodeRepository} from "./Repositories"

import {Editor} from "./Editor/Editor"
import {CodeRunner, RunCodeResult} from "./CodeRunner/CodeRunner"
import {collapseSnippetIcons, expandSnippetIcons, template} from "./template"
import {ThemeManager} from "./ThemeManager/ThemeManager"
import {SnippetState} from "./Snippet"
import {ITheme} from "./themes"
import {definedProps, toBool} from "./utils"

/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
export enum PlaygroundDefaultAction {
    RUN = "run",
    COPY = "copy",
}

export interface PlaygroundConfig {
    selector?: string
    element?: HTMLElement
    code?: string
    theme?: string
    configuration?: string
    fontSize?: string
    showLineNumbers?: boolean
    highlightOnly?: boolean
    showFoldedCodeButton?: boolean
    showFooter?: boolean
    showCopyButton?: boolean
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
    private onTerminalOpen: (() => void)[] = [];
    private onTerminalClose: (() => void)[] = [];
    private onCodeChange: ((newCode: string) => void)[] = [];

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

        this.runAsTests = config.configuration === "tests"
        this.repository = new TextCodeRepository(code)
        const editorElement = this.playgroundElement.querySelector(".v-playground") as HTMLElement
        this.editor = new Editor(editorElement, this.repository, config.highlightOnly ?? false, config.showLineNumbers ?? true)

        if (config.fontSize) {
            this.editor.setEditorFontSize(config.fontSize)
        }

        this.editor.registerOnTerminalOpen(() => {
            this.onTerminalOpen.forEach(callback => callback())
        })

        this.editor.registerOnTerminalClose(() => {
            this.onTerminalClose.forEach(callback => callback())
        })

        this.editor.registerOnCodeChange((newCode: string) => {
            this.onCodeChange.forEach(callback => callback(newCode))
        })

        const theme = config.theme ?? "light"
        this.themeManager = new ThemeManager(ThemeManager.findTheme(theme))
        this.themeManager.registerOnChange((theme) => {
            this.setThemeImpl(theme)
        })
        this.themeManager.loadTheme()

        this.registerRunAction(config.customRunButton, () => {
            this.run()
        })

        this.registerAction(PlaygroundDefaultAction.COPY, () => {
            const promise = this.editor.copyCode()
            const copyActionButton = this.getActionElement(PlaygroundDefaultAction.COPY)

            promise
                .then(r => {
                    copyActionButton.classList.add("copy-success")
                    setTimeout(() => {
                        copyActionButton.classList.remove("copy-success")
                    }, 1000)
                })
                .catch(e => {
                    copyActionButton.classList.add("copy-error")
                    setTimeout(() => {
                        copyActionButton.classList.remove("copy-error")
                    }, 1000)

                    console.log(e)
                    this.editor.terminal.clear()
                    this.editor.terminal.write("Failed to copy code to clipboard.")
                    this.editor.terminal.write(e)
                })
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

        this.setupPlaygroundLink()

        if (config.showFoldedCodeButton === false || this.editor.snippet?.noFolding()) {
            const showAllActionButton = this.getActionElement("show-all")
            showAllActionButton.style.display = "none"
        }

        const footer = this.playgroundElement.querySelector(".js-playground__footer") as HTMLElement
        if (config.showFooter === false) {
            footer.style.display = "none"
            editorElement.classList.add("no-footer")
        }

        const copyActionButton = this.getActionElement(PlaygroundDefaultAction.COPY)

        if (config.highlightOnly === true) {
            const runActionButton = this.getActionElement(PlaygroundDefaultAction.RUN)
            runActionButton.style.display = "none"

            if (config.showCopyButton === true) {
                copyActionButton.classList.remove("bottom")
            }

            footer.style.display = "none"
        }

        if (!config.showCopyButton) {
            copyActionButton.style.display = "none"
        }

        if (config.server !== undefined) {
            CodeRunner.server = config.server
        }
    }

    public setCode(code: string) {
        this.editor.updateCode(code)
    }

    public setTheme(name: string) {
        this.setThemeImpl(ThemeManager.findTheme(name))
    }

    private setThemeImpl(theme: ITheme) {
        this.editor.setTheme(theme)
    }

    private setupPlaygroundLink() {
        const playgroundLink = this.playgroundElement.querySelector(".js-playground-link") as HTMLElement
        playgroundLink.addEventListener("click", () => {
            const baseUrl = "https://play.vlang.foundation/?base64="
            const code = this.editor.snippet?.getRunnableCode()!
            const base64Code = btoa(code)
            const url = baseUrl + base64Code
            window.open(url, "_blank")
        })
    }

    public static create(element: HTMLElement, config?: PlaygroundConfig): Playground {
        const defaultConfiguration = this.getDefaultConfiguration()
        const configuration = this.getConfigurationFromElement(element)
        return new Playground({
            ...defaultConfiguration, ...definedProps(config ?? {}), ...definedProps(configuration),
            element: element
        })
    }

    public static getDefaultConfiguration(): PlaygroundConfig {
        return {
            configuration: PlaygroundDefaultAction.RUN,
            theme: "light",
            fontSize: "12px",
            showLineNumbers: true,
            highlightOnly: false,
            showFoldedCodeButton: true,
            showFooter: true,
            showCopyButton: true,
            server: "https://play.vlang.foundation/",
        }
    }

    public static getConfigurationFromElement(element: Element | null): PlaygroundConfig {
        if (element === null) {
            return {}
        }
        const configuration = element?.getAttribute("data-configuration") ?? undefined
        const theme = element?.getAttribute("data-theme") ?? undefined
        const fontSize = element.getAttribute("data-font-size") ?? undefined
        const showLineNumbers = toBool(element?.getAttribute("data-show-line-numbers"))
        const highlightOnly = toBool(element.getAttribute("data-highlight-only"))
        const showFoldedCodeButton = toBool(element?.getAttribute("data-show-folded-code-button"))
        const showFooter = toBool(element.getAttribute("data-show-footer"))
        const showCopyButton = toBool(element.getAttribute("data-show-copy-button"))
        const customRunButton = element?.getAttribute("data-custom-run-button") ?? undefined
        const server = element?.getAttribute("data-server") ?? undefined

        return {
            configuration: configuration,
            theme: theme,
            fontSize: fontSize,
            showLineNumbers: showLineNumbers,
            highlightOnly: highlightOnly,
            showFoldedCodeButton: showFoldedCodeButton,
            showFooter: showFooter,
            customRunButton: customRunButton,
            showCopyButton: showCopyButton,
            server: server,
        }
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

                if (result.ok) {
                    this.editor.terminal.writeTestPassed()
                } else {
                    this.editor.terminal.writeTestFailed()
                    const output = result.output.split("\n").slice(2, -6).join("\n")
                    this.writeToTerminal(output)
                }

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

    public registerOnTerminalOpen(callback: () => void): void {
        this.onTerminalOpen.push(callback)
    }

    public registerOnTerminalClose(callback: () => void): void {
        this.onTerminalClose.push(callback)
    }

    public registerOnCodeChange(callback: (newCode: string) => void): void {
        this.onCodeChange.push(callback)
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

    public openTerminal(): void {
        this.editor.openTerminal()
    }

    public closeTerminal(): void {
        this.editor.closeTerminal()
    }

    public setEditorFontSize(size: string) {
        this.editor.setEditorFontSize(size)
    }
}
