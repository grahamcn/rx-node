require('isomorphic-fetch');
const {Observable} = require('rxjs')
const {retryStrategy} = require('./retry')

Observable
	.of(1)
	.mergeMap(value =>
		Observable.from(
			fetch('http://www.swa1pi.co/api/people')
				.then(res => {
					if (res.status >= 400) {
						throw new Error("Bad response from server")
					}
					return res.json();
				})
			)
	)
	.retryWhen(retryStrategy)
	.catch(e =>
		Observable.of({
			error: true,
			message: '404'
		})
	)
	.subscribe(console.log)