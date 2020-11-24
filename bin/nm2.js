#!/usr/bin/env node

process.argv.push('--gulpfile')
process.argv.push(require.resolve('../lib/index.js'))
process.argv.push('--cwd')
process.argv.push(process.cwd())

console.log(process.argv)
console.log("gulp is running")

require('gulp/bin/gulp')
