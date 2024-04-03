import { ProCard } from '@ant-design/pro-components';
import { notification } from 'antd';
import {
    ISSUES,
    USERS
} from 'iso/src/store/bootstrap';
import BRANDS from 'iso/src/store/bootstrap/repos/brands';
import SITES from 'iso/src/store/bootstrap/repos/sites';
import { roleEnum } from 'iso/src/store/bootstrap/repos/users';
import React, { useState } from 'react';
import PanelRGrid from '../../../grid/PanelRGrid';
import useLedger from '../../../hooks/useLedger';
import {
    EditorContext,
    useEditor
} from '../chapter-modal/useEditor';
import BaseEditModal from '../BaseItemModal';
import GenericRenFields from '../../form/GenericRenFields';
import { usersEditor } from '../../../editors/usersEditor';

const roleMap = {
    [roleEnum['менеджер']]: 'managerUserId',
    [roleEnum['сметчик']]: 'estimatorUserId',
};

const rolesIssues = ISSUES.rolesProps;
const rolesBrands = BRANDS.rolesProps;
const rolesSites = SITES.rolesProps;

export default ({id}: { id: string }) => {
    const ledger = useLedger();
    const useEditorData = useEditor(usersEditor, id);
    const {removed, userId, clientsUserNumber, ...propsToRender} = USERS.properties;
    const isEditMode = useEditorData.mode === 'edit';
    const list = [...Array.from(Object.values(propsToRender)), isEditMode && clientsUserNumber].filter(i => !!i);

    const [addingModes, setAddingModes] = useState({
        brands: false,
        issues: false,
        sites: false,
    });
    const switchMode = (mode: string, value: boolean) => setAddingModes({
        ...addingModes,
        [mode]: value,
    });

    const onShowAllItems = (mode: string) => () => switchMode(mode, true);
    const disableAddingMode = (mode: string) => () => switchMode(mode, false);

    const resource = USERS;

    const name = resource.getItemName(useEditorData.item);
    const role = roleMap[useEditorData.item.role];

    const showSites = isEditMode && rolesSites.includes(role);
    const showIssues = isEditMode && rolesIssues.includes(role);
    const showBrands = isEditMode && rolesBrands.includes(role);

    // @ts-ignore
    const brands = showBrands ? ledger.brands.list.filter(s => addingModes.brands ? s[role] !== id : s[role] === id) : [];
    // @ts-ignore
    const sites = showSites ? ledger.sites.list.filter(s => addingModes.sites ? s[role] !== id : s[role] === id) : [];
    // @ts-ignore
    const issues = showIssues ? ledger.issues.list.filter(s => addingModes.issues ? s[role] !== id : s[role] === id) : [];

    const onAddToItems = (list: any[], name: string, idProp: string) => (selectedIds: string[], updateCollection: (updated: any[]) => void) => {
        const updated = list
            .filter(s => selectedIds.includes(s[idProp]))
            .map(s => ({
                ...s,
                [role]: id,
            }));

        updateCollection(updated);
        notification.open({
            message: `${useEditorData.item.role} добавлен к ${updated.length} ${name}`,
            type: 'success'
        });
    };

    return (
        <EditorContext.Provider value={useEditorData}>
            <BaseEditModal>
                <GenericRenFields list={list}/>
                <ProCard tabs={{type: 'card'}}>
                    {
                        showSites && (
                            <ProCard.TabPane key="tab1" tab="Объекты">
                                <PanelRGrid
                                    onCancelClick={disableAddingMode('sites')}
                                    onShowAllItems={onShowAllItems('sites')}
                                    onAddToItems={onAddToItems(ledger.sites.list, 'объектам', SITES.idProp)}
                                    createItemProps={{[role]: id}}
                                    title={name}
                                    resource={SITES}
                                    rowData={sites}
                                />
                            </ProCard.TabPane>
                        )
                    }
                    {
                        showIssues && (
                            <ProCard.TabPane key="tab2" tab="Заявки">
                                <PanelRGrid
                                    onCancelClick={disableAddingMode('issues')}
                                    onShowAllItems={onShowAllItems('issues')}
                                    onAddToItems={onAddToItems(ledger.issues.list, 'заявкам', ISSUES.idProp)}
                                    createItemProps={{[role]: id}}
                                    title={name}
                                    resource={ISSUES}
                                    rowData={issues}
                                />
                            </ProCard.TabPane>
                        )
                    }
                    {
                        showBrands && (
                            <ProCard.TabPane key="tab3" tab="Заказчики">
                                <PanelRGrid
                                    onCancelClick={disableAddingMode('brands')}
                                    onShowAllItems={onShowAllItems('brands')}
                                    onAddToItems={onAddToItems(ledger.brands.list, 'заказчикам', BRANDS.idProp)}
                                    createItemProps={{[role]: id}}
                                    title={name}
                                    resource={BRANDS}
                                    rowData={brands}
                                />
                            </ProCard.TabPane>
                        )
                    }
                </ProCard>
            </BaseEditModal>
        </EditorContext.Provider>
    );
}