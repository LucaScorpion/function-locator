import { FunctionLocator } from './FunctionLocator';

const loc = new FunctionLocator();
loc.locate(FunctionLocator).then((path) => {
  console.log(path);
  loc.close();
});
