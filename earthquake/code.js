const Observable = Rx.Observable;

const QUAKE_URL = 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojsonp';

// const quakes = Observable
//     .create(function(observer) {
//       window.eqfeed_callback = response => {
//         observer.onNext(response);
//         observer.onCompleted();
//       };

//       loadJSONP(QUAKE_URL);
//     })
//     .flatMap(dataset => {
//       return Observable.from(dataset.features);
//     });  


// using RxJS-DOM to make a the jsonp request...
const quakes = 
  Observable
    .interval(5000)
    .flatMap(() => {
      return Rx.DOM.jsonpRequest({
        jsonpCallback: 'eqfeed_callback',
        url: QUAKE_URL
      })
      .retry(3);
    })
    .flatMap(result => {
      return Observable.from(result.response.features);
    })
    .distinct(quake => quake.properties.code)
    .map(quake => {
      return {
        lat: quake.geometry.coordinates[1],
        lng: quake.geometry.coordinates[0],
        size: quake.properties.mag * 10000
      };
    });


// so this.......
// defualt to passing an observer as 3 functions, first being onNext

quakes.subscribe(
  quake => {        
    L.circle([quake.lat, quake.lng], quake.size).addTo(map);
  },
  (err) => { console.log(err); },
  () => { console.log('completed'); }
);

// ............... or 
// pass an observer object with named properties

// quakes.subscribe({
//   onNext: quake => {
//     const coords = quake.geometry.coordinates;
//     const size = quake.properties.mag * 10000;
//     console.log(coords);
//     L.circle([coords[1], coords[0]], size).addTo(map);
//   }
// });

// using forEach rather than subscribe. they're effectively the same until ES7 spec maybe.
// quakes.forEach(quake => {
//   const coords = quake.geometry.coordinates;
//   const size = quake.properties.mag * 10000;
//   console.log(coords);
//   L.circle([coords[1], coords[0]], size).addTo(map);
// });
