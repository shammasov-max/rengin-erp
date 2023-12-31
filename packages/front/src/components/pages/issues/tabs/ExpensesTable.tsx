import {useDispatch, useSelector} from "react-redux";
import {ISSUES} from "iso/src/store/bootstrap";
import React, {useCallback, useMemo, useRef, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {
    ColDef,
    ISelectCellEditorParams,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    StatusPanelDef
} from "ag-grid-community";
import 'ag-grid-enterprise'

import {ExpenseItem, IssueVO} from "iso/src/store/bootstrap/repos/issues";
import {Button, Space, Typography} from "antd";
import {clone, remove} from "ramda"
import useIssue from "../../../../contexts/useIssue"
import AG_GRID_LOCALE_RU from "../../../../grid/locale.ru";
import ImportTableButton from "../ImportTableButton";
import {importSitesXlsxCols} from "../../ImportSItesPage";
import {DownloadOutlined} from "@ant-design/icons";
import {MasterDetailModule} from "@ag-grid-enterprise/all-modules";
import {CsvExportModule} from "@ag-grid-community/csv-export";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import {useCanManage} from "../../../../hooks/useCanManage";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ ExcelExportModule ]);
const countExpenses = (expenses: IssueVO['expenses']) =>
        expenses.reduce((prev, item)=> prev+(isNaN(Number(item.amount)) ? 0: Number(item.amount)), 0)


export default (props) => {
    const {currentUser} = useCurrentUser()
    const {issue,setIssue,setIssueProperty} = useIssue()
    const issueId = issue.issueId
    const canEdit = useCanManage()
    const initialItems= clone(issue.expenses|| [])
    const [isEdited, setIsEdited] = useState(false)
    const gridRef = useRef<AgGridReact>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '300px', width: '100%' }), []);
    const rowData = initialItems
    console.log('ExpensesTable issue', issue)
    const setRowData = (items: ExpenseItem[]) => {
        setIssue({...issue, expenses: items, expensePrice: countExpenses(items)})
    }
    const columnDefs = [
        {
            field: 'paymentType',
            headerName:'Оплата',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Наличные', 'Безналичные']
            } as ISelectCellEditorParams,
        },
        {
            field: 'purposeType',
            headerName:'Назначение',
            cellEditor: 'agSelectCellEditor',
            width: 120,
            cellEditorParams: {
                values: ['Материалы', 'Работы','ГСМ','Прочее']
            } as ISelectCellEditorParams,
        },
        { field: 'title',headerName:'Наименование',  width: 140, },
        { field: 'amount',headerName:'Расходы',cellEditor: 'agNumberCellEditor', },
        { field: 'date',headerName:'Дата оплаты',cellEditor: 'agDateCellEditor', cellClass: 'dateISO'
        },
        { field: 'comment',headerName:'Комментарий'},
        {
            cellRenderer: (props:{rowIndex:number}) =>
                <Button danger={true} onClick={() => {
                   setRowData(remove(props.rowIndex,1,rowData))
                }}>Удалить</Button>
        }
    ];

    const xlsxCols = columnDefs.filter(def => def.field).map(def => def.field)
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 110,
            editable: canEdit,
            resizable: true,
        };
    }, []);

    const onCellEditingStarted = (e:RowEditingStartedEvent) => {
        console.log('RowEditingStartedEvent',e)
    }
    const onCellEditingStopped = (e: RowEditingStoppedEvent) => {
        let items: Array<ExpenseItem> = [];
        gridRef.current.api.forEachNode(function(node) {

                items.push(node.data);
        });
setRowData(items)
        console.log('RowEditingStoppedEvent',e,items)
    }


    const onImport = async (items: ExpenseItem[]) => {
        console.log('onImport', items)
        setRowData(items)
    }

    const onBtExport = useCallback(() => {
        gridRef.current!.api.exportDataAsExcel();
    }, []);
    return <div>
        {
            canEdit
                ? <Typography.Text type={'success'}> Ваша роль {currentUser.role}, редактируйте смету</Typography.Text>
                : <Typography.Text type={'danger'}>Ваша роль {currentUser.role}, нельзя менять смету</Typography.Text>
        }
        <div className="ag-theme-alpine" style={gridStyle}>
            <AgGridReact
                localeText={AG_GRID_LOCALE_RU}
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onCellEditingStarted={onCellEditingStarted}
                onCellEditingStopped={onCellEditingStopped}
            />

    </div>

        <div style={{paddingTop: '8px', display: 'flex', justifyContent:'space-between' }}>
            <Space>
                {canEdit?<>
                    <ImportTableButton<ExpenseItem>
                 onImport={onImport}
                 sampleFileURL={'/assets/import-expenses-example.xlsx'}
                 xlsxCols={xlsxCols}
                 title={"Импорт расходов"}
                 imgURL={'/assets/import-expenses-example.png'}
                 importedItemsFound={"записей о расходах"}
                ></ImportTableButton>
                <Button type={"primary"} onClick={() => setRowData([...rowData,{paymentType:'Безналичные',purpuseType:'Материалы'}])}>Добавить строку</Button>
                    </>
                    :<Typography.Text type={'danger'}>Ваша роль {currentUser.role}, нельзя смету</Typography.Text>
                }
                <Typography.Text>Итого: </Typography.Text>
                <Typography.Text code strong>{issue.expensePrice}</Typography.Text>
            </Space>
            <Space>
                <Button icon={<DownloadOutlined />} onClick={onBtExport} >Скачать .xlsx</Button>
            </Space>
        </div>
    </div>
}

