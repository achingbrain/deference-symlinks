const fs = require('fs-extra')
const path = require('path')

const maybeDereference = (filePath) => {
  const stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    dereferenceDirSync(filePath)
  } else if (stats.isSymbolicLink()) {
    dereferenceSync(filePath)
  }
}

const dereferenceSync = (symlinkPath) => {
  const realPath = fs.realpathSync(symlinkPath)

  console.info(`Replacing ${symlinkPath} with ${realPath}`)

  fs.removeSync(symlinkPath)
  fs.copySync(realPath, symlinkPath, {
    filter: (filePath) => {
      maybeDereference(filePath)

      return true
    }
  })
}

const dereferenceDirSync = (dir) => {
  if (!dir) {
    throw new Error('Please specify a directory')
  }

  fs.readdirSync(dir)
    .forEach(file => {
      const filePath = path.resolve(path.join(dir, file))
      maybeDereference(filePath)
    })
}

module.exports = dereferenceDirSync
