import { ITheme, Dark, Light } from "../themes";

type ThemeCallback = (newTheme: ITheme) => void;

/**
 * ThemeManager is responsible for managing the theme of the playground.
 * It will register a callback to the change theme button and will update the
 * theme when the user clicks on the button.
 * It will also update the theme when the user changes the theme in the URL.
 *
 * @param queryParams The query params of the URL.
 * @param changeThemeButton The button to change the theme or null.
 *
 * @example
 * const changeThemeButton = document.querySelector('.js-change-theme')
 * const queryParams = new QueryParams(window.location.search);
 * const themeManager = new ThemeManager(queryParams, changeThemeButton)
 *
 * themeManager.registerOnChange((theme) => {
 *   // Do something with the theme
 * })
 */
export class ThemeManager {
    private static themes: ITheme[] = [new Dark(), new Light()]
    private currentTheme: ITheme | null = null
    private onChange: ThemeCallback[] = []
    private readonly changeThemeButton: Element | null = null
    private readonly predefinedTheme: ITheme | null = null

    constructor(predefinedTheme: ITheme | null = null) {
        this.predefinedTheme = predefinedTheme
        this.changeThemeButton = document.querySelector(".js-playground__action-change-theme")
    }

    public registerOnChange(callback: ThemeCallback): void {
        this.onChange.push(callback)
    }

    public loadTheme(): void {
        if (this.predefinedTheme !== null && this.predefinedTheme !== undefined) {
            this.turnTheme(this.predefinedTheme)
            return
        }

        // By default, we turn the dark theme.
        this.turnTheme(new Dark())
    }

    private turnTheme(theme: ITheme): void {
        this.currentTheme = theme
        this.onChange.forEach(callback => callback(theme))
    }

    public turnDarkTheme(): void {
        this.turnTheme(new Dark())
    }

    public turnLightTheme(): void {
        this.turnTheme(new Light())
    }

    public toggleTheme(): void {
        if (!this.currentTheme) {
            return
        }

        if (this.currentTheme.name() === "light") {
            this.turnDarkTheme()
        } else {
            this.turnLightTheme()
        }
    }

    public static findTheme(name: string) {
        let foundThemes = this.themes.filter(theme => theme.name() === name)
        const theme = foundThemes[0]
        if (theme === undefined) {
            throw new Error(`Theme ${name} not found`)
        }
        return theme
    }

}
