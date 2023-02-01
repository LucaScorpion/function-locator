import { FunctionLocator } from './FunctionLocator';

const loc = new FunctionLocator();
loc.locate(FunctionLocator).then(console.log);
