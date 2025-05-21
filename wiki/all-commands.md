# Commands

## Convention

### Variables

#### Default

By default the variables are represented by quoted text (double quote "). e.g.:

```
print {text}

print "hello world"
```

#### Script variable

The variable called `script` by default is represented by `[\s\S]+?`. e.g.:

```
eval
  {script}
end eval

eval
  print "First line"
  print "Second line"
  print "Third line"
end eval
```

#### Optional variable

To make the variable optional you can include the suffix `?`. e.g.: `{variable?}`

## Default

### Print text to the standard output

```
print {text}
```

### Set variable

```
set {variable} to {value}
```

### Load JSON to context

Specify JSON as a block.

```
context load
  {json}
end load
```

Load JSON from a file.

```
context load file {path}
```

### Evaluate facilitator script

```
eval
  {script}
end eval
```

### Define scripts

```
define {name}
  {script}
end define
```

```
define "hello {name}
  print "hello {{name}}!"
end define
```

### Install skill

It's possible to "learn" new skills. It's required to install a global node module (that exports `install` function).

```
learn skill {name}
```

#### Create custom skill

the module name must follow the convention `<name>-facilitator-skill`.

```json
{
  "name": "test-facilitator-skill",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

```js
export function install(facilitator) {
  facilitator.register("hello {name}", name => {
    console.log("hello", name);
  });
}
```

#### Install module

```
npm install --global test-facilitator-skill
```

#### Use skill

create file test.txt:

```text
learn skill "test"

hello "John"
```

execute it:

```
facilitator execute test.txt
```
