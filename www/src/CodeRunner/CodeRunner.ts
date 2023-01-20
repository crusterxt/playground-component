export type RunCodeResult = {
    ok: boolean
    output: string
}

/**
 * CodeRunner describes how to run, format and share code.
 */
export class CodeRunner {
    public static server: string | null;

    public static runCode(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        const url = this.buildUrl("run")
        return fetch(url, {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run code")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => JSON.parse(data) as RunCodeResult)
    }

    public static runTest(code: string): Promise<RunCodeResult> {
        const data = new FormData()
        data.append("code", code)

        const url = this.buildUrl("run_test")
        return fetch(url, {
            method: "post",
            body: data,
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run test")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => JSON.parse(data) as RunCodeResult)
    }

    private static buildUrl(path: string) {
        if (this.server !== null && this.server !== undefined) {
            const server = this.server.endsWith('/') ? this.server.slice(0, -1) : this.server
            return `${server}/${path}`
        }
        
        return  `/${path}`
    }
}
