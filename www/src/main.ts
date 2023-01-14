import "./v"
import "./v-hint"

import {Playground} from "./Playground"

const currentScript = document.currentScript
const selector = currentScript?.getAttribute("data-selector")
const globalFontSize = currentScript?.getAttribute("data-font-size")
const globalHighlightOnly = currentScript?.getAttribute("data-highlight-only")
const globalShowFoldedCodeButton = currentScript?.getAttribute("data-show-folded-code-button")

if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(selector).forEach((element) => {
            const fontSize = element.getAttribute("data-font-size") ?? globalFontSize ?? "12px"
            const highlightOnly = element.getAttribute("data-highlight-only") ?? globalHighlightOnly ?? "false"
            const showFoldedCodeButton = element?.getAttribute("data-show-folded-code-button") ?? globalShowFoldedCodeButton ?? "true"
            const playground = new Playground({
                element: element as HTMLElement,
                highlightOnly: highlightOnly == "true",
                showFoldedCodeButton: showFoldedCodeButton == "true",
            })

            playground.setEditorFontSize(fontSize)
        })
    })
}

// @ts-ignore
window.Playground = Playground
