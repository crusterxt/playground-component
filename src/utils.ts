export const toBool = (value: string | null | undefined): boolean | undefined => {
    if (value === null || value === undefined) {
        return undefined
    }
    return value === "true"
}

export const definedProps = (obj: any) => Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => v !== undefined),
)
