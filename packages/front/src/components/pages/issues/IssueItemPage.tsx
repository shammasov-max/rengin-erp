import {AnyFieldsMeta, ExtractResource, Resource} from 'iso/src/store/bootstrap/core/createResource'
import {useDispatch, useSelector} from 'react-redux'
import React, {useCallback, useRef, useState} from 'react'
import AppLayout from '../../app/AppLayout'
import {FormInstance, ProBreadcrumb, ProCard, ProFormInstance} from '@ant-design/pro-components'
import type {CrudFormRender} from './ItemChapter'
import getCrudPathname from '../../../hooks/getCrudPathname'
import {RForm} from '../../elements/RForm'
import {useHistory} from 'react-router'
import CrudCreateItemButton from '../../elements/CreateButton'
import {AntdIcons} from '../../elements/AntdIcons'
import {Breadcrumb, Button, Card} from 'antd'
import DeleteButton from '../../elements/DeleteButton'
import CancelButton from '../../elements/CancelButton'
import usePathnameResource from '../../../hooks/usePathnameResource'
import VDevidedCard from '../../elements/VDevidedCard'
import EditIssueItemForm from './EditIssueItemForm'
import {ISSUES, IssueVO} from 'iso/src/store/bootstrap/repos/issues'
import ExpensesTable from "./ExpensesTable";
import UploadSection from "../../elements/UploadSection";




export default () => {
    const {resource,id,item,verb} = usePathnameResource()
    type Item = typeof resource.exampleItem
    const formRef = useRef<
        ProFormInstance<Item>
    >();


    const initialValues:IssueVO =useSelector(ISSUES.selectById(id))
    const [state, setState] = useState(initialValues) as any as [IssueVO, (otem: IssueVO)=>any]

    const idProp = resource.idProp
    const dispatch = useDispatch()
    const history = useHistory()

    const getFilesProps = (listName: 'workFiles'|'checkFiles'|'actFiles',label: string, maxCount = 1) => {
        return {
            items: state[listName],
            onItemsChange: (list) => {
                setState({...state, [listName]:list})
            },
            issueId: initialValues.issueId,
            label,
            maxCount,

        }
    }



    const onSubmit = async (values: Item) => {

        const patch = {...initialValues, ...values,[idProp]:id};
        const action = resource.actions.patched(patch, initialValues)
        console.log('Submit', values, action)
        history.goBack()
        if(action)
            dispatch(action)

        //            dispatch(BRANDS.actions.added(values))
    }
    const onItemChange = useCallback((state) => {
        setState(state)
    },[id])
    const title = resource.getItemName(state)
    const onSave = () => {
        dispatch(resource.actions?.patched(state))
        onBack()
    }
    const onDelete = () => {
        dispatch(resource.actions.removed(id))
        onBack()
    }

    const onBack = () =>
        history.goBack()
    return  <AppLayout




        proLayout={{
            extra:[
                <CancelButton onCancel={onBack}/>,
                <DeleteButton  resource={resource} id={id} onDeleted={onDelete}/>,
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
        <ProCard
            tabs={{
                type: 'card',
            }}
        >
            <ProCard.TabPane key="tab1" tab="Заявка">
                <EditIssueItemForm issueId={id} onItemChange={onItemChange}/>
            </ProCard.TabPane>
            <ProCard.TabPane key="tab2" tab={"Смета"}>
                <ExpensesTable issueId={id}/>
            </ProCard.TabPane>
            <ProCard.TabPane key="tab3" tab={"Файлы"}>
                    <UploadSection {...getFilesProps('checkFiles','Чек',1)}/>
                    <UploadSection {...getFilesProps('actFiles','Акты',5)}/>
                    <UploadSection {...getFilesProps('workFiles','Работы',70)}/>


            </ProCard.TabPane>
            <ProCard.TabPane key="tab4" tab={"История"}>

            </ProCard.TabPane>
        </ProCard>



    </AppLayout>
}
