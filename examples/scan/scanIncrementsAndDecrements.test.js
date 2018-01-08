/* eslint-env mocha */
import Rx from 'rxjs'
import {chai} from '../../../../helpers'

import {scanIncrementsAndDecrements} from './scanIncrementsAndDecrements'

describe('scanIncrementsAndDecrements', () => {
  let testScheduler

  beforeEach('Set up an instance of the test scheduler', () => {
    // Creates a new virtual time test scheduler.
    // TestScheduler accepts a function to test for deep equality
    // We're passing Chai's deep equal here.
    testScheduler = new Rx.TestScheduler(chai.assert.deepEqual)
  })

  afterEach('Flush scheduler', () => {
    // Flushing the test scheduler will play through the observables as defined by the
    // marble diagrams in virtual time, producing the output stream for comparison with
    // our expected stream, via deep equality.
    // The test scheduler will check the values are returned at the correct time (in virtual time),
    // The deep equality fn we provide to it check will be used to compare the values
    testScheduler.flush()
  })

  it('should start from 0 and sum increment and decrement events', () => {
    const upEvents       = '--x----x--x---'
    const downEvents     = '----x-------x-'
    const expectedStream = 'a-b-a--b--c-b-'

    const expectedStreamValueMap = {
      a: { count: 0 },
      b: { count: 1 },
      c: { count: 2 },
    }

    // create mock streams from our marble diagrams.
    const up$ = testScheduler.createHotObservable(upEvents)
    const down$ = testScheduler.createHotObservable(downEvents)

    const state$ = scanIncrementsAndDecrements({up$, down$})

    // assertion, which is evaluated on with the scheduler is flushed
    testScheduler.expectObservable(state$).toBe(expectedStream, expectedStreamValueMap)
  })
})
