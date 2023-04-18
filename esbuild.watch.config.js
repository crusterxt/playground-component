const path = require("path");
const esbuild = require("esbuild");
const { exec } = require("child_process");

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
  outfile: path.resolve(__dirname, "./test/vlang-playground.css"),
  target: "esnext",
  entryPoints: ["./src/styles/index.css"],
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
  keepNames: true,
  metafile: true,
  outfile: path.resolve(__dirname, "./test/playground.js"),
  sourcemap: true,
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

      exec("v run ./bundle-js.v", (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      })
    },
  },
});

printResult(codeResult?.metafile?.outputs || {});
