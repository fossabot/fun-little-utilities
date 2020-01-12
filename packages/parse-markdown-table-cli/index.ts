import { MarkdownCellTable, MarkdownObjectTable } from 'parse-markdown-table'
import { Console } from 'simple-fake-console'

export interface StdinReader {
  (): Promise<string>
}

export const enum RowType {
  List = 'list',
  Dict = 'dict'
}

export const enum IndentType {
  Tab = 'tab',
  Space = 'space',
  None = 'none'
}

export interface MainParam {
  readonly console: Console
  readonly getStdIn: StdinReader
  readonly rowType: RowType
  readonly indentType: IndentType
  readonly indentSize: number
}

export const enum Status {
  Success = 0,
  Failure = 1
}

export async function main (options: MainParam): Promise<Status> {
  const indent = getIndentArgument(options.indentType, options.indentSize)
  const text = await options.getStdIn()
  const object = getOutputObject(text, options.rowType)
  const json = JSON.stringify(object, undefined, indent)
  options.console.info(json)
  return Status.Success
}

export function getIndentArgument (type: IndentType, size: number): '\t' | number | undefined {
  switch (type) {
    case IndentType.Tab:
      return '\t'
    case IndentType.Space:
      return size
    case IndentType.None:
      return undefined
  }
}

export function getOutputObject (text: string, type: RowType) {
  switch (type) {
    case RowType.Dict:
      return Array.from(new MarkdownObjectTable(text))
    case RowType.List:
      return new MarkdownCellTable(text)
  }
}
