INTERPRET WORDS TO GSQL
===

Interpret words to (deteriorated) google search query language.

## SAMPLE

INPUT
```
in:inbox subject:(one (two) three) four five
```

OUTPUT
```
{"in":["inbox"],"subject":["one","two","three"],"user":[],"address":[],"attachment":[],"start":[],"end":[],"free":["four","five"]}
```