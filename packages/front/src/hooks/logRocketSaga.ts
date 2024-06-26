import {call, put, select, take} from 'typed-redux-saga'
import LogRocket from 'logrocket'
import {uiDuck} from '../store/ducks/uiDuck'
import config from "@app-config/main";


export function* logRocketSaga() {

    console.log('env.LOG_ROCKET '+config.LOG_ROCKET)
    if (!(config.LOG_ROCKET))//| window.location.hostname ==='localhost')
        return

    LogRocket.init((config.LOG_ROCKET), {
        console: {
            shouldAggregateConsoleErrors: true,
        },
        release: '0.3.6',
    })

    let email
    const getURL = async () =>
        new Promise(res =>
            LogRocket.getSessionURL(sessionURL => {
                    res(sessionURL)
                }
            )
        )

    const url = yield* call(getURL)
    yield* put(uiDuck.actions.setLogRocketURL(url))


    while (true) {
        const ui = yield* select(uiDuck.selectUI)

        let login = ui.login
        if (!ui.login) {
            const action = yield* take(uiDuck.actions.loggedIn.isType)
            login = action.payload.email
        }
        //  while (true) {
        //     const action: ReturnType<typeof uiDuck.actions.loggedIn> = yield* take(uiDuck.actions.loggedIn.isType)
        const domain = window.location.host
        if (!email || email != login) {
            email = login
            LogRocket.identify(
                email,
                {
                    domain,
                    email,
                }
            )
            const action = yield* take(uiDuck.actions.loggedIn.isType)
        }
    }
    // }
}
