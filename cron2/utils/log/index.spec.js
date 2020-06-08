import { bold, green, blue, red } from 'colorette'
import { log, loaded, saved, info, error } from './'

describe('utils > log > log', () => {
  it('logs to console', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    log('Test')
    expect(spy).toHaveBeenCalledWith('Test')
    spy.mockRestore()
  })
})

describe('utils > log > loaded', () => {
  it('logs to console', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    loaded('Test')
    expect(spy).toHaveBeenCalledWith(`${bold(green('LOADED'))} Test`)
    spy.mockRestore()
  })
})

describe('utils > log > saved', () => {
  it('logs to console', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    saved('Test')
    expect(spy).toHaveBeenCalledWith(`${bold(green(' SAVED'))} Test`)
    spy.mockRestore()
  })
})

describe('utils > log > info', () => {
  it('logs to console', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()
    info('Test')
    expect(spy).toHaveBeenCalledWith(`${bold(blue('  INFO'))} Test`)
    spy.mockRestore()
  })
})

describe('utils > log > error', () => {
  it('returns formatted string for throws', () => {
    expect(error('Test')).toBe(`${bold(red('ERROR'))} Test`)
  })
})
