import "./v"
import "./v-hint"

import {Playground} from "./Playground"

const currentScript = document.currentScript
const selector = currentScript?.getAttribute("data-selector")
const globalFontSize = currentScript?.getAttribute("data-font-size")
const globalHighlightOnly = currentScript?.getAttribute("data-highlight-only")

if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(selector).forEach((element) => {
            const fontSize = element.getAttribute("data-font-size") ?? globalFontSize ?? "12px"
            const highlightOnly = element.getAttribute("data-highlight-only") ?? globalHighlightOnly ?? "true"
            const playground = new Playground({
                element: element as HTMLElement,
                highlightOnly: highlightOnly == "true",
            })

            playground.setEditorFontSize(fontSize)
        })
    })
}

// @ts-ignore
window.Playground = Playground
