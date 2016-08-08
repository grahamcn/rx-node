const Rx = require('rx');
const Observable = Rx.Observable;


function updateDistance(accumulated, nextVal) {
  if (nextVal % 2 === 0) {
    accumulated++;
  }

  return accumulated;
}

const ticksObservable = 
  Observable.interval(1000). // interval returns an increasing integer every interval
    scan(updateDistance, 0); // scan is like reduce,but gives you the accumulated results as they come in

ticksObservable.forEach((x) => {
  console.log('Subscriber 1 ticks: ' + x);
});

ticksObservable.forEach((x) => {
  console.log('Subscriber 2 ticks: ' + x);
});