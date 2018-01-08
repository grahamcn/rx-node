/* eslint-disable */

// https://github.com/ReactiveX/rxjs/blob/master/doc/scheduler.md

const Rx = require('rxjs')
const Observable = Rx.Observable
const asapScheduler = Rx.Scheduler.asap
const asyncScheduler = Rx.Scheduler.async
const queueScheduler = Rx.Scheduler.queue

const array = [1,2,3,4,5]

// By not passing any scheduler, notifications are delivered synchronously and recursively.
// Use this for constant-time operations or tail recursive operations.
const defaultSchedule = () => {
  const array$ = Observable.from(array)
  console.log('message default A')
  array$.subscribe(x => console.log(`${x} - default, synchonous`))
  console.log('message default B')
}

// Schedules on the micro task queue, which uses the fastest transport mechanism available,
// either Node.js' process.nextTick() or Web Worker MessageChannel or setTimeout or others.
// Use this for asynchronous conversions.
const asapSchedule = () => {
  const scheduledArrayAsap$ = Observable.from(array, asapScheduler)
  console.log('message asap A')
  scheduledArrayAsap$.subscribe(x => console.log(`${x} - asap`))
  console.log('message asap B')
}

// Schedules work with setInterval. Use this for time-based operations.
const asyncSchedule = () => {
  const scheduledArrayAsync$ = Observable.from(array, asyncScheduler)
  console.log('message async A')
  scheduledArrayAsync$.subscribe(x => console.log(`${x} - async`))
  console.log('message async B')
}

// Schedules on a queue in the current event frame (trampoline scheduler). Use this for iteration operations.
const queueSchedule = () => {
  const scheduledArrayQueue$ = Observable.from(array, queueScheduler)
  console.log('message queue A')
  scheduledArrayQueue$.subscribe(x => console.log(`${x} - queue`))
  console.log('message queue B')
}

// run one.
// defaultSchedule()
// asapSchedule()
// asyncSchedule()
// queueSchedule()
