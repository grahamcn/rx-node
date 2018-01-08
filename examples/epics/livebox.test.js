/* eslint-env mocha */
const {fetchLiveEventsEpic} = require('../../../../client/actions/epics/livebox.ts')
const Actions = require('../../../../client/actions/actionTypes')
const {Observable, Subject} = require('rxjs')
const {expect, chai, sinon} = require('../../../helpers')
import {ActionsObservable} from 'redux-observable'
import { TestScheduler } from 'rxjs/testing/TestScheduler'

describe.skip('fetchLiveEventsEpic', () => {
  let sandbox, scheduler

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      // console.log('Actual:', actual, '\n\n', 'Expected:', expected)
      chai.assert.deepEqual(actual, expected)
    })

    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('the test file should successfully require a typescript function',() => {
    expect(typeof(fetchLiveEventsEpic)).to.equal('function')
  })

  context('when an action of type REQUEST_LIVEBOX_SPORT_DATA is recieved', () => {

    context('when the http call succeeds', () => {
      it(`should dispatch an associated LIVEBOX_SPORT_RECEIVED with response data`, done => {

        // no scheduling required as we're mocking using 'of', which is synchronous
        const action$ = ActionsObservable.of({
          type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
          sportKey: 'calcio'
        })

        const getJsonStub = sandbox.stub().returns(Observable.of({
          some: 'response',
        }))

        const expectedActions = [{
          type: Actions.LIVEBOX_SPORT_RECEIVED,
          sportKey: 'calcio',
          response: {
            some: 'response',
          }
        }]

        fetchLiveEventsEpic(
          action$,
          null, // store,
          {
            getJSON: getJsonStub,
            reconnectOrIncrementalBackOff: () => {},
            retries: 2,
            interval: 20,
          },
        )
        .toArray()
        .subscribe(actions => {
          expect(actions).to.eql(expectedActions)
          expect(getJsonStub).to.have.callCount(1)
          done()
        })
      })

      /**
       * Get the same test working with marble diagrams / scheduler, and without done()
       * i think this is more fitting
       */
      it(`should dispatch an associated LIVEBOX_SPORT_RECEIVED with response data`, () => {

        // after 20ms, an action is emitted on our input stream
        const action$ = new ActionsObservable(
          scheduler.createHotObservable('--a', {
            'a': {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'calcio',
            }
          })
        )

        // once made, after 50ms the http call returns response 'r' (and completes in the same frame "(r|)")
        // note, this is a cold observable. the timing doesn't start until it's called, unlike hot,
        // who run from the start of the test's virtual time.
        // see the tests' expected 70ms response time - this and the initial 20ms action delay.
        // were this hot, the test would expect a value emitted after 50ms.
        const getJson$ = scheduler.createColdObservable('-----(r|)', {
          r: { some: 'response' }
        })

        const getJsonStub = sandbox.stub().returns(getJson$)
        const retrySpy = sandbox.spy()

        const dispatchedAction$ = fetchLiveEventsEpic(
          action$,
          null, // store,
          {
            getJSON: getJsonStub,
            reconnectOrIncrementalBackOff: retrySpy,
            retries: 2,
            interval: 20,
          },
          scheduler
        )

        // after 20 ms we receive an action.
        // the get json call takes 50ms.
        // so we expect an action dispatched after 70ms.
        scheduler.expectObservable(dispatchedAction$).toBe(
          '-------a', {
            a: {
              type: Actions.LIVEBOX_SPORT_RECEIVED,
              sportKey: 'calcio',
              response: {
                some: 'response',
              }
            }
          }
        )

        // the flush needs to happen post expectObservable and pre any regular sinon checks.
        // hence moved from afterEach to each test
        scheduler.flush()

        expect(getJsonStub).to.have.callCount(1)

        // for completeness really. we don't know the inner working of the function. check it's not invoked.
        expect(retrySpy).to.have.callCount(0)
      })
    })

    context('when a cancellation action arrives before the network call completes', () => {
      it('should not dispatch a LIVEBOX_SPORT_RECEIVED action', () => {

        const action$ = new ActionsObservable(
          scheduler.createHotObservable('--a-c', {
            'a': {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'calcio',
            },
            c: {
              type: Actions.CANCEL_LIVEBOX_SPORT_REQUEST,
              sportKey: 'calcio',
            }
          })
        )

        const getJson$ = scheduler.createColdObservable('-----(r|)', {
          r: { some: 'response' }
        })

        const getJsonStub = sandbox.stub().returns(getJson$)
        const retrySpy = sandbox.spy()

        const dispatchedAction$ = fetchLiveEventsEpic(
          action$,
          null, // store,
          {
            getJSON: getJsonStub,
            reconnectOrIncrementalBackOff: retrySpy,
            retries: 2,
            interval: 20,
          },
          scheduler
        )

        // never emits, never completes => '-'
        scheduler.expectObservable(dispatchedAction$).toBe('-')

        scheduler.flush()

        expect(getJsonStub).to.have.callCount(1)
        expect(retrySpy).to.have.callCount(0)
      })
    })

    context('when a cancellation action arrives for a different sport before the network call completes', () => {
      it('should dispatch a LIVEBOX_SPORT_RECEIVED action', () => {
        const action$ = new ActionsObservable(
          scheduler.createHotObservable('--a-c', {
            'a': {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'calcio',
            },
            c: {
              type: Actions.CANCEL_LIVEBOX_SPORT_REQUEST,
              sportKey: 'tennis',
            }
          })
        )

        const getJson$ = scheduler.createColdObservable('-----(r|)', {
          r: { some: 'response'}
        })

        const getJsonStub = sandbox.stub().returns(getJson$)
        const retrySpy = sandbox.spy()

        const dispatchedAction$ = fetchLiveEventsEpic(
          action$,
          null, // store,
          {
            getJSON: getJsonStub,
            reconnectOrIncrementalBackOff: retrySpy,
            retries: 2,
            interval: 20,
          },
          scheduler
        )

        scheduler.expectObservable(dispatchedAction$).toBe(
          '-------a', {
            a: {
              type: Actions.LIVEBOX_SPORT_RECEIVED,
              sportKey: 'calcio',
              response: {
                some: 'response',
              }
            }
          }
        )

        scheduler.flush()

        expect(getJsonStub).to.have.callCount(1)
        expect(retrySpy).to.have.callCount(0)
      })
    })

    context('when a change page action arrives before all network calls in progress are complete', () => {
      it('should not dispatch a LIVEBOX_SPORT_RECEIVED action for any calls still to complete, that complete', () => {
        const action$ = new ActionsObservable(
          scheduler.createHotObservable('--a--b--c-l-d-', {
            'a': {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'calcio',
            },
            b: {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'tennis',
            },
            c: {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'golf',
            },
            l: {
              type: Actions.ROUTER_LOCATION_CHANGE,
            },
            d: {
              type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
              sportKey: 'squash',
            },
          })
        )

        const getJsonA$ = scheduler.createColdObservable('--(r|)', {
          r: { some: 'response'}
        })

        const getJsonB$ = scheduler.createColdObservable('--------(r|)', {
          r: { some: 'second response'}
        })

        const getJsonC$ = scheduler.createColdObservable('-----------(r|)', {
          r: { some: 'third response'}
        })

        const getJsonD$ = scheduler.createColdObservable('---(r|)', {
          r: { some: 'fourth response'}
        })

        const getJsonStub = sandbox.stub()
        getJsonStub.onCall(0).returns(getJsonA$)
        getJsonStub.onCall(1).returns(getJsonB$)
        getJsonStub.onCall(2).returns(getJsonC$)
        getJsonStub.onCall(3).returns(getJsonD$)

        const retrySpy = sandbox.spy()

        const dispatchedAction$ = fetchLiveEventsEpic(
          action$,
          null, // store,
          {
            getJSON: getJsonStub,
            reconnectOrIncrementalBackOff: retrySpy,
            retries: 2,
            interval: 20,
          },
          scheduler
        )

        scheduler.expectObservable(dispatchedAction$).toBe('----1----------2', {
          '1': {
            type: Actions.LIVEBOX_SPORT_RECEIVED,
            sportKey: 'calcio',
            response: {
              some: 'response'
            },
          },
          '2': {
            type: Actions.LIVEBOX_SPORT_RECEIVED,
            sportKey: 'squash',
            response: {
              some: 'fourth response'
            },
          },
        })

        scheduler.flush()

        expect(getJsonStub).to.have.callCount(4)
        expect(retrySpy).to.have.callCount(0)
      })
    })

    context('when the http call errors', () => {
      context('when the retry function says do not retry', () => {

        // Could split the retry call check into a separate test, although the input stream -
        // the exact input stream - might be hard to create to compare against.
        it(`should dispatch a REQUEST_LIVEBOX_SPORT_ERROR action with sport key and error,
            having called the retry function with the correct parameters`, () => {
          const action$ = new ActionsObservable(
            scheduler.createHotObservable('--a', {
              'a': {
                type: Actions.REQUEST_LIVEBOX_SPORT_DATA,
                sportKey: 'calcio',
              },
            })
          )

          const getJsonError = {
            some: 'error',
          }

          // after 50ms the http call errors
          const getJson$ = scheduler.createColdObservable('-----#', null, getJsonError)
          const getJsonStub = sandbox.stub().returns(getJson$)

          // retry immediately throws back the error, rather than a signal to retry
          const retry$ = scheduler.createColdObservable('#', null, getJsonError)
          const retryStub = sandbox.stub().returns(retry$)

          const dispatchedAction$ = fetchLiveEventsEpic(
            action$,
            null, // store,
            {
              getJSON: getJsonStub,
              reconnectOrIncrementalBackOff: retryStub,
              retries: 2,
              interval: 20,
            },
            scheduler
          )

          scheduler.expectObservable(dispatchedAction$).toBe(
            '-------a', {
              a: {
                type: Actions.REQUEST_LIVEBOX_SPORT_ERROR,
                sportKey: 'calcio',
                error: getJsonError,
              }
            }
          )

          scheduler.flush()

          expect(getJsonStub).to.have.callCount(1)
          expect(retryStub).to.have.callCount(1)

          // Haven't found a way yet to test this stream emits the correct error
          // as a regular stream emmission. this is pretty much testing Rx tho.
          // the retry strategy is tested elsewhere.
          expect(retryStub.args[0][0]).to.be.instanceOf(Subject)
          expect(retryStub.args[0][1]).to.eql({
            interval: 20,
            retries: 2,
          })
          expect(retryStub.args[0][2]).to.eql(scheduler)
        })
      })
    })
  })
})
