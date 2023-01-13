import "./v"
import "./v-hint"

import { Playground, PlaygroundDefaultAction } from "./Playground"

// new Playground('.vlang-code', ``)

// @ts-ignore
window.Playground = Playground;

// playground.registerAction(PlaygroundDefaultAction.RUN, () => {
//     playground.run()
// })
//
// playground.setupShortcuts()
