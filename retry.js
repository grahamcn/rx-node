const {Observable} = require('rxjs')

const retryStrategy = error$ =>
	Observable.zip(
		Observable.from([1,2,3,4,5]),
		error$
	).mergeMap(([attempt, error]) => {
		console.log(attempt)

		if (attempt > 2) {
			throw error
		}

		return Observable.timer(attempt * 1000)
	})

module.exports = {
	retryStrategy,
}
