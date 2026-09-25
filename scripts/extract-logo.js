const fs = require("fs")
const html = fs.readFileSync("public/audiometria.html", "utf8")
const marker = "data:image/png;base64,"
const start = html.indexOf(marker)
if (start < 0) {
  console.error("logo not found")
  process.exit(1)
}
const b64Start = start + marker.length
const end = html.indexOf('"', b64Start)
const buf = Buffer.from(html.slice(b64Start, end), "base64")
fs.writeFileSync("public/logo-renteria.png", buf)
console.log("bytes", buf.length)
