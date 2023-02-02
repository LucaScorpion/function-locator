# Function Locator

## Usage

```typescript
import { FunctionLocator } from '@luca_scorpion/function-locator';

const loc = new FunctionLocator();
loc.locate(FunctionLocator).then((path) => {
  console.log(path);
  loc.close();
});
```

Output:

```text
/home/luca/Projects/function-locator/src/FunctionLocator.ts
```

Note that `close` should only be called after all `locate` promises have been resolved.
