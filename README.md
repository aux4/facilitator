# 💬 facilitator

Natural language as a programming language

## Installation

```bash
npm install --global facilitator
```

## Usage

### Command-line

test.txt

```txt
set "firstName" to "John"
set "lastName" to "Doe"
print "Hello {{firstName}} {{lastName}}"
```

```bash
facilitator execute test.txt
```

[See all commands](wiki/all-commands.md)

### Node.js

#### Create custom expression

```js
import Facilitator, { install } from "facilitator";

const facilitator = new Facilitator();
install(facilitator);

facilitator.register("say hello to {firstName} {lastName}", (firstName, lastName) => {
  console.log(`Hello ${firstName} ${lastName}!`);
});

const script = `
say hello to "John" "Doe"
`;

facilitator.exec(script, { currentDate: new Date() });
```

Output:

```
Hello John Doe
```

#### Use optional variable with custom regex

To make the variable optional you can include the `?` as suffix of the variable. e.g.: `{count?}`

By default the variables are represented by quoted text (e.g.: `"value"`), you can redefine the variable,
the third parameter of register receives an object with the regular expression to represent the variable:

```js
{
  count: /\d+/;
}
```

```js
import Facilitator, { install } from "facilitator";

const facilitator = new Facilitator();
install(facilitator);

facilitator.register(
  "increment\\s*{count?}",
  (count, context) => {
    let value = context.count || parseInt(count);
    value += 1;
    context.count = value;
    console.log("increment", value);
  },
  {
    count: /\d+/
  }
);

const script = `
increment 5
increment
increment
increment
increment
`;

facilitator.exec(script, {});
```

Output:

```
increment 6
increment 7
increment 8
increment 9
increment 10
```
