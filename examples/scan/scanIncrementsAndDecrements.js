import Rx from 'rxjs'

// example code to test - this stream sums increments & decrements events,
// which each map to a value of 1, starting with 0.
// a stream of the values is returned as an object with property 'count'
// ie
// -----u-------u-----u------u------u----
// ----------------d------------d-----d--
// 0----1-------2--1--2------3--2---3-2--

export const scanIncrementsAndDecrements = ({up$, down$}) =>
  Rx.Observable.merge(
    up$.mapTo(state => ({
      count: state.count + 1
    })),
    down$.mapTo(state => ({
      count: state.count - 1
    })),
  )
  .startWith({count: 0})
  .scan((state, fn) => fn(state))
