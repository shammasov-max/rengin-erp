import { GENERAL_DATE_FORMAT } from 'iso/src/utils/date-utils';
import React from 'react';
import ItemChapter, { fieldMetaToProProps } from '../chapter-routed/ItemChapter';
import {
    ProForm,
    ProFormDatePicker,
    ProFormMoney,
    ProFormSelect,
    ProFormText
} from '@ant-design/pro-components';
import { useAllColumns } from '../../../grid/RCol';
import LEGALS from 'iso/src/store/bootstrap/repos/legals';
import {
    Row,
    Space
} from 'antd';
import useLedger from '../../../hooks/useLedger';
import CONTRACTS from 'iso/src/store/bootstrap/repos/contracts';
import { useSelector } from 'react-redux';
import PanelRGrid from '../../../grid/PanelRGrid';
import SUBS from 'iso/src/store/bootstrap/repos/subs';
import SITES, { SiteVO } from 'iso/src/store/bootstrap/repos/sites';

export default () => {
    const ledger = useLedger();

    const [cols] = useAllColumns(SUBS);


    return (
        <ItemChapter
            resource={SUBS}
            renderForm={({item, id, verb, resource}) => {
                const contract = useSelector(CONTRACTS.selectById(item.contractId));
                const contractId = contract ? contract.contractId : undefined;
                const legalId = contract ? contract.legalId : undefined;
                const legal = useSelector(LEGALS.selectById(legalId));
                const allSites: SiteVO[] = useSelector(SITES.selectAll);
                const sitesEnum = SITES.asValueEnum(allSites.filter(s => s.legalId === legalId));

                return (
                    <>
                        <div>{legal ? legal.legalName : 'Неизвестен'}</div>
                        <ProFormSelect {...fieldMetaToProProps(SUBS, 'contractId', item)} rules={[{required: true}]} width={'sm'}/>
                        <ProForm.Item label={'Период подключения'} required={true}>
                            <Row>
                                <Space>
                                    <ProFormDatePicker
                                        {...fieldMetaToProProps(SUBS, 'subscribeDate', item)}
                                        label={null}
                                        width={'sm'}
                                        rules={[{required: true}]}
                                        format={GENERAL_DATE_FORMAT}
                                    />
                                    <ProFormDatePicker
                                        {...fieldMetaToProProps(SUBS, 'unsubscribeDate', item)}
                                        label={null}
                                        width={'sm'}
                                        format={GENERAL_DATE_FORMAT}
                                    />
                                </Space>
                            </Row>
                        </ProForm.Item>
                        <ProFormSelect {...fieldMetaToProProps(SUBS, 'siteId', item)} valueEnum={sitesEnum}
                                       label={'Объект'}
                                       width={'xl'} rules={[]}/>
                        <ProFormMoney locale={'ru-RU'} {...fieldMetaToProProps(CONTRACTS, 'rate', item)}
                                      label={'Ставка за объект'} width={'sm'} rules={[]}/>
                        <ProFormText {...fieldMetaToProProps(SUBS, 'managerUserId')} width={'md'} />
                    </>
                );
            }}
            // renderItemInfo={({item, renderItemInfo, renderForm, renderList, id, resource, verb}) => {
            //
            // }}
            renderList={({form, verb, resource}) => {
                return (
                    <div>
                        <PanelRGrid
                            fullHeight={true}
                            resource={SUBS}
                            title={'Все абонентские подключения'}
                        />
                        {/**<FooterToolbar extra="extra information">
                         <Button>Cancel</Button>
                         <Button type="primary">Submit</Button>
                         </FooterToolbar>*/}
                    </div>
                );
            }}
        />
    );
}