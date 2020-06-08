import MockDate from 'mockdate'
import { UTC } from './'

describe('utils > UTC', () => {
  test('returns today if no date provided', () => {
    MockDate.set(new UTC('2020-01-03'))
    expect(new UTC().toISOString()).toBe('2020-01-03T00:00:00.000Z')
    MockDate.reset()
  })

  test('returns midnight on 1st January 2020', () => {
    expect(new UTC('2020-01-01').toISOString()).toBe('2020-01-01T00:00:00.000Z')
  })

  test('returns midnight on 1st February 2020', () => {
    expect(new UTC('2020-02-01').toISOString()).toBe('2020-02-01T00:00:00.000Z')
  })

  test('returns midnight on 1st March 2020', () => {
    expect(new UTC('2020-03-01').toISOString()).toBe('2020-03-01T00:00:00.000Z')
  })

  test('returns midnight on 1st April 2020', () => {
    expect(new UTC('2020-04-01').toISOString()).toBe('2020-04-01T00:00:00.000Z')
  })

  test('returns midnight on 1st May 2020', () => {
    expect(new UTC('2020-05-01').toISOString()).toBe('2020-05-01T00:00:00.000Z')
  })

  test('returns midnight on 1st June 2020', () => {
    expect(new UTC('2020-06-01').toISOString()).toBe('2020-06-01T00:00:00.000Z')
  })

  test('returns midnight on 1st July 2020', () => {
    expect(new UTC('2020-07-01').toISOString()).toBe('2020-07-01T00:00:00.000Z')
  })

  test('returns midnight on 1st August 2020', () => {
    expect(new UTC('2020-08-01').toISOString()).toBe('2020-08-01T00:00:00.000Z')
  })

  test('returns midnight on 1st September 2020', () => {
    expect(new UTC('2020-09-01').toISOString()).toBe('2020-09-01T00:00:00.000Z')
  })

  test('returns midnight on 1st October 2020', () => {
    expect(new UTC('2020-10-01').toISOString()).toBe('2020-10-01T00:00:00.000Z')
  })

  test('returns midnight on 1st November 2020', () => {
    expect(new UTC('2020-11-01').toISOString()).toBe('2020-11-01T00:00:00.000Z')
  })

  test('returns midnight on 1st December 2020', () => {
    expect(new UTC('2020-12-01').toISOString()).toBe('2020-12-01T00:00:00.000Z')
  })
})
