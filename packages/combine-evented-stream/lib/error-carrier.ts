import { EventedStream } from 'evented-stream-types'
import Base from './error-base'

class ErrorCarrier<
  Stream extends EventedStream<Chunk, Error>,
  Error = Stream extends EventedStream<any, infer X> ? X : any,
  Chunk = Stream extends EventedStream<infer X, any> ? X : any
> extends Base {
  public readonly error: Error
  public readonly stream: Stream

  constructor (error: Error, stream: Stream) {
    super(String(error))
    this.error = error
    this.stream = stream
  }

  protected getName (): string {
    return 'ErrorCarrier'
  }
}

export = ErrorCarrier