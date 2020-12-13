# monaco-utf8-length-incremental

Given a [Monaco](https://microsoft.github.io/monaco-editor/) editor widget, track how many UTF-8 bytes would be required to store the contents.

The byte count is kept updated incrementally by observing changes to the underlying model.

## To run:

```
$ yarn install --frozen-lockfile
$ yarn run start   # will start a webserver on localhost
```

All the important code is in "src/index.ts".
