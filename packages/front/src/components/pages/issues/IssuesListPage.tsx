import { AgGridReact } from 'ag-grid-react';
import getRestApi from 'iso/src/getRestApi';
import { estimationsStatusesColorsMap } from 'iso/src/store/bootstrap/repos/employees';
import { roleEnum } from 'iso/src/store/bootstrap/repos/users';
import { useAllColumns } from '../../../grid/RCol';
import PanelRGrid from '../../../grid/PanelRGrid';
import {
    estimationStatusesList,
    ISSUES,
    IssueVO,
    statusesColorsMap,
    statusesList
} from 'iso/src/store/bootstrap/repos/issues';
import { generateNewListItemNumber } from '../../../utils/byQueryGetters';
import AppLayout from '../../app/AppLayout';
import React, { useState } from 'react';
import { ColDef } from 'ag-grid-community';
import {
    Badge,
    Button,
    Checkbox,
    Space,
    Tag
} from 'antd';
import { NewValueParams } from 'ag-grid-community/dist/lib/entities/colDef';
import {
    useDispatch,
    useSelector
} from 'react-redux';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { getNav } from '../../getNav';
import { ExportArchiveSelector } from './export-archive/ExportArchiveSelector';
import IssueModal from './IssueModal';
import dayjs from 'dayjs';
import useLocalStorageState from '../../../hooks/useLocalStorageState';
import StatusFilterSelector from './StatusFilterSelector';
import { isIssueOutdated } from 'iso/src/utils/date-utils';
import IssueStatusCellEditor from './IssueStatusCellEditor';
import IssueEstimationsStatusCellEditor from './IssueEstimationsStatusCellEditor';
import { ClockCircleOutlined } from '@ant-design/icons';
import { AntdIcons } from '../../elements/AntdIcons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const getEstimationStatusTag = (data: IssueVO) => {
    const { estimationsStatus } = data;
    return <Tag color={estimationsStatusesColorsMap[estimationsStatus]}>{estimationsStatus}</Tag>;
}

const getStatusTag = (issue: IssueVO) => {
    const currentDJ = dayjs();
    const plannedDJ = issue.plannedDate ? dayjs(issue.plannedDate) : undefined;

    const getTag = () => {
        return <Tag color={statusesColorsMap[issue.status]}>{issue.status}</Tag>;
    };
    let node = getTag();
    if (issue.status === 'В работе') {
        if (currentDJ.isAfter(plannedDJ))
            node = <Badge count={currentDJ.diff(plannedDJ, 'd')} offset={[8, 12]}>{node}</Badge>;
    }
    if (issue.status === 'Выполнена') {
        if (issue.plannedDate && issue.completedDate) {
            if (dayjs(issue.completedDate).isAfter(issue.plannedDate))
                node = <Badge color={'lightpink'} count={dayjs(issue.completedDate).diff(dayjs(issue.plannedDate), 'd')}
                              offset={[-2, 5]}>{node}</Badge>;
        }
        if (!issue.plannedDate || !issue.completedDate) {
            node = <Badge count={<ClockCircleOutlined style={{color: '#d5540a'}}/>} offset={[5, 10]}>{node}</Badge>;
        }
    }
    return <>{node}</>;
};

const onEmailExport = async (ag: AgGridReact) => {
    //  const email = prompt('Укажите почтовый ящик, куда нужн отправить выгрузку')
    const blob = ag.api.getDataAsExcel({}) as any as Blob;
    //const api = await getRestApi()
    const formData = new FormData();
    formData.append('file[]', blob, 'report.xlsx');
    const response = await axios.post(
        '/api/email-export?images=true',
        formData,
        {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            },
        });//?email=miramaxis@ya.ru&images=true', formData);
    console.log(response.data);

    const url = response.data.url;
    const element = document.createElement('a');
    element.href = url;
    element.download = url;
// simulate link click
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);

};

const BottomBar = () => {
    return (
        <Space>
            <Link to={getNav().importIssues}>
                <Button icon={<AntdIcons.UploadOutlined/>}>
                    Импортировать заявки
                </Button>
            </Link>
        </Space>
    );
};

const onArchiveExport = async ({selectedIds, types}: { selectedIds: string[], types: string[] }) => {
    const api = await getRestApi();
    const data = await api.archiveExport({selected: selectedIds, types});

    const url = data.url;
    const element = document.createElement('a');
    element.href = url;
    element.download = url;

    // simulate link click
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

export default () => {
    const currentItemId = window.location.hash === '' ? undefined : window.location.hash.slice(1);
    const allIssues: IssueVO[] = useSelector(ISSUES.selectAll);
    const {currentUser} = useCurrentUser();
    const isUserEstimator = currentUser.role === roleEnum['сметчик'];
    const statusPropToFilter = isUserEstimator ? 'estimationsStatus' : 'status';
    const newClientsNumber = generateNewListItemNumber(allIssues, ISSUES.clientsNumberProp);

    const dispatch = useDispatch();
    const [cols, colMap] = useAllColumns(ISSUES);

    const columns: ColDef<IssueVO>[] = [
        {...colMap.clickToEditCol, headerName: 'id'},
        {...colMap.clientsNumberCol},
        {...colMap.registerDate, width: 150},
        {
            field: 'status',
            filter: 'agSetColumnFilter',
            filterParams: {
                applyMiniFilterWhileTyping: true,
            },
            headerName: 'Статус',
            width: 125,
            editable: currentUser.role !== 'сметчик',
            onCellValueChanged: (event: NewValueParams<IssueVO, IssueVO['status']>) => {
                const issue: Partial<IssueVO> = {issueId: event.data.issueId, status: event.newValue};
                if (event.newValue === 'Выполнена')
                    issue.completedDate = dayjs().startOf('d').toISOString();

                dispatch(ISSUES.actions.patched(issue));
            },
            cellEditor: IssueStatusCellEditor,
            cellEditorParams: {
                values: (params) => [params.data.status, 'sd'],// ['Новая','В работе','Выполнена','Отменена','Приостановлена'],
                valueListGap: 0,
            },
            cellRenderer: (props: {
                rowIndex: number
            }) =>
                getStatusTag(props.data)
        },
        {...colMap.brandId, width: 150},
        {...colMap.siteId, width: 250},
        {...colMap.description, width: 350},
        {...colMap.plannedDate, headerName: 'План'},
        {...colMap.completedDate, headerName: 'Завершена', width: 115},
        {...colMap.managerUserId, headerName: 'Менеджер', width: 130},
        {...colMap.techUserId, headerName: 'Техник', width: 130},
        {...colMap.clientsEngineerUserId, headerName: 'Отв. Инженер', width: 130},
        {...colMap.estimatorUserId, headerName: 'Сметчик', width: 130},
        {
            field: 'estimationsStatus',
            filter: 'agSetColumnFilter',
            filterParams: {
                applyMiniFilterWhileTyping: true,
            },
            headerName: 'Статус',
            width: 150,
            editable: true,
            onCellValueChanged: (event: NewValueParams<IssueVO, IssueVO['estimationsStatus']>) => {
                const issue: Partial<IssueVO> = {issueId: event.data.issueId, estimationsStatus: event.newValue};
                dispatch(ISSUES.actions.patched(issue));
            },
            cellEditor: IssueEstimationsStatusCellEditor,
            cellEditorParams: {
                values: (params) => [params.data.estimationsStatus, 'sd'],
                valueListGap: 0,
            },
            cellRenderer: (props) =>
                getEstimationStatusTag(props.data)
        },
        {...colMap.estimationPrice, editable: false, width: 130},
        {...colMap.expensePrice, editable: false, width: 100},
    ] as ColDef<IssueVO>[];

    const [statuses, setStatuses] = useLocalStorageState('statusFilter', isUserEstimator ? estimationStatusesList : statusesList);
    const [outdated, setOutdated] = useLocalStorageState('outdatedFilter', false);

    const outdatedIssues = outdated ? allIssues.filter(i => isIssueOutdated(i) && !(i.status === 'Выполнена' && !i.completedDate)) : allIssues;

    let dataForUser;

    switch (currentUser.role) {
        case roleEnum['менеджер']: {
            dataForUser = outdatedIssues.filter(i => i.managerUserId === currentUser.userId);
            break;
        }
        case roleEnum['сметчик']: {
            dataForUser = outdatedIssues.filter(i => i.estimatorUserId === currentUser.userId);
            break;
        }
        default: {
            dataForUser = outdatedIssues;
            break;
        }
    }

    // const gridRef = useRef<AgGridReact<IssueVO>>(null);
    const rowData = dataForUser.filter(s => !s[statusPropToFilter] || statuses.includes(s[statusPropToFilter]));

    const [isExportSelectorOpen, setIsExportSelectorOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const exportArchiveHandler = (values: string[]) => {
        setSelectedIds(values);
        setIsExportSelectorOpen(true);
    };

    const closeExportSelector = () => {
        setSelectedIds([]);
        setIsExportSelectorOpen(false);
    };

    const renderToolbar = isUserEstimator ? (
            <Space>
                <StatusFilterSelector
                    list={estimationStatusesList}
                    colorMap={estimationsStatusesColorsMap}
                    statuses={statuses}
                    setStatuses={setStatuses}/>
            </Space>
        ) : (
        <Space>
            <Checkbox checked={outdated}
                      onChange={e => setOutdated(e.target.checked)}>Просроченные</Checkbox>
            <StatusFilterSelector statuses={statuses} setStatuses={setStatuses}/>
        </Space>
    )

    return (
        <AppLayout
            hidePageContainer={true}
            proLayout={{
                contentStyle: {
                    padding: '0px'
                }
            }}
        >
            <div>
                {
                    currentItemId ? <IssueModal id={currentItemId} newClientsNumber={newClientsNumber}/> : null
                }
                <ExportArchiveSelector
                    isOpen={isExportSelectorOpen}
                    selectedIds={selectedIds}
                    onClose={closeExportSelector}
                    onExport={onArchiveExport}
                />
                <PanelRGrid
                    fullHeight
                    toolbar={renderToolbar}
                    rowData={rowData}
                    resource={ISSUES}
                    columnDefs={columns}
                    title={'Все заявки'}
                    name={'IssuesList'}
                    onExportArchive={exportArchiveHandler}
                    BottomBar={BottomBar}
                />
            </div>
        </AppLayout>
    );
}