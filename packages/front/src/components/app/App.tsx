import React, {useState} from 'react'
import {Provider} from 'react-redux'
import {ConnectedRouter, history} from '@sha/router'
import UIRoot from './UIRoot'
import {useMount} from 'react-use'
import {Router} from 'react-router-dom'
import {ConfigProvider} from 'antd'
import {ProConfigProvider} from '@ant-design/pro-components'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import ruRU from 'antd/locale/ru_RU'
import {BlinkDbProvider} from '@blinkdb/react'
import {createDB} from 'blinkdb'
import {blinkModel, db} from './blink-db-model'




const App = ({store}) => {
    const [rendered, setRendered] = useState(false)
    useMount(() => {
        setRendered(true)
    })
    return (
        <BlinkDbProvider db={createDB()} model={blinkModel}>
        <Provider store={store}>
            <Router history={history}>
            <ConnectedRouter history={history} >
                <div
                    id="test-pro-layout"
                    style={{
                        height: "100vh"
                    }}
                >
                    <ProConfigProvider hashed={false} >
                        <ConfigProvider
                            theme={{
                                components: {
                                    Form: {
                                        marginLG:4,
                                        lineHeight:2
                                    },
                                },
                                token: {
                                    borderRadius:0,
                                }
                            }}
                            componentSize={'middle'}
                            locale={ruRU}
                            autoInsertSpaceInButton={true}
                            getTargetContainer={() => {
                                return document.getElementById('test-pro-layout') || document.body;
                            }}
                        >
                    {
                     rendered &&   <UIRoot history={history}/>
                    }
                        </ConfigProvider>
                    </ProConfigProvider>
                </div>
            </ConnectedRouter>
            </Router>
        </Provider>
        </BlinkDbProvider>

    )

}
/*
<ConnectedRouter history={history} omitRouter={true}>
                        <DesktopRoot />
                    </ConnectedRouter>
 */
export default App
