import {AnyFields, Resource} from 'iso/src/store/bootstrap/core/createResource'
import {useDispatch} from 'react-redux'
import React, {useState} from 'react'
import AppLayout from '../../app/AppLayout'
import {CrudListRender, CrudListRenderProps} from './ItemChapter'
import CrudCreateItemButton from '../../elements/CrudCreateButton'
import {RForm} from '../../elements/RForm'
import {ProCard} from '@ant-design/pro-components'
import {ExportOutlined} from '@ant-design/icons'
import {Button} from 'antd'

export const CrudListPage = <
    RID extends string,
    Fields extends AnyFields,
    Res extends Resource<RID, Fields>
>({resource,renderList,verb,form}: CrudListRenderProps<RID, Fields,Res>& {renderList: CrudListRender<RID, Fields,Res>}) => {
    type Item = typeof resource.exampleItem
    const idProp = resource.idProp
    const item: Item = {} as any
    const id = ((item) as any as {[k in typeof idProp]: string})[idProp]
    const initialValues = item
    const dispatch = useDispatch()
    const [state, setState] = useState(item)
    const onSubmit = async (values: Item) => {

        dispatch(resource.actions.patched(values, initialValues))
        //            dispatch(BRANDS.actions.added(values))
    }

    return  <AppLayout
                header={{
                   // title: resource.langRU.plural,
                    extra:[
                        <Button icon={<ExportOutlined />}>Экспорт</Button>,
                        <CrudCreateItemButton/>
                    ]
                }}
            >
        <RForm
            submitter={{
                render: (props, dom) => null
            }}
            readonly={false}
            initialValues={initialValues}
            onValuesChange={(_, values) => {
                console.log(values);
                setState(values)
            }}
            onFinish={async (values) => {
                console.log('onFinish',values)
                onSubmit(values)
            }
            }
        >

        {
            renderList({resource, verb:'LIST',form})
        }

        </RForm>
    </AppLayout>
}
