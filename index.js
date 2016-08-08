const Rx = require('rx');

Rx.Observable.just('hello!').subscribe(val => {
  console.log(val);
});

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



