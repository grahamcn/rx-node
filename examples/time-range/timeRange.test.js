/* eslint-env mocha */
const Rx = require('rxjs')
const chai = require('chai')

import {timeRange} from './timeRange'

describe('Testing using schedulers', () => {
  it('should allow us to play through time in no time', () => {
    // verbose version (with value comparison logging):
    let source, values

    const scheduler = new Rx.TestScheduler((actual, expected) => {
      console.log('Actual:', actual, '\n\n', 'Expected:', expected) // eslint-disable-line
      chai.assert.deepEqual(actual, expected)
    })

    // using an interval of 30ms: '---' represents 3 units of 10ms ('-' represents 10ms)
    source = timeRange(2, 8, 30, scheduler)

    // on frame 0 emit nothing. first frame is usually called the "zero frame"
    // on frame 10 emit nothing
    // on frame 20 emit nothing
    // on frame 30 emit the value represented by the 2 character, as per the value map
    // ... etc
    values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 }
    scheduler.expectObservable(source).toBe('---2--3--4--5--6--7--(8|)', values)


    // **************************************************************
    // adjust the interval to 50ms: ----- represents 5 units of 10ms.
    // note the effect on the expected marble diagram: '-' = 10ms
    // also changed the value keys and start/end values as an example.
    source = timeRange(5, 7, 50, scheduler)
    values = { 'a': 5, 'b': 6, 'c': 7 }
    scheduler.expectObservable(source).toBe('-----a----b----(c|)', values)

    scheduler.flush()
  })
})
