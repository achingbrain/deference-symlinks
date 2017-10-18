import test from 'ava'
import fs from 'fs-extra'
import path from 'path'
import dereference from '../'

test('objects to missing directory argument', t => {
  t.throws(() => dereference(), /Please specify a directory/)
})

const dirPath = path.join(process.cwd(), 'tmp')
const subDirPath = path.join(dirPath, 'sub')

const files = {
  a: path.join(dirPath, 'a.txt'),
  b: path.join(dirPath, 'b.txt'),
  c: path.join(subDirPath, 'c.txt'),
  d: path.join(dirPath, 'd.txt'),
  e: path.join(subDirPath, 'e.txt'),
  f: path.join(dirPath, 'f.txt')
}

test.before(() => {
  if (fs.existsSync(dirPath)) {
    fs.removeSync(dirPath)
  }

  fs.mkdir(dirPath)
  fs.mkdir(subDirPath)

  fs.writeFileSync(files.a, 'a')
  fs.writeFileSync(files.b, 'b')
  fs.writeFileSync(files.c, 'c')

  fs.symlinkSync(files.a, files.d)
  fs.symlinkSync(files.b, files.e)
  fs.symlinkSync(files.c, files.f)
})

test.after.always(() => {
  fs.removeSync(dirPath)
})

test('should defereference symlinks', t => {
  t.truthy(fs.lstatSync(files.d).isSymbolicLink())
  t.truthy(fs.lstatSync(files.e).isSymbolicLink())
  t.truthy(fs.lstatSync(files.f).isSymbolicLink())

  dereference(dirPath)

  t.is('a', fs.readFileSync(files.d, 'utf8'))
  t.is('b', fs.readFileSync(files.e, 'utf8'))
  t.is('c', fs.readFileSync(files.f, 'utf8'))

  t.falsy(fs.lstatSync(files.d).isSymbolicLink())
  t.falsy(fs.lstatSync(files.e).isSymbolicLink())
  t.falsy(fs.lstatSync(files.f).isSymbolicLink())
})
