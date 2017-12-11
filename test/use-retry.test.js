// https://stackoverflow.com/questions/42732988/how-do-i-test-a-function-that-returns-an-observable-using-timed-intervals-in-rxj

const Rx = require('rxjs')
const chai = require('chai')

function timeRange(start, end, interval = 1000, scheduler = Rx.Scheduler.async) {
  return Rx.Observable.interval(interval, scheduler)
    .map(n => n + start)
    .take(end - start + 1)
}


describe('test', () => {
	it('should blah...', () => {

		// let scheduler = new Rx.TestScheduler(chai.assert.deepEqual);
		// verbose
		let scheduler = new Rx.TestScheduler((actual, expected) => {
			console.log('Actual:', actual, '\n\n', 'Expected:', expected)
			chai.assert.deepEqual(actual, expected)
	 	});

		let source = timeRange(2, 8, 50, scheduler)
		let values = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8}
		scheduler.expectObservable(source).toBe('-----2----3----4----5----6----7----(8|)', values)

		scheduler.flush()
	})
})