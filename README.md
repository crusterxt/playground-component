# V Playground Component

[![Association Official Project][AssociationOfficialBadge]][AssociationUrl]
[![NPM version][NpmVersionBadge]][NpmUrl]

![Playground Component Cover](images/cover.png)

Component that creates V-aware editors capable of running code from HTML block elements.
It uses [V Playground](https://play.vosca.dev) as a backend.
Backend sources can be found
in [V Playground repository](https://github.com/vlang-association/playground).

Mostly inspired by [Kotlin Playground](https://github.com/JetBrains/kotlin-playground).

## Installation

### Use CDN

Insert a `<script>` element into your page and specify what elements should be converted in
its `data-selector` attribute.

```html
<script src="https://unpkg.com/vlang-playground@1" data-selector="code"></script>
```

Add CSS to your page:

```html
<link rel="stylesheet" href="https://unpkg.com/vlang-playground@1/dist/vlang-playground.css">
```

### Use downloaded files

Download the latest version of the playground from
[release](https://github.com/vlang-association/playground-component/releases/tag/v1.1.1)
page.
Or build it
[yourself](#build-from-sources).

Add the following script to your page:

```html
<script src="vlang-playground.js" data-selector="code"></script>
```

Add CSS to your page:

```html
<link rel="stylesheet" href="vlang-playground.css">
```

And that's it!

## Build from sources

```bash
git clone https://github.com/vlang-association/playground-component
cd playground-component
npm install
npm run prod
```

Build files will be located in **dist/** directory.

## License

This project is under the **MIT License**.
See the
[LICENSE](https://github.com/vlang-association/playground-component/blob/master/LICENSE)
file for the full license text.

[AssociationOfficialBadge]: https://vosca.dev/badge.svg

[NpmVersionBadge]: https://img.shields.io/npm/v/vlang-playground.svg

[AssociationUrl]: https://vosca.dev

[NpmUrl]: https://www.npmjs.com/package/vlang-playground
