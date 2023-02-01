import { Inspector } from './Inspector';
import { Debugger } from 'inspector';
import { randomString } from './randomString';

const ID_PREFIX = '__function-locator-';

const FILE_URL_PREFIX = 'file://';

export class FunctionLocator {
  private readonly inspector = new Inspector();

  private parsedScripts: Record<string, Debugger.ScriptParsedEventDataType> =
    {};

  public constructor() {
    this.inspector.session.addListener('Debugger.scriptParsed', (res) => {
      this.parsedScripts[res.params.scriptId] = res.params;
    });
    this.inspector.connect();
  }

  public async locate(fn: unknown): Promise<string> {
    if (typeof fn !== 'function') {
      throw new Error(`Can only locate functions, not ${typeof fn}`);
    }

    // TODO: cache results.

    // TODO
    const id = `${ID_PREFIX}${randomString()}`;
    // @ts-ignore
    global[id] = fn;

    const evaluated = await this.inspector.runtimeEvaluate(`global['${id}']`);
    const objectId = evaluated.result.objectId;
    if (!objectId) {
      throw new Error('No objectId was returned from evaluate call.');
    }

    try {
      const props = await this.inspector.runtimeGetProperties(objectId);
      const funcLoc = props.internalProperties?.find((p) => p.name === '[[FunctionLocation]]');
      const scriptId = funcLoc?.value?.value.scriptId;
      if (!scriptId) {
        throw new Error(`No script id was found for object id: ${objectId}`);
      }

      const url = this.parsedScripts[scriptId].url;
      return url.startsWith(FILE_URL_PREFIX) ? url.substring(FILE_URL_PREFIX.length) : url;
    } finally {
      // TODO
      // @ts-ignore
      delete global[id];

      await this.inspector.runtimeReleaseObject(objectId);
    }
  }
}
