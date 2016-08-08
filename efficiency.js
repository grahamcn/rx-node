const Rx = require('rx');

// array ethod create a new array as a result of each operation
// the next operation traverses that, and so on

// observable pipelines don't create 

let stringArray = [];
for (var i = 0; i < 1000; i++) {
  stringArray.push('HEllo');
}

stringArray.
  map(x => x.toUpperCase()).
  filter(x => /^[A-Z]+$/.test(x)).
  forEach(x => console.log(x));  

// each item passes through the pipeline once. 
// Rx.Observable.from(stringArray).
//   map(x => x.toLowerCase()).
//   filter(x => /^[a-z]+$/.test(x)).
//  forEach(x => console.log(x));

const obs = Rx.Observable.
  from(stringArray).  
  map(x => x.toLowerCase()).
  filter(x => /^[a-z]+$/.test(x)).
  take(5);

obs.forEach(x => console.log(x));

