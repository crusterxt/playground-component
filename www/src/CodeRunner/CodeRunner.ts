class RunCodeResult {
    constructor(public output: string) {
    }
}

type FormatCodeResult = {
    ok: boolean
    output: string
}

export class ShareCodeResult {
    constructor(public hash: string) {
    }
}

/**
 * CodeRunner describes how to run, format and share code.
 */
export class CodeRunner {
    public static runCode(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/run", {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run code")
                }

                return resp.text()
            })
            .then(output => new RunCodeResult(output))
    }

    public static runTest(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        return fetch("/run_test", {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run test")
                }

                return resp.text()
            })
            .then(output => new RunCodeResult(output))
    }
}
