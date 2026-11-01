# tools/migration — how Parsec 17's tree was cut from Parsec 16.3 (one-time; kept for the record)

    node extract.js <Parsec_16.3.html> <t12.html> <workdir>   # take the built file apart (skeleton, styles, scripts, statements, the test hook)
    python3 emit.py <workdir> <repo root>                      # write src/, styles/, assets/, vendor/, build/manifest.txt from the MAP tables
    node compare.js <old.html> <new.html>                      # prove a build means the same as another (see docs/MIGRATION-16-to-17.md)

`compare.js` is still useful: run it between two builds to see whether anything but comments and whitespace changed
(it reports the first differing token, the function that changed, or the load-time statement that moved).
`emit.py` points at the old `app/b9` sources for the CSS anchors; that path is the old workspace's.
