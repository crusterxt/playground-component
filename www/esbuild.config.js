const path = require("path");
const esbuild = require("esbuild");

function printResult(result) {
  Object.keys(result).forEach((fileName) => {
    // convert to kilobyte
    const fileSize = result[fileName].bytes / 1000;
    console.log(`${fileName} => ${fileSize} Kb`);
  });
}

const styleResult = esbuild.build({
  bundle: true,
  minify: true,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/style.css"),
  target: "esnext",
  entryPoints: ["./css/index.css"],
  loader: {
    '.svg': 'base64',
  },
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('watch build failed:', error)
      } else {
        console.log('watch build succeeded:', result)
      }
    },
  },
});

printResult(styleResult?.metafile?.outputs || {});

const codeResult = esbuild.build({
  // minify: true,
  bundle: true,
  // keepNames: false,
  metafile: true,
  outfile: path.resolve(__dirname, "./public/vlang-playground.js"),
  platform: "browser",
  target: "es6",
  external: ["codemirror"],
  entryPoints: ["./src/main.ts"],
  watch: {
    onRebuild(error, result) {
      if (error) {
        console.error('watch build failed:', error)
      } else {
        console.log('watch build succeeded:', result)
      }
    },
  },
});

printResult(codeResult?.metafile?.outputs || {});
