import {SharedCodeRunConfiguration} from "../Repositories";

export type RunCodeResponse = {
    output: string
    error: string
}

export class RunnableCodeSnippet {
    constructor(
        public code: string,
        public buildArguments: string[],
        public runArguments: string[],
        public runConfiguration: SharedCodeRunConfiguration,
    ) {
    }

    public toFormData(): FormData {
        const data = new FormData()
        data.append("code", this.code)
        data.append("build-arguments", this.buildArguments.join(" "))
        data.append("run-arguments", this.runArguments.join(" "))
        data.append("run-configuration", this.runConfiguration.toString())
        return data
    }
}

/**
 * CodeRunner describes how to run, format, and share code.
 */
export class CodeRunner {
    public static server: string | null;

    public static runCode(snippet: RunnableCodeSnippet): Promise<RunCodeResponse> {
        return fetch(this.buildUrl("run"), {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run code")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as RunCodeResponse)
    }

    public static runTest(snippet: RunnableCodeSnippet): Promise<RunCodeResponse> {
        return fetch(this.buildUrl("run_test"), {
            method: "post",
            body: snippet.toFormData(),
        })
            .then(resp => {
                if (resp.status != 200) {
                    throw new Error("Can't run test")
                }

                return resp
            })
            .then(resp => resp.json())
            .then(data => data as RunCodeResponse)
    }

    private static buildUrl(path: string) {
        if (this.server !== null && this.server !== undefined) {
            const server = this.server.endsWith('/') ? this.server.slice(0, -1) : this.server
            return `${server}/${path}`
        }

        return `/${path}`
    }
}
