require('isomorphic-fetch');
require('rxjs/add/operator/retryWhen')
require('rxjs/add/operator/mergeMap')
require('rxjs/add/operator/catch')
const Rx = require('rxjs')
const {retryStrategy} = require('./retry')

Rx.Observable
	.of(1)
	.mergeMap(value =>
		Rx.Observable
			.from(fetch('http://localhost:1234')
										.then(res => {
											if (res.status >= 400) {
												throw new Error("Bad response from server")
											}
											return res.json();
										}))
	)
	.retryWhen(retryStrategy)
	.catch(e => {
		console.log('error....')
		return Rx.Observable.of('404, say')
	})
	.subscribe(console.log)