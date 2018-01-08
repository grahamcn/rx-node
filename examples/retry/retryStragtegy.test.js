/* eslint-env mocha */
import Rx from 'rxjs'
import {chai} from '../../../../helpers'

import {reconnectOrIncrementalBackOff} from '../../../../../client/actions/epics/retryStrategies'

describe('reconnectOrIncrementalBackOff', () => {
  let testScheduler, retries, supportsOnlineEvent, mockWindow

  beforeEach('Set up an instance of the test scheduler', () => {
    retries = 3

    testScheduler = new Rx.TestScheduler((actual, expected) => {
      chai.assert.deepEqual(actual, expected)
    })
  })

  afterEach('Flush scheduler', () => {
    testScheduler.flush()
  })

  context('when the browser supports the navigator online event', () => {
    beforeEach(() => {
      supportsOnlineEvent = () => true
    })

    context('when the browser is offline', () => {
      beforeEach(() => {
        mockWindow = {
          navigator: {
            onLine: false,
          },
        }
      })

      it('should emit a next value when the browser reconnects afer receiving an error', () => {
        const error$       = '--e-----------' // e for the initial error happening
        const onlineEvent$ = '----------o---' // o for online event happening
        const expected$    = '----------r---' // r for retry event fired by our retry stream

        const error$Values = {
          e: new Error('some http error')
        }

        const onlineEvent$Values = {
          o: { online: true }
        }

        const expected$Values = {
          r: { online: true },
        }

        const output$ = reconnectOrIncrementalBackOff(
          testScheduler.createHotObservable(error$, error$Values),
          {
            retries,
            supportsOnlineEvent,
            onlineEvent$: testScheduler.createHotObservable(onlineEvent$, onlineEvent$Values),
            win: mockWindow,
          }
        )

        testScheduler.expectObservable(output$).toBe(expected$, expected$Values)
      })

      // we do not really need the values in the previous test in this instance - this is a version without.
      // we are concerned with WHEN these events happen and are triggered.
      // we do not need to PASS a scheduler to the function for the test, as we do not need
      // to overwrite any interval/periodic values within the online event checks
      it('should emit a next value when the browser reconnects afer receiving an error', () => {
        const error$       = '--e-----------' // e for the initial error
        const onlineEvent$ = '----------o---' // o for online
        // o for online (match the input stream), as we're not checking values - these must match in this case
        const expected$    = '----------o---'

        const output$ = reconnectOrIncrementalBackOff(
          testScheduler.createHotObservable(error$),
          {
            retries,
            supportsOnlineEvent,
            onlineEvent$: testScheduler.createHotObservable(onlineEvent$),
            win: mockWindow,
          }
        )

        testScheduler.expectObservable(output$).toBe(expected$)
      })
    })

    context('when the browser is online', () => {
      beforeEach(() => {
        mockWindow = {
          navigator: {
            onLine: true,
          },
        }
      })

      it(`should retry and incrementally back off until retries are used up then return
            the error with no delay`, () => {

        const error$    = '-e--f-------g-------h' // e-h for the error values
        const expected$ = '---r----r---------r-#' // r indicates retry, # for the error once attempts used up

        const error1 = 'error e'
        const error2 = 'error f'
        const error3 = 'error g'
        const error4 = 'error h'
        const error$Values = {'e': error1, 'f': error2, 'g': error3, 'h': error4}

        const expected$Values = {
          r: 0,
        }
        const expected$Error = 'error h'

        const output$ = reconnectOrIncrementalBackOff(
          testScheduler.createHotObservable(error$, error$Values),
          {
            retries,
            interval: 20,
            supportsOnlineEvent,
            onlineEvent$: testScheduler.createHotObservable('-'), // never emits, never completes
            win: mockWindow,
          },
          // note - we now need to pass the test scheduler, as we are involving operators
          // that do not default to null for their scheduler parameter i.e. we need to control time - virtual time.
          testScheduler,
        )

        testScheduler.expectObservable(output$).toBe(expected$, expected$Values, expected$Error)
      })
    })
  })
})
