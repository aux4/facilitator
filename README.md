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
facilitator test.txt
```

### Node.js

```js
import Facilitator, { install } from "facilitator";

const facilitator = new Facilitator();
install(facilitator);

facilitator.register("say hello to {firstName} {lastName}", (firstName, lastName) => {
  console.log(`Hello ${firstName} ${lastName}!`);
});

facilitator.register("set today's date", context => {
  context.today = context.currentDate || new Date();
});

const script = `
say hello to "John" "Doe"
set today's date
print "Today is {{today}}"
`;

facilitator.exec(script, { currentDate: new Date() });
```
