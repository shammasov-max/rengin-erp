

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
//import './rengin-theme.css'
import {AgGridReact, AgGridReactProps} from 'ag-grid-react'
import React, {useMemo} from 'react'
import AG_GRID_LOCALE_RU from './locale.ru'
import {agGridDefaultOptions, useAgGrid} from '../hooks/useAgGrid'


import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import { ColumnApi, GridApi, GridOptions, GridReadyEvent, ModuleRegistry } from '@ag-grid-community/core' // @ag-grid-community/core will always be implicitly available
import { CsvExportModule } from '@ag-grid-community/csv-export'
import { GridChartsModule } from '@ag-grid-enterprise/charts'
import { ClipboardModule } from '@ag-grid-enterprise/clipboard'
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel'
import { LicenseManager } from '@ag-grid-enterprise/core'
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export'
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel'
import { MenuModule } from '@ag-grid-enterprise/menu'
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter'
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection'
import { RichSelectModule } from '@ag-grid-enterprise/rich-select'
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping'
import { SetFilterModule } from '@ag-grid-enterprise/set-filter'
import { SideBarModule } from '@ag-grid-enterprise/side-bar'
import { StatusBarModule } from '@ag-grid-enterprise/status-bar'
import { useCallback, useState } from 'react'
import mem from 'mem'
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import {AnyFieldsMeta, ExtractResource, ItemWithId, Resource} from 'iso/src/store/bootstrap/core/createResource'

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClipboardModule,
    ColumnsToolPanelModule,
    CsvExportModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    MenuModule,
    MultiFilterModule,
    RangeSelectionModule,
    RichSelectModule,
    RowGroupingModule,
    SetFilterModule,
    SideBarModule,
    StatusBarModule,
    GridChartsModule,
])

export type RGridProps<RID extends string, Fields extends AnyFieldsMeta> = AgGridReactProps<ItemWithId<RID, Fields>> & {
    resource: Resource<RID, Fields>
    defaultCreateItemProps?: Partial<ItemWithId<RID, Fields>>
    search?: string
}

export default  <RID extends string, Fields extends AnyFieldsMeta>(props: RGridProps<RID, Fields>) => {
    const { onGridReady, columnApi, api } = useAgGrid();
    const gridOptions: GridOptions = { ...agGridDefaultOptions };
   /* const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current!.api.setQuickFilter(
            (document.getElementById('filter-text-box') as HTMLInputElement).value
        );
    }, []);*/
    console.log(columnApi, api);
        const localeText = useMemo<{
                [key: string]: string;
            }>(() => {
                return AG_GRID_LOCALE_RU;
            }, []);

        return  <div className="ag-theme-alpine" style={{height: 'calc(100vh - 250px)', width: '100%'}}>
                    <AgGridReact<ItemWithId<RID, Fields>>
                        localeText={localeText}

                        defaultColDef={{resizable: true,sortable:true}}
                        enableRangeSelection={true}
                        allowContextMenuWithControlKey={true}
                        {...props}
                    >

                    </AgGridReact>
                </div>


}