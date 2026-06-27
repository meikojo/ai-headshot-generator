const fs = require('fs');
const code = fs.readFileSync('node_modules/@imgly/background-removal/dist/index.cjs', 'utf8');
const match = code.match(/https:\/\/staticimgly\.com[^\"]+/g);
console.log(match);
