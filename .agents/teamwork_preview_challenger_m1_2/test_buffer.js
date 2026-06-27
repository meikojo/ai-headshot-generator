const assert = require('assert');

async function run() {
  const buf = Buffer.from("hello world");
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  
  const b = Buffer.from(ab);
  console.log("Buffer content:", b.toString());
  assert(b.toString() === "hello world");
  console.log("All good!");
}

run();
