const fs = require('fs')

const APP_PACKAGE_FILE = './app/package.json'
const appPackage = require(APP_PACKAGE_FILE)

const version = require('./package.json').version

console.log(`bumped app/package.json from ${appPackage.version} to ${version}`)

fs.writeFileSync(APP_PACKAGE_FILE, `${JSON.stringify(
  Object.assign(appPackage, {version}),
  null,
  2
)}\n`)
