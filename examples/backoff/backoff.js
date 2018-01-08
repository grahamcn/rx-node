const {Observable, Scheduler} = require('rxjs')

// given an error stream, for each error, return a value in the returned stream after
// an ever increasing delay.
// when retries are used up, throw the error we were given by the input stream.
export function backoff(
  attempts, // number of retries
  error$, // stream of errors
  interval = 1000, // base time value to incrementally back off with
  scheduler = Scheduler.async, // scheduler
) {
  return Observable
    .zip(
      Observable.range(1, attempts),
      error$,
    )
    .mergeMap(([attemptNumber, error]) => {
      if (attemptNumber === attempts) {
        throw error
      }

      // returns 0, 0, 0, 0, 0, 0 (the index of the interval value next'd) etc
      // scheduled by attempt * interval, so ever increasing
      return Observable
              .timer(attemptNumber * interval, scheduler)
              .take(1)
    })
}
