import {useAllColumns} from '../../../grid/RCol'
import useLedger from '../../../hooks/useLedger'
import PanelRGrid from '../../../grid/PanelRGrid'
import {ISSUES, IssueVO, statusesColorsMap, statusesList} from 'iso/src/store/bootstrap/repos/issues'
import AppLayout from '../../app/AppLayout'
import React, {useCallback, useRef, useState} from 'react'
import {RowClassParams} from "ag-grid-community/dist/lib/entities/gridOptions";
import {DateTime} from "luxon";
import {ColDef} from "ag-grid-community";
import {Badge, Button, Checkbox, message, notification, Space, Tag} from "antd";
import {NewValueParams} from "ag-grid-community/dist/lib/entities/colDef";
import {useDispatch, useSelector} from "react-redux";
import useCurrentUser from "../../../hooks/useCurrentUser";
import useRouteProps from "../../../hooks/useRouteProps";
import {useRouteMatch} from "react-router";
import IssueModal from "./IssueModal";
import dayjs from "dayjs";
import {matchesTreeDataDisplayType} from "ag-grid-community/dist/lib/gridOptionsValidator";
import useLocalStorageState from "../../../hooks/useLocalStorageState";
import StatusFilterSelector from "./StatusFilterSelector";
import {isIssueOutdated} from "iso/src/utils/date-utils";
import {Days} from "iso";
import IsssueStatusCellEditor from "./IsssueStatusCellEditor";
import {ClockCircleOutlined, DownloadOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import {AgGridReact} from "ag-grid-react";
import {IOlympicData} from "../../../examples/ExportToExcel";

import copy from 'copy-to-clipboard';
const getEstimationApprovedTag = (data: IssueVO) =>
    data.estimationsApproved === true
        ? <Tag color={'green'}>Да</Tag>
        : <Tag color={'red'}>Нет</Tag>

const getStatusTag = (issue: IssueVO) => {
    const currentDJ = dayjs()
    const plannedDJ =issue.plannedDate ? dayjs(issue.plannedDate) : undefined
    const completedDJ = issue.completedDate ? dayjs(issue.completedDate) : undefined

    const workStartedDJ =  issue.workStartedDate ? dayjs(issue.workStartedDate) : undefined
    const registerDJ = issue.registerDate ? dayjs(issue.registerDate) : undefined
    const getTag = () => {
        return <Tag color={statusesColorsMap[issue.status]}>{issue.status}</Tag>
    }
    let node = getTag()
    if(issue.status === 'В работе') {
        if(currentDJ.isAfter(plannedDJ))
        node = <Badge count={currentDJ.diff(plannedDJ,'d')} offset={[8,12]}>{node}</Badge>
    }
    if(issue.status === 'Выполнена') {
        if(issue.plannedDate && issue.completedDate) {
         if(dayjs(issue.completedDate).isAfter(issue.plannedDate))
            node = <Badge color={'lightpink'} count={dayjs(issue.completedDate).diff(dayjs(issue.plannedDate),'d')} offset={[-2,5]}>{node}</Badge>
        }
        if(!issue.plannedDate || !issue.completedDate) {
            node = <Badge  count={<ClockCircleOutlined style={{ color: '#d5540a' }} />} offset={[5,10]}>{node}</Badge>
        }
    }
    return <>{node}</>
}



export default () => {

    const routeMatch = useRouteMatch<{issueId:string}>()
    const allIssues: IssueVO[] = useSelector(ISSUES.selectAll)
    const {currentUser} = useCurrentUser()
    const ledger = useLedger()

    const onBtExport = useCallback(() => {
        gridRef.current!.api.exportDataAsExcel();
    }, []);

    const dispatch = useDispatch()
    const onCreateClick = (defaults) => {
        console.log(defaults)
    }
    const [cols,colMap] = useAllColumns(ISSUES)

    const columns: ColDef<IssueVO>[] = [
        {...colMap.clickToEditCol, headerName:'', width: 30},
        {
            ...colMap.clientsIssueNumber, width: 100,
            cellRenderer: (props:{rowIndex:number}) => {
                return <a onClick={() => {
                    copy(props.value);
                    message.info('Cкопировано "'+props.value+'"')
                }}>{props.value}</a>
            }
        },
        {
            ...colMap.registerDate,
        },
        {
            field: 'status',
            filter: 'agSetColumnFilter',
            filterParams: {
                applyMiniFilterWhileTyping: true,
            },
            headerName: 'Статус',
            width: 125,
            editable: currentUser.role !== 'сметчик',
            onCellValueChanged: (event: NewValueParams<IssueVO, IssueVO['status']> ) => {
                const issue: Partial<IssueVO> = {issueId: event.data.issueId, status: event.newValue}
                if(event.newValue === 'Выполнена')
                    issue.completedDate = dayjs().startOf('d').toISOString()

                dispatch(ISSUES.actions.patched(issue))
            },
            cellEditor: IsssueStatusCellEditor,
            cellEditorParams: {
                values: (params) => [params.data.status,'sd'],// ['Новая','В работе','Выполнена','Отменена','Приостановлена'],
                valueListGap: 0,
            },
            cellRenderer: (props:{rowIndex:number}) =>
                getStatusTag(props.data)
        },
        {...colMap.brandId, width: 65},
        {...colMap.siteId, width: 170},
        {...colMap.description, width: 260},
        {...colMap.plannedDate,headerName:'План'},
        {...colMap.completedDate,headerName:'Завершена'},
        {...colMap.estimationsApproved,
            headerName:'Смета',
            cellRenderer: (props) =>
                getEstimationApprovedTag(props.data)
            , width: 80
        },
        {...colMap.estimationPrice, editable: false, width: 80},
        {...colMap.expensePrice,editable: false, width: 80},
    ]

    const [statuses, setStatuses] = useLocalStorageState('statusFilter',statusesList)
    const [outdated, setOutdated] = useLocalStorageState('outdatedFilter', false)

    const outdatedIssues = outdated ? allIssues.filter(i => isIssueOutdated(i) && !(i.status === 'Выполнена' && !i.completedDate)) : allIssues

    const dataForUser = currentUser.role === 'менеджер'
        ? outdatedIssues.filter(i => i.responsibleManagerId === currentUser.userId)
        : outdatedIssues

    console.log('statuses', statuses)
    const gridRef = useRef<AgGridReact<IssueVO>>(null);
    const rowData = dataForUser.filter(s => statuses.includes(s.status) )

    return  <AppLayout
                hidePageContainer={true}
                proLayout={{contentStyle:{
                        padding: '0px'
                    }
                }}
            >
                <div>
                    {
                        routeMatch.params.issueId ? <IssueModal issueId={routeMatch.params.issueId} /> : null
                    }


                    <PanelRGrid

                        toolbar={<Space>
                            <Checkbox checked={outdated} onChange={e => setOutdated(e.target.checked)}>Просроченные</Checkbox>
<StatusFilterSelector statuses={statuses} setStatuses={setStatuses}/>
                    </Space>}
                        rowData={rowData}
                        onCreateClick={onCreateClick}
                        fullHeight={true}
                        resource={ISSUES}
                        columnDefs={columns}
                        title={'Все заявки'}

                    />
                    {
                        /**
                         <FooterToolbar extra="extra information">
                     <Button>Cancel</Button>
                     <Button type="primary">Submit</Button>
                     </FooterToolbar>
                         */
                    }</div>

            </AppLayout>

}