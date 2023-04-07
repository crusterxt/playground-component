import "./v"
import "./vmod"

import {Playground} from "./Playground"

const currentScript = document.currentScript
const selector = currentScript?.getAttribute("data-selector") ?? null
const scriptConfiguration = Playground.getConfigurationFromElement(currentScript!)

if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(selector).forEach((element) => {
            Playground.create(element as HTMLElement, scriptConfiguration)
        })
    })
}

// @ts-ignore
window.Playground = Playground
