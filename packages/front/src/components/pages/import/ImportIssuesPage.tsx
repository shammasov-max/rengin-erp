import {
    ISSUES,
    IssueVO,
    statusesList
} from 'iso/src/store/bootstrap/repos/issues';
import {
    byQueryGetters,
    generateNewListItemNumber,
} from '../../../utils/byQueryGetters';
import AppLayout from '../../app/AppLayout';
import React from 'react';
import { useStore } from 'react-redux';
import {
    put,
    select
} from 'typed-redux-saga';
import { selectLedger } from 'iso/src/store/bootstrapDuck';
import { generateGuid } from '@sha/random';
import ImportCard from '../../elements/ImportCard';
import * as R from 'ramda';

interface IIssue {
    clientsIssueNumber: string,
    clientsSiteNumber: string,
    description: string,
    registerDate: number,
    plannedDate: number,
    completedDate?: number,
    managerId?: string,
    engineerId?: string,
    technicianId?: string,
    estimatorId?: string,
    contacts?: string,
}

const formatExcelDate = (excelDate: number): string => {
    return excelDate ? new Date(Date.UTC(0, 0, excelDate - 1)).toDateString() : '';
};

const rejectFn = R.reject(R.anyPass([R.isEmpty, R.isNil]));

export const importIssuesXlsxCols = [
    'clientsIssueNumber',
    'clientsSiteNumber',
    'description',
    'registerDate',
    'plannedDate',
    'completedDate',
    'managerId',
    'engineerId',
    'technicianId',
    'estimatorId',
    'contacts'
] as const;
type Datum = Record<typeof importIssuesXlsxCols[number], any>

const getImportIssuesSaga = ({ newIssues, invalidIssues, duplicatedIssues }: { newIssues: any[], invalidIssues: any[], duplicatedIssues: any[] }) => {
    function* importIssuesSaga(data: Datum[]) {
        let ledger: ReturnType<typeof selectLedger> = yield* select(selectLedger);

        function* getOrCreateIssue({
                                       clientsIssueNumber,
                                       clientsSiteNumber,
                                       description,
                                       registerDate,
                                       plannedDate,
                                       completedDate,
                                       managerId,
                                       engineerId,
                                       technicianId,
                                       estimatorId,
                                       contacts
                                   }: IIssue) {
            const byQueryGetter = yield* byQueryGetters();

            // @ts-ignore
            const site = yield* byQueryGetter.siteByClientsNumber(clientsSiteNumber);

            if (!site) {
                invalidIssues.push({clientsIssueNumber, clientsSiteNumber});
                return null;
            }

            // @ts-ignore
            const manager = yield* byQueryGetter.userByClientsNumber(managerId);
            // @ts-ignore
            const estimator = yield* byQueryGetter.userByClientsNumber(estimatorId);
            // @ts-ignore
            const engineer = yield* byQueryGetter.employeeByClientsNumber(engineerId);
            // @ts-ignore
            const technician = yield* byQueryGetter.employeeByClientsNumber(technicianId);

            const issueNumber = clientsIssueNumber || generateNewListItemNumber(ledger.issues.list, 'clientsIssueNumber', newIssues.length);
            // Проверка на существование такой заявки
            const foundIssue = ledger.issues.list.find((issue) => {
                return String(issueNumber) === issue.clientsIssueNumber;
            });

            // Если заявка новая
            if (!foundIssue) {
                const formattedRegisterDate = formatExcelDate(registerDate);
                const formattedPlannedDate = formatExcelDate(plannedDate);
                const formattedCompletedDate = formatExcelDate(completedDate);

                if ([formattedRegisterDate, formattedPlannedDate, formattedCompletedDate].includes('Invalid Date')) {
                    invalidIssues.push({clientsIssueNumber, clientsSiteNumber});
                    return null;
                }

                const newIssue = {
                    status: statusesList[0],
                    [ISSUES.idProp]: generateGuid(),
                    clientsIssueNumber: String(issueNumber),
                    description,
                    contacts,
                    registerDate: formattedRegisterDate,
                    plannedDate: formattedPlannedDate,
                    completedDate: formattedCompletedDate,
                    brandId: site.brandId,
                    legalId: site.legalId,
                    siteId: site.siteId,
                    managerUserId: manager?.userId || site?.managerUserId,
                    clientsEngineerUserId: engineer?.employeeId || site?.clientsEngineerUserId,
                    techUserId: technician?.employeeId || site?.techUserId,
                    estimatorUserId: estimator?.userId || site?.estimatorUserId,
                    subId: '',
                    contractId: '',
                };


                console.log(`Issue not found, create one`, newIssue.clientsIssueNumber);
                newIssues.push(rejectFn(newIssue));
            } else {
                duplicatedIssues.push({clientsIssueNumber: issueNumber});
            }

            return foundIssue;
        }

        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            yield* getOrCreateIssue({
                clientsIssueNumber: d.clientsIssueNumber,
                clientsSiteNumber: d.clientsSiteNumber,
                description: d.description,
                registerDate: d.registerDate,
                plannedDate: d.plannedDate,
                completedDate: d.completedDate,
                managerId: d.managerId,
                engineerId: d.engineerId,
                technicianId: d.technicianId,
                estimatorId: d.estimatorId,
                contacts: d.contacts,
            });
        }

        if (newIssues.length) {
            // @ts-ignore
            yield* put(ISSUES.actions.addedBatch(newIssues));
        }
    }

    return importIssuesSaga;
};

// ms
const averageCreateTime = 5;

export const ImportIssuesPage = () => {
    const store = useStore();
    const importFile = async (
        data: Datum[],
        callback?: ({
                        newIssues,
                        invalidIssues,
                        duplicatedIssues
                    }: { newIssues: any[], invalidIssues: any[], duplicatedIssues: any[] }) => void) => {
        const newIssues: Partial<IssueVO>[] = [];
        const invalidIssues: { clientsIssueNumber: string, clientsSiteNumber: string }[] = [];
        const duplicatedIssues: { clientsIssueNumber: string }[] = [];

        const importIssuesSaga = getImportIssuesSaga({ newIssues, invalidIssues, duplicatedIssues });

        // @ts-ignore
        await store.runSaga(importIssuesSaga, data);

        setTimeout(() => {
            callback?.({
                newIssues,
                invalidIssues,
                duplicatedIssues,
            });
        }, data.length * averageCreateTime * 2);
    };

    return (
        <AppLayout
            title="Импорт заявок"
        >
            <ImportCard<Datum>
                onImport={importFile}
                sampleFileURL={'/assets/import-issues-example.xlsx'}
                xlsxCols={importIssuesXlsxCols}
                title={'Импорт заявок'}
                imgURL={'/assets/import-issues-example.png'}
                importedItemsFound={'объектов с данными о заявках'}
            />
        </AppLayout>
    );
};
