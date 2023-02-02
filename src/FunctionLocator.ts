import { Inspector } from './Inspector';
import { Debugger } from 'inspector';
import { randomString } from './randomString';

const FILE_URL_PREFIX = 'file://';

// TODO: move this to a separate .d.ts file?
declare global {
  // Here we do need to use var, otherwise the declare statement doesn't work.
  // Though this should really be moved to a separate file.
  // eslint-disable-next-line no-var
  var functionLocator: Record<string, unknown> | undefined;
}

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

    global.functionLocator = global.functionLocator || {};
    const id = randomString();
    global.functionLocator[id] = fn;

    const evaluated = await this.inspector.runtimeEvaluate(
      `global.functionLocator['${id}']`
    );
    const objectId = evaluated.result.objectId;
    if (!objectId) {
      throw new Error('No objectId was returned from evaluate call.');
    }

    try {
      const props = await this.inspector.runtimeGetProperties(objectId);
      const funcLoc = props.internalProperties?.find(
        (p) => p.name === '[[FunctionLocation]]'
      );
      const scriptId = funcLoc?.value?.value.scriptId;
      if (!scriptId) {
        throw new Error(`No script id was found for object id: ${objectId}`);
      }

      const url = this.parsedScripts[scriptId].url;
      return url.startsWith(FILE_URL_PREFIX)
        ? url.substring(FILE_URL_PREFIX.length)
        : url;
    } finally {
      delete global.functionLocator[id];
      await this.inspector.runtimeReleaseObject(objectId);
    }
  }

  public close(): void {
    this.inspector.disconnect();
  }
}
