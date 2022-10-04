const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const cwd = process.cwd()

const isDev = process.env.RUN_DEV === 'true'

const isRelease = process.env.RUN_RELEASE === 'true'

const getImageJson = (dir) => path.resolve(cwd, `images/${dir}/package.json`)

const run = (command, options) =>
  execSync(command, {
    stdio: 'inherit',
    ...(options || {})
  })

const dirs = fs
  .readdirSync(path.resolve(cwd, 'images'))
  .filter((dir) => !dir.includes('.'))

const build = (dir) => {
  const { version, name } = require(getImageJson(dir))
  // run(
  //   `docker build -t ${name}:latest -t ${name}:${version} --no-cache --rm .`,
  //   {
  //     cwd: path.resolve(cwd, `images/${dir}`)
  //   }
  // )
  if (!isRelease) return
  run(`docker push ${name}:latest`)
  run(`docker push ${name}:${version}`)
}

const dev = () => {
  console.log(`example dev...`)
  run('docker-compose up -d', { cwd: path.resolve(cwd, 'example') })
}

try {
  dirs.forEach(build)
  isDev && dev()
} catch (error) {
  console.error(`[Build Image Error]: `, error)
}
