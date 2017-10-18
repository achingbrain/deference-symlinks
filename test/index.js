import test from 'ava'
import fs from 'fs-extra'
import path from 'path'
import dereference from '../'

test('objects to missing directory argument', t => {
  t.throws(() => dereference(), /Please specify a directory/)
})

const tmpDirPath = path.join(process.cwd(), 'tmp')
const dirPath = path.join(tmpDirPath, 'test')
const subDirPath = path.join(dirPath, 'sub')
const otherDirPath = path.join(tmpDirPath, 'other')
const symlinkedOtherDirPath = path.join(dirPath, 'link')

const files = {
  a: path.join(dirPath, 'a.txt'),
  b: path.join(dirPath, 'b.txt'),
  c: path.join(subDirPath, 'c.txt'),
  d: path.join(dirPath, 'd.txt'),
  e: path.join(subDirPath, 'e.txt'),
  f: path.join(dirPath, 'f.txt'),
  g: path.join(otherDirPath, 'g.txt'),
  h: path.join(otherDirPath, 'h.txt')
}

test.before(() => {
  if (fs.existsSync(tmpDirPath)) {
    fs.removeSync(tmpDirPath)
  }

  fs.mkdirSync(tmpDirPath)
  fs.mkdirSync(dirPath)
  fs.mkdirSync(subDirPath)
  fs.mkdirSync(otherDirPath)

  fs.writeFileSync(files.a, 'a')
  fs.writeFileSync(files.b, 'b')
  fs.writeFileSync(files.c, 'c')
  fs.writeFileSync(files.g, 'g')

  fs.symlinkSync(files.a, files.d)
  fs.symlinkSync(files.b, files.e)
  fs.symlinkSync(files.c, files.f)
  fs.symlinkSync(files.a, files.h)

  fs.symlinkSync(otherDirPath, symlinkedOtherDirPath)
})

test.after.always(() => {
  fs.removeSync(tmpDirPath)
})

test('should defereference symlinks', t => {
  t.truthy(fs.lstatSync(files.d).isSymbolicLink())
  t.truthy(fs.lstatSync(files.e).isSymbolicLink())
  t.truthy(fs.lstatSync(files.f).isSymbolicLink())
  t.truthy(fs.lstatSync(symlinkedOtherDirPath).isSymbolicLink())
  t.truthy(fs.lstatSync(files.h).isSymbolicLink())

  dereference(dirPath)

  t.is('a', fs.readFileSync(files.d, 'utf8'))
  t.is('b', fs.readFileSync(files.e, 'utf8'))
  t.is('c', fs.readFileSync(files.f, 'utf8'))
  t.is('g', fs.readFileSync(files.g, 'utf8'))
  t.is('a', fs.readFileSync(files.h, 'utf8'))

  t.falsy(fs.lstatSync(files.d).isSymbolicLink())
  t.falsy(fs.lstatSync(files.e).isSymbolicLink())
  t.falsy(fs.lstatSync(files.f).isSymbolicLink())
  t.falsy(fs.lstatSync(files.g).isSymbolicLink())
  t.falsy(fs.lstatSync(files.h).isSymbolicLink())
  t.falsy(fs.lstatSync(symlinkedOtherDirPath).isSymbolicLink())
})
