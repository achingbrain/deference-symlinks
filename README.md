# dereference-symlinks

Because sometimes you need actual files.

## Usage

### Command line

```
$ dereference-symlinks ./node_modules
```

### Javascript

```javascript
import dereferenceSymlinks from 'dereference-symlinks'
import { join } from 'path'

dereferenceSymlinks(join(process.cwd(), 'node_modules'))
```

In the above examples all symlinks in the `node_modules` folder will be replaced with the files they link to except for hidden files and folders (e.g. the contents of the `.bin` directory).
