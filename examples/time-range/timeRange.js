/* eslint-env mocha */
const Rx = require('rxjs')

// the output stream will emit a value every *interval* seconds, starting with *start*,
// until it finishes with *end*
// so for inputs 2, 5, 30:
// ---2--3--4--(5|)
function timeRange(start, end, interval = 1000, scheduler = Rx.Scheduler.async) {
  return Rx.Observable.interval(interval, scheduler)
    .map(n => n + start) // interval is zero indexed.
    .take(end - start + 1)
}

module.exports = {
  timeRange,
}
