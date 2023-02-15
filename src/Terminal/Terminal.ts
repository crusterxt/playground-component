type OnCloseCallback = () => void
type OnWriteCallback = (text: string) => void
type FilterCallback = (text: string) => boolean

export class Terminal {
    private readonly element: HTMLElement
    private onClose: OnCloseCallback | null = null
    private onWrite: OnWriteCallback | null = null
    private filters: FilterCallback[] = []

    constructor(element: HTMLElement) {
        this.element = element
    }

    public registerCloseHandler(handler: () => void) {
        this.onClose = handler
    }

    public registerWriteHandler(handler: (text: string) => void) {
        this.onWrite = handler
    }

    public registerFilter(filter: FilterCallback) {
        this.filters.push(filter)
    }

    public write(text: string) {
        const lines = text.split("\n")
        const outputElement = this.getTerminalOutputElement()
        const filteredLines = lines.filter(line => this.filters.every(filter => filter(line)))
        const newText = filteredLines.join("\n")
        outputElement.innerHTML += newText + "\n"

        if (this.onWrite !== null) {
            this.onWrite(text)
        }
    }

    public writeTestPassed() {
        const testPassedElement = `
<span class="test-passed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#38a13b"/>
        <path d="M5.06188 8.93582L8.00653 10.9566L11.4065 5.35109" stroke="#38a13b"/>
    </svg>

    <span>Tests passed</span>
</span>
`

        const outputElement = this.getTerminalOutputElement()
        outputElement.innerHTML += testPassedElement + "\n"

        if (this.onWrite !== null) {
            this.onWrite("")
        }
    }

    public writeTestFailed() {
        const testFailedElement = `
<span class="test-failed-line">
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.50006" cy="8.5" r="6.70953" stroke="#AF5050"/>
        <path d="M9.05936 4.27274L8.97413 10.5455H7.9855L7.90027 4.27274H9.05936ZM8.47981 13.0682C8.26959 13.0682 8.08919 12.9929 7.93862 12.8423C7.78805 12.6918 7.71277 12.5114 7.71277 12.3011C7.71277 12.0909 7.78805 11.9105 7.93862 11.76C8.08919 11.6094 8.26959 11.5341 8.47981 11.5341C8.69004 11.5341 8.87044 11.6094 9.02101 11.76C9.17158 11.9105 9.24686 12.0909 9.24686 12.3011C9.24686 12.4403 9.21135 12.5682 9.14033 12.6847C9.07214 12.8011 8.97981 12.8949 8.86334 12.9659C8.7497 13.0341 8.62186 13.0682 8.47981 13.0682Z" fill="#AF5050"/>
    </svg>

    <span>Tests failed</span>
</span>
`

        const outputElement = this.getTerminalOutputElement()
        outputElement.innerHTML += testFailedElement + "\n"

        if (this.onWrite !== null) {
            this.onWrite("")
        }
    }

    public clear() {
        this.getTerminalOutputElement().innerHTML = ""
    }

    public mount() {
        const closeButton = this.element.querySelector(".js-terminal__close-button") as HTMLElement
        if (closeButton === null || closeButton === undefined || this.onClose === null) {
            return
        }

        closeButton.addEventListener("click", this.onClose)
    }

    private getTerminalOutputElement(): HTMLElement {
        return this.element.querySelector(".js-terminal__output") as HTMLElement
    }
}
