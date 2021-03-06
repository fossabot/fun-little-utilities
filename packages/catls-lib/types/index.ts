import { MaybePromise } from 'typescript-miscellaneous'
import { ChildProcess as ChildProcessBase } from 'split-shell-buffer'
import { UnitType, EmptyArgumentHandlingMethod, ExitStatus, SymlinkResolution } from '../enums'

export interface CommandLineOptions {
  readonly cat: string
  readonly ls: string
  readonly dontFakeInteractive: boolean
  readonly handleEmptyArguments: EmptyArgumentHandlingMethod
  readonly followSymlink: string
  readonly symlinkResolution: SymlinkResolution
  readonly sharedArguments: CommandLineOptions.SubArgs
  readonly lsArguments: CommandLineOptions.SubArgs
  readonly catArguments: CommandLineOptions.SubArgs
}

export namespace CommandLineOptions {
  export type SubArgs = ReadonlyArray<string>
}

export namespace Main {
  export interface Param extends CommandLineOptions {
    readonly list: ReadonlyArray<string>
    readonly stdout: Writable
    readonly stderr: Writable
    readonly addStatusCode: StatusCodeAdder
    readonly spawn: Executor
    readonly fsPromise: FileSystemFunctions
  }

  export type StatusCodeAdder = (current: number, addend: number) => MaybePromise<number>

  export interface FileSystemFunctions extends
  SymlinkRoutingFunctions.FileSystemFunctions {}

  export interface Stats extends
    Unit.Stats,
    StatInfo.Stats,
    UnknownStatType.Stats {}
}

export namespace SymlinkRoutingFunctions {
  export interface FileSystemFunctions {
    readonly stat: StatGetter
    readonly lstat: StatGetter
    readonly readlink: LinkGetter
    readonly realpath: LinkGetter
  }

  export interface Return {
    readonly getStat: StatGetter
    readonly getLink: LinkGetter
    readonly getLoop: LoopGetter
  }

  export type StatGetter = Unit.Options.StatGetter
  export type LinkGetter = Unit.Options.LinkGetter
  export type LoopGetter = Unit.Options.LoopGetter
}

export namespace Unit {
  export interface Options {
    readonly name: string,
    readonly followSymlink: number
    readonly getStat: Options.StatGetter
    readonly getLink: Options.LinkGetter
    readonly getLoop: Options.LoopGetter
    readonly addStatusCode: Options.StatusCodeAdder
    readonly heading: Options.HeadingFunc
    readonly handleException: Options.Handler.Exception
    readonly handleSymlink: Options.Handler.Symlink
    readonly handleFile: Options.Handler.File
    readonly handleDirectory: Options.Handler.Directory
    readonly handleUnknown: Options.Handler.Unknown
  }

  export namespace Options {
    export type StatGetter = (name: string) => MaybePromise<Stats>
    export type LinkGetter = (name: string) => MaybePromise<string>
    export type LoopGetter = (body: LoopBody) => LoopBody
    export type StatusCodeAdder = (current: number, addend: number) => MaybePromise<number>
    export type HeadingFunc = (param: HeadingFunc.Param) => MaybePromise<void>

    export namespace HeadingFunc {
      export interface Param {
        readonly options: Options
        readonly name: string
      }
    }

    export namespace Handler {
      export type Exception = (param: Param.Exception) => Return
      export type Symlink = (param: Param.Symlink) => Return
      export type File = (param: Param.File) => Return
      export type Directory = (param: Param.Directory) => Return
      export type Unknown = (param: Param.Unknown) => Return

      export type Return = MaybePromise<number>

      export namespace Param {
        export interface Base {
          readonly type: UnitType
          readonly options: Options
        }

        export interface Exception extends Base {
          readonly type: UnitType.Exception
          readonly error: any
        }

        export interface Exist extends Base {
          readonly type: UnitType.Exist
          readonly stats: Main.Stats
        }

        export interface Symlink extends Exist {
          readonly type: UnitType.Symlink
          readonly content: string
          readonly target: string
        }

        export interface File extends Exist {
          readonly type: UnitType.File
        }

        export interface Directory extends Exist {
          readonly type: UnitType.Directory
        }

        export interface Unknown extends Exist {
          readonly type: UnitType.Unknown
        }
      }
    }
  }

  export interface Stats extends StatInfo.Stats, UnknownStatType.Stats {
    readonly isSymbolicLink: Stats.Method
    readonly isFile: Stats.Method
    readonly isDirectory: Stats.Method
  }

  export namespace Stats {
    export type Method = () => boolean
  }

  export type LoopBody = (
    name: string,
    followSymlink: number,
    visited: ReadonlyArray<string>
  ) => MaybePromise<number>
}

export namespace ShowExecData {
  export interface Param {
    readonly cmd: string
    readonly args: ReadonlyArray<string>
    readonly execute: Executor
    readonly writable: Writable
  }
}

export namespace EmptyArguments {
  export interface Param {
    readonly method: EmptyArgumentHandlingMethod
    readonly stream: Writable
  }

  export type Return =
    ExitStatus.Success |
    ExitStatus.InsufficientArguments
}

export namespace UnknownStatType {
  export interface Stats {
    isBlockDevice (): boolean
    isCharacterDevice (): boolean
    isFIFO (): boolean
    isSocket (): boolean
  }
}

export interface Executor {
  (cmd: string, args: ReadonlyArray<string>): MaybePromise<ChildProcess>
}

export namespace Executor {
  export interface Options {
    readonly spawn: Executor
    readonly dontFakeInteractive: boolean
  }
}

export interface Writable {
  write (data: string | Buffer): void
}

export interface ChildProcess extends ChildProcessBase<string | Buffer> {
  once (event: 'close', listener: (status: number, signal?: string | null) => void): void
}

export namespace StatInfo {
  export interface Stats {
    readonly size: number
    readonly mode: number
    readonly mtime: Stats.Date
    readonly atime: Stats.Date
    readonly ctime: Stats.Date
  }

  export namespace Stats {
    export interface Date {
      toISOString (): string
    }
  }
}
