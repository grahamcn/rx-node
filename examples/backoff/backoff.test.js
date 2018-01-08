/* eslint-env mocha */
const Rx = require('rxjs')
const chai = require('chai')

const {backoff} = require('./backoff')

describe('Backoff', () => {
  let scheduler

  beforeEach(() => {
    scheduler = new Rx.TestScheduler((actual, expected) => {
      chai.assert.deepEqual(actual, expected)
    })
  })

  afterEach(() => {
    scheduler.flush()
  })

  // **************************************************************************
  // Example 1
  // **************************************************************************
  it(`should return a stream that returns a value for every error, backing off,
        throwing an error when attempts are used up`, () => {
    const error1 = 'some error 1'
    const error2 = 'some error 2'

    const errorStream =    '------e------f'
    const expectedStream = '--------1----#'

    const errorStreamValues = {
      'e': error1,
      'f': error2,
    }

    const expectedError = error2
    const expectedStreamValues = { '1': 0 } // back off returns the value 0 to indicate retry.

    // create input error stream
    const error$ = scheduler.createHotObservable(errorStream, errorStreamValues)

    // our function to test
    const source = backoff(2, error$, 20, scheduler)

    // expect our stream to be:
    // after 80ms, next '1' ie a signifier to retry - backoff is used to manage retries
    // this is because after 60ms we receive a value on our input error stream - we try again 20ms later
    // after 130ms, an error is THROWN by the returned stream, not returned as a stream value.
    // after 2 attempts, we stop retrying and throw the error, represented by '#'
    // we also need to check the value of # is error2 rather than error1
    scheduler.expectObservable(source).toBe(expectedStream, expectedStreamValues, expectedError)
  })

  // ********************************************************************************
  // Example 2 - up the interval to 50ms to show how this changes the marble diagrams
  // ********************************************************************************
  it(`should return a stream that returns a value for every error, backing off,
      throwing an error when attempts are used up`, () => {
    const error1 = 'some error 1'
    const error2 = 'some error 2'

    const errorStream    = '-e-----------f'
    const expectedStream = '------1------#'

    const errorStreamValues = {
      'e': error1,
      'f': error2,
    }

    const expectedStreamValues = { '1': 0 }
    const expectedError = error2

    // create error stream
    const error$ = scheduler.createHotObservable(errorStream, errorStreamValues)

    // our function to test, 50ms interval
    const source = backoff(2, error$, 50, scheduler)

    // our input stream gives us an error after 10ms
    // so after 60ms, next '1' ie a signifier to retry - backoff is used to manage retries
    // after 130ms, we receieve another error value in the input stream
    // so after 130ms, our backoff function throws value from the input error stream
    scheduler.expectObservable(source).toBe(expectedStream, expectedStreamValues, expectedError)
  })

  // **************************************************************************
  // Example 3 - include a third attempt, with more backoffs
  // **************************************************************************
  it(`should return a stream that returns a value for every error, backing off,
      throwing an error when attempts are used up`, () => {

    const error1 = 'some error 1'
    const error2 = 'some error 2'
    const error3 = 'some error 3'

    const errorStream    = '------e---f--------g'
    const expectedStream = '---------1------2--#'

    const errorStreamValues = {
      'e': error1,
      'f': error2,
      'g': error3,
    }
    const error$ = scheduler.createHotObservable(errorStream, errorStreamValues)

    const expectedStreamValues = { '1': 0, '2': 0 }
    const expectedStreamError = error3

    // our function to test. 30ms interval.
    const source = backoff(3, error$, 30, scheduler)

    // an error is thrown after 60ms.
    // so the backoff emits a value 30ms after that - '1'
    // an error is then emitted after 100ms on the source stream
    // so the back off emits a value 60ms after that - at 160ms - value '2'
    // after 190ms we receive another error and have used up attempts, so
    // the error is thrown immediately - represented by '#', the value by error3.
    scheduler.expectObservable(source).toBe(expectedStream, expectedStreamValues, expectedStreamError)
  })
})
