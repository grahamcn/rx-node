require('isomorphic-fetch')
const {Observable} = require('rxjs')

const retryStrategy = error$ =>
  Observable.zip(
    Observable.from([1,2,3,4,5]),
    error$
  ).mergeMap(([attempt, error]) => {

    if (attempt > 2) {
      throw error
    }

    return Observable.timer(attempt * 1000)
  })


Observable
	.of(1)
	.mergeMap(() =>
		Observable.from(
			fetch('http://www.(REMOVE_ME_TO_FIX)swapi.co/api/people')
				.then(res =>
          res.json()
        )
			)
	)
	.retryWhen(retryStrategy)
  .catch(e =>
    Observable.of({
      error: true,
      message: e.message
    })
	)
	.subscribe(console.log) // eslint-disable-line
