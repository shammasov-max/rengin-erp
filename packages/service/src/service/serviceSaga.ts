import {all, call, fork, put, select, setContext, take} from 'typed-redux-saga'

import {SagaOptions} from '../sagaOptions'
import startServer from '../rest/startServer';
import {bootstrapCruds} from 'iso/src/store/bootstrapDuck';

import duckRepoSaga from '../repositories/duckRepoSaga'
import {defaultAdminUser, usersResource} from 'iso/src/store/bootstrap/repos/users'
import buildPGSchema from "../store/buildPGSchema";
import {RESOURCES_MAP} from "iso";
import {bootstrapRepositories} from "../repositories/bootstrapRepositories";
import Env from "../Env";

let RENGIN_SERVICE_PORT =Env.RENGIN_SERVICE_PORT

export function* serviceSaga(io: SagaOptions) {

    yield* setContext({io})
    yield* call(buildPGSchema, io)

    const repos  = yield* call(bootstrapRepositories, io)
    const effects = yield* all(
        bootstrapCruds.map(crud => take(crud.actions.reset.isType))
    )
    const users = yield* select(usersResource.selectAll)
    if(users.length === 0) {
        yield* put(usersResource.actions.added(defaultAdminUser))
    }




    const fastify = yield* call(startServer, io)

    yield* setContext({fastify})
    io.fastify = fastify

    const listen = async () => {
        try {

            const host = '0.0.0.0'
            console.log('SERVICE listen to ', host, RENGIN_SERVICE_PORT)
            await fastify.listen(RENGIN_SERVICE_PORT,'0.0.0.0')
            // fastify.blipp()
            fastify.printRoutes({commonPrefix: false})
            console.info(`server listening on `, RENGIN_SERVICE_PORT)
        } catch (err) {
            console.error('Could not instantiate Fastify server', err)
        }
    }

    yield* call(listen)
    // yield* fork(syncWBSaga)
}
