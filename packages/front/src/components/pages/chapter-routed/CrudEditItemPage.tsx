import {AnyFieldsMeta, ExtractResource, Resource} from 'iso/src/store/bootstrap/core/createResource'
import {useDispatch} from 'react-redux'
import React, {useRef, useState} from 'react'
import AppLayout from '../../app/AppLayout'
import {FormInstance, ProBreadcrumb, ProFormInstance} from '@ant-design/pro-components'
import type {CrudFormRender} from './ItemChapter'
import getCrudPathname from '../../../hooks/getCrudPathname'
import {RForm} from '../../elements/RForm'
import {useHistory} from 'react-router'
import CrudCreateItemButton from '../../elements/CrudCreateButton'
import {AntdIcons} from '../../elements/AntdIcons'
import {Breadcrumb, Button} from 'antd'
import {ItemChapterProps} from './ItemChapter'


export type CrudFormRenderProps<
    RID extends string,
    Fields extends AnyFieldsMeta,
>  =  ItemChapterProps<RID,Fields> & {
    item: Partial<Resource<RID, Fields>['exampleItem']>
    id: string
    verb: 'EDIT' | 'CREATE' |'VIEW'
}


export const CrudEditItemPage =  <
    RID extends string,
    Fields extends AnyFieldsMeta,
>(props: CrudFormRenderProps<RID, Fields>) => {
    const {resource,renderForm,item,renderItemInfo,verb,renderList,id} = props

    type Item = typeof resource.exampleItem
    const formRef = useRef<
        ProFormInstance<Item>
    >();

    const idProp = resource.idProp
    const initialValues = item
    const dispatch = useDispatch()
    const history = useHistory()
    const [state, setState] = useState(initialValues)
    const onSubmit = async (values: Item) => {

        const patch = {...initialValues, ...values,[idProp]:id};
        const action = resource.actions.patched(patch, initialValues)
        console.log('Submit', values, action)
        if(action)
        dispatch(action)
        history.goBack()
        //            dispatch(BRANDS.actions.added(values))
    }
    const title = resource.getItemName(state)
    const onSave = () => {
        formRef.current?.submit()
    }
    const onDelete = () => {
        dispatch(resource.actions.removed(id))
        onBack()
    }
    const layoutProps = {
        labelCol: { span: 4 },
        wrapperCol: { span:20 },
    }
    const onBack = () =>
        history.goBack()
    return  <AppLayout




                proLayout={{
                     extra:[
                         <Button icon={<AntdIcons.DeleteOutlined/>} onClick={onBack}>Отмена</Button>,
                         <Button danger ghost icon={<AntdIcons.DeleteOutlined/>} onClick={onDelete}>Удалить</Button>,
                         <Button type={'primary'} icon={<AntdIcons.SaveOutlined/>} onClick={onSave}>Сохранить</Button>
                     ],
                     title:'Rengin'
                    }}
                onBack={onBack}

                title={<Breadcrumb items={ [   {
                        href: getCrudPathname(resource).view(),

                        title: resource.langRU.plural
                    },
                        {
                            title,
                        }]} ></Breadcrumb>
                }>

            <RForm<Item>
            layout={'horizontal'}
            {
                ...layoutProps
            }
                formRef={formRef}
                readonly={false}
                initialValues={initialValues}
                onValuesChange={(_, values) => {
                    console.log(values);
                    setState(values)
                }}
                onFinish={async (values) => {
                    onSubmit(values)
                }}
                onReset={onBack}
                submitter={{
                    render: (props) => null
                }}
            >
                {
                    renderForm({resource, item: state,id,verb,renderItemInfo})
                }
            </RForm>
        {
            renderItemInfo  && renderItemInfo({...props, item})
        }
    </AppLayout>
}

