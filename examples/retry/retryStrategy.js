/* eslint-env browser */
import {Observable, Scheduler} from '../../../app.rx'
import {envSupportsNavigatorOnline} from '../helpers'

const DEFAULT_RETRIES = 5

export const reconnectOrIncrementalBackOff = (
  // this is the only paremeter that is required to be provided, the error stream
  // stream are conventionally denoted with a trailing $
  error$,
  // we would usually refer to these in scope within the function, but we're passing in the in-scope
  // values as default parameters to aid testing - also purer. this aproach is up for debate I guess.
  {
    retries = DEFAULT_RETRIES,
    interval = 1000,
    supportsOnlineEvent = envSupportsNavigatorOnline,
    onlineEvent$ = Observable.fromEvent(window, 'online'),
    win = window,
  } = {},
  scheduler = Scheduler.async) => {

  // On error return an observable that either continues, completes or errors
  // If it continues, the http call will be retried when the returned observable spits out a
  // value - that's the trigger, "when to retry"
  // If it throws an error, this will be passed on to the catch block of the observable chain to handle.

  // Attempt to use network status event if we're offline as default retry method
  // if the browser is offline, it makes sense to wait for the online event before trying again :)
  if (supportsOnlineEvent()) {
    if (!win.navigator.onLine) {
      return onlineEvent$
    }
  }

  return Observable
          .zip(
            Observable.range(1, retries + 1), // Observable that will spit out |12345x
            error$, // We need to pass through the error in order to throw after max retries.
          )
          .mergeMap(([attemptNumber, error]) => {
            if (attemptNumber > retries) {
              throw error // stop, throw original error which will be caught by subscriber
            }

            return Observable
                    .timer(attemptNumber * interval, scheduler) // always returns 0 after a given interval

          })
}
