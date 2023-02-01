import { Runtime, Session } from 'inspector';
import { promisify } from 'util';

export class Inspector {
  public readonly session: Session;

  private readonly post: <T>(
    method: string,
    params?: Record<string, unknown>
  ) => Promise<T>;

  public constructor() {
    this.session = new Session();

    // Here we do need to use any, otherwise this.post can't have a generic T.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.post = promisify<string, any>(this.session.post).bind(this.session);
  }

  public connect(): void {
    this.session.connect();
    this.post('Debugger.enable');
  }

  public disconnect(): void {
    this.session.disconnect();
  }

  public runtimeEvaluate(
    expression: string
  ): Promise<Runtime.EvaluateReturnType> {
    return this.post('Runtime.evaluate', { expression });
  }

  public runtimeGetProperties(
    objectId: Runtime.RemoteObjectId
  ): Promise<Runtime.GetPropertiesReturnType> {
    return this.post('Runtime.getProperties', { objectId });
  }

  public async runtimeReleaseObject(
    objectId: Runtime.RemoteObjectId
  ): Promise<void> {
    return this.post('Runtime.releaseObject', { objectId });
  }
}
