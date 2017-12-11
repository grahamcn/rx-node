require('isomorphic-fetch');
const {Observable} = require('rxjs')
const {retryStrategy} = require('./retry')

Observable
	.of(1)
	.mergeMap(value =>
		Observable.from(
			fetch('http://www.swa1pi.co/api/people')
				.then(res => {
					return res.json();
				})
			)
	)
	.retryWhen(retryStrategy)
	.catch(e =>
		Observable.of({
			error: true,
			message: e.message
		})
	)
	.subscribe(console.log)