import "./v"
import "./v-hint"

import {Playground} from "./Playground"

const currentScript = document.currentScript
const selector = currentScript?.getAttribute("data-selector")
const globalConfiguration = currentScript?.getAttribute("data-configuration")
const globalFontSize = currentScript?.getAttribute("data-font-size")
const globalShowLineNumbers = currentScript?.getAttribute("data-show-line-numbers")
const globalHighlightOnly = currentScript?.getAttribute("data-highlight-only")
const globalShowFoldedCodeButton = currentScript?.getAttribute("data-show-folded-code-button")
const globalShowFooter = currentScript?.getAttribute("data-show-footer")
const globalServer = currentScript?.getAttribute("data-server")

if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(selector).forEach((element) => {
            const configuration = element?.getAttribute("data-configuration") ?? globalConfiguration ?? "run"
            const fontSize = element.getAttribute("data-font-size") ?? globalFontSize ?? "12px"
            const showLineNumbers = element?.getAttribute("data-show-line-numbers") ?? globalShowLineNumbers ?? "true"
            const highlightOnly = element.getAttribute("data-highlight-only") ?? globalHighlightOnly ?? "false"
            const showFoldedCodeButton = element?.getAttribute("data-show-folded-code-button") ?? globalShowFoldedCodeButton ?? "true"
            const showFooter = element?.getAttribute("data-show-footer") ?? globalShowFooter ?? "true"
            const customRunButton = element?.getAttribute("data-custom-run-button")
            const server = element?.getAttribute("data-server") ?? globalServer

            new Playground({
                element: element as HTMLElement,
                configuration: configuration,
                fontSize: fontSize,
                showLineNumbers: showLineNumbers === "true",
                highlightOnly: highlightOnly === "true",
                showFoldedCodeButton: showFoldedCodeButton === "true",
                showFooter: showFooter === "true",
                customRunButton: customRunButton ?? undefined,
                server: server ?? "https://play.vlang.foundation/",
            })
        })
    })
}

initCss()
// @ts-ignore
window.Playground = Playground

function initCss() {
    const head = document.head
    const link = document.createElement("link")
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'https://unpkg.com/vlang-playground@1.0.0/vlang-playground.css';
    head.appendChild(link);
}
