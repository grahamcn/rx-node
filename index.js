const Rx = require('rxjs');

Rx.Observable
  .range(1,5)
  .forEach(x => console.log(x));

Rx.Observable
  .from(['a', 'a', 'b', 'c', 'd', 'e', 'd'])
  .distinct()
  .forEach(x => console.log(x));

const Observable = Rx.Observable;

Observable.
  from([1,4,3,5,6]).
  filter(x => x % 2 === 0).
  map(x => x * 10).
  forEach(x => console.log(x));

  // range starts form a value, for a number of values
var source = Rx.Observable
  .range(10, 2)
  .flatMap(function (x) {
    return Rx.Observable.range(x, 3);
  });

var subscription = source.subscribe(
  function (x) {
    console.log('Next: ' + x);
  },
  function (err) {
    console.log('Error: ' + err);
  },
  function () {
    console.log('Completed');
  });



