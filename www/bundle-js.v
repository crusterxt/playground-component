// this is work and it is not a joke
module main

import os

files := [
	'../codemirror/codemirror.js',
	'../codemirror/closebrackets.js',
	'../codemirror/comment.js',
	'../codemirror/continuecomment.js',
	'../codemirror/matchbrackets.js',
	'../codemirror/show-hint.js',
	'./public/playground.js',
]

contents := files
	.map(fn (it string) string {
		return os.read_file(it) or { panic(err) }
	})
	.join('\n')

bundle_path := "../dist/vlang-playground.js"
os.write_file(bundle_path, contents) or { panic(err) }

result := os.execute('npx uglifyjs --output ${bundle_path} ${bundle_path}')
if result.exit_code != 0 {
	println(result.output)
	panic('npx uglifyjs failed')
}
