import {CodeRepository, SharedCodeRepository, TextCodeRepository} from "./Repositories"

import {Editor} from "./Editor/Editor"
import {CodeRunner} from "./CodeRunner/CodeRunner"
import {template} from "./template"
import {ThemeManager} from "./ThemeManager/ThemeManager"

/**
 * PlaygroundDefaultAction describes the default action of a playground.
 */
export enum PlaygroundDefaultAction {
    RUN = "run",
}

/**
 * Playground is responsible for managing the all playground.
 */
export class Playground {
    private readonly playgroundElement: HTMLElement
    private readonly repository: CodeRepository
    private readonly editor: Editor
    private readonly themeManager: ThemeManager

    constructor(selector: string, code: string) {
        this.playgroundElement = document.querySelector(selector) as HTMLElement
        this.mount(this.playgroundElement)

        const theme = this.playgroundElement.getAttribute('data-theme') ?? 'dark'

        this.repository = new TextCodeRepository(code)
        const editorElement = this.playgroundElement.querySelector('.v-playground') as HTMLElement
        this.editor = new Editor(editorElement, this.repository)

        this.themeManager = new ThemeManager(ThemeManager.findTheme(theme))
        this.themeManager.registerOnChange((theme) => {
            this.editor.setTheme(theme)
            editorElement?.setAttribute("data-theme", theme.name())
        })
        this.themeManager.loadTheme()

        this.registerAction(PlaygroundDefaultAction.RUN, () => {
            this.run()
        })
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

    public run(): void {
        this.runCode()
    }

    public runCode(): void {
        this.clearTerminal()
        this.writeToTerminal("Running code...")

        const code = this.editor.getCode()
        CodeRunner.runCode(code)
            .then(result => {
                this.clearTerminal()
                this.writeToTerminal(result.output)
            })
            .catch(err => {
                console.log(err)
                this.writeToTerminal("Can't run code. Please try again.")
            })
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
}
