import "./v"
import "./v-hint"

import {Playground} from "./Playground"

const currentScript = document.currentScript
const selector = currentScript?.getAttribute("data-selector")
const scriptConfiguration = Playground.getConfigurationFromElement(currentScript!)

if (selector) {
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(selector).forEach((element) => {
            Playground.create(element as HTMLElement, scriptConfiguration)
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
    link.href = 'https://unpkg.com/vlang-playground@1.0.22/dist/vlang-playground.css';
    head.appendChild(link);
}
