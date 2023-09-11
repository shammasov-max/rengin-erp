import {
    ModalForm,
    ProFormDatePicker,
    ProFormInstance,
    ProFormSelect,
    ProFormText,
    ProFormTextArea
} from '@ant-design/pro-components'
import {Breadcrumb, Button, Form, message} from 'antd'
import CreateButton from '../../elements/CreateButton'
import React, {useRef, useState} from 'react'
import {ISSUES, IssueVO} from 'iso/src/store/bootstrap/repos/issues'
import {generateGuid} from '@sha/random'
import {useQueryObject} from '../../../hooks/useQueryObject'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router'
import {AntdIcons} from '../../elements/AntdIcons'
import AppLayout from '../../app/AppLayout'
import CancelButton from '../../elements/CancelButton'
import getCrudPathname from '../../../hooks/getCrudPathname'
import {RForm} from '../../elements/RForm'
import BRANDS, {BrandVO} from 'iso/src/store/bootstrap/repos/brands'
import {fieldMetaToProProps} from '../chapter-routed/ItemChapter'
import SUBS, {SubVO} from 'iso/src/store/bootstrap/repos/subs'
import {br} from '../../../../../static/assets/vendor-6932f6a6'
import {SITES} from 'iso/src/store/bootstrap'
import {SiteVO} from 'iso/src/store/bootstrap/repos/sites'
import {LEGALS, LegalVO} from 'iso/src/store/bootstrap/repos/legals'
import CONTRACTS, {ContractVO} from 'iso/src/store/bootstrap/repos/contracts'
import { Space, Typography } from 'antd';

const { Text, Link } = Typography;
export default () => {

    const layoutProps = {
        labelCol: { span: 6 },
        wrapperCol: { span:18 },
    }
    const resource = ISSUES
    const formRef = useRef<
        ProFormInstance<IssueVO>
    >();
    const idProp = ISSUES.idProp
    type Item = IssueVO
    const id =generateGuid()
    const predefinedValues = useQueryObject<IssueVO>()
    const initialValues:IssueVO = {[idProp]: id, ...predefinedValues }as any as Item
    const [state, setState] = useState(initialValues) as any as [Item, (otem: Item)=>any]
    const dispatch = useDispatch()

    const onSubmit = async (values: Item) => {
        const patch = {[idProp]:id, ...values}
        const action = ISSUES.actions.added(patch)
        console.log('Submit', values, action)
        dispatch(action)

        //            dispatch(BRANDS.actions.added(values))
    }

    console.log('Initial alues', initialValues)
    const history = useHistory()


    const onSave = () => {
        formRef.current?.submit()
    }
    const onDelete = () => {
        onBack()
    }
    const onBack = () =>
        history.goBack()

    const title =
        <span>{"Новая заявка"}</span>


    const brands: BrandVO[] = useSelector(BRANDS.selectList) as any
    const brandsOptions = BRANDS.asValueEnum(brands)
    const legals = useSelector(LEGALS.selectList)
    const [legalsOptions, setLegalOptions]= useState({})
    const sites = useSelector(SITES.selectList)
    const [sitesOptions, setSitesOptions]= useState({})
    const onBrandChange = (e) => {
        formRef.current?.setFieldValue('legalId', undefined)
        formRef.current?.setFieldValue('siteId', undefined)
        const brandId = formRef.current?.getFieldValue('brandId')
        const legOpts=LEGALS.asValueEnum(legals.filter(l => l.brandId === brandId))
        setLegalOptions(legOpts)
        console.log('onBrandChange',e, legOpts)
    }

    const onLegalChange = (e) => {
        formRef.current?.setFieldValue('siteId', undefined)

        const legalId = formRef.current?.getFieldValue('legalId')
        const sitesOpts=SITES.asValueEnum(sites.filter(l => l.legalId === legalId))
        setSitesOptions(sitesOpts)
        console.log('onLegalChange',e, sitesOpts)
    }


    const contracts: ContractVO[] = useSelector(CONTRACTS.selectList)
    const subs: SubVO[] = useSelector(SUBS.selectList)
    const sub = subs.find(s => s.siteId === state.siteId) || {contractId: undefined}
    const contract = contracts.find(c => c.contractId === state.contractId )
    const onSiteChange = (e) => {
        const siteId = formRef.current?.getFieldValue('siteId')
        const sub = subs.find(s => s.siteId === siteId) || {contractId: undefined}
        const contract = contracts.find(c => c.contractId === sub.contractId )
        debugger
        if(sub && contract) {
            formRef.current?.setFieldValue('contractId',contract.contractId)
            formRef.current?.setFieldValue('subId',sub.subId)
            setState({...state, contractId: contract.contractId, subId: sub.subId})
        }
    }
    console.log('contractId', state.contractId, contract)
    console.log('siteId',state.siteId)
    return  <AppLayout


        proLayout={{

            extra:[
                <CancelButton onCancel={onBack}/>,
                <Button type={'primary'} icon={<AntdIcons.SaveOutlined/>} onClick={onSave}>Создать</Button>
            ],
            title:'Rengin',

        }}
        onBack={onBack}

        title={<Breadcrumb items={ [   {
            href: getCrudPathname(resource).view(),

            title: resource.langRU.plural
        },
            {
                title,
            }]} ></Breadcrumb>
        }

    >
        <RForm<Item>
            formRef={formRef}
            layout={'horizontal'}

            {
                ...layoutProps
            }
            readonly={false}
            initialValues={initialValues}
            onValuesChange={(_, values) => {
                console.log(values);
                setState({...state, ...values})
            }}
            onFinish={async (values) => {
                console.log('onFinish',values)
                console.log('state', state)
                debugger
                onSubmit(state);
                history.goBack()
            }
            }
            submitter={{
                render: (props) => null
            }}
        >
            <ProFormSelect showSearch={true} label={'Заказчик'} placeholder={'Выберите заказчика'}  required={true} valueEnum={brandsOptions} name={'brandId'}  onChange={onBrandChange} rules={[{required: true}]}/>
            <ProFormSelect showSearch={true} disabled={state.brandId === undefined} label={'Организация'} placeholder={'Выберите организацию'}  required={true} valueEnum={legalsOptions} name={'legalId'}  onChange={onLegalChange} rules={[{required: true}]}/>
            <ProFormSelect showSearch={true} disabled={state.legalId === undefined} label={'Адрес'} placeholder={'Выберите адрес'}   required={true} valueEnum={sitesOptions} name={'siteId'}  onChange={onSiteChange} rules={[{required: true}]}/>
            <Form.Item name="contractId" label="Договор">
                {

                          contract?  <Text type="success">{contract.contractNumber}</Text>
                              :
                        <Text type="warning">Договор не найден</Text>

                }
            </Form.Item>
            <ProFormDatePicker {...fieldMetaToProProps(ISSUES, 'registerDate', state) } label={'Заявка зарегистрирована'}  width={'sm'} />
            <ProFormDatePicker {...fieldMetaToProProps(ISSUES, 'plannedDate', state)} label={"Плановая дата завершения"}  width={'sm'} />
            <ProFormDatePicker {...fieldMetaToProProps(ISSUES, 'workStartedDate', state)} label={'Дата начала работ'}  width={'sm'} />
            <ProFormDatePicker {...fieldMetaToProProps(ISSUES, 'completedDate', state)} label={'Дата завершения'}  width={'sm'} />
            <ProFormTextArea {...fieldMetaToProProps(ISSUES, 'description')} rules={[{required:true}]}/>
        </RForm>

    </AppLayout>
}