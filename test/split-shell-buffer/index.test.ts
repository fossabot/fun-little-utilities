import Splitter from 'split-shell-buffer'
import { normalText, styledText } from './.lib/data'
import spawnExecutable from './.lib/spawn-executable'

it('correctly indents normal text', async () => {
  const indentedNormalText = [
    '  abc def ghi',
    '  jkl mno pqrs'
  ].join('\n')

  expect(
    await Splitter
      .fromString(normalText)
      .withIndent(2)
      .toString()
  ).toBe(
    await Splitter
      .fromString(indentedNormalText)
      .toString()
  )
})

it('indented styled text matches snapshot', async () => {
  expect(
    await Splitter
      .fromString(styledText)
      .withIndent(2)
      .toString()
  ).toMatchSnapshot()
})

it('indentation part of indented styled text only contain spaces and leading reset sequence', async () => {
  const indent = 4
  const regex = /^(\x1B\[(0|;)*m)? {4}/

  expect(
    (
      await Splitter
        .fromString(styledText)
        .withIndent(indent)
        .toString()
    )
      .split('\n')
      .every(text => regex.test(text))
  ).toBe(true)
})

describe('works with child processes', () => {
  it('via fromEventedStream() on stdout', async () => {
    expect(
      await Splitter
        .fromEventedStream(spawnExecutable().stdout)
        .toString()
    ).toEqual([
      'stdout 0',
      'stdout 1',
      'stdout 2',
      ''
    ].join('\n'))
  })
})
