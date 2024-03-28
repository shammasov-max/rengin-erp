import { generateGuid } from '@sha/random';
import { sleep } from '@sha/utils';
import {
    SITES,
} from 'iso/src/store/bootstrap';
import BRANDS, { BrandVO } from 'iso/src/store/bootstrap/repos/brands';
import LEGALS from 'iso/src/store/bootstrap/repos/legals';
import { selectLedger } from 'iso/src/store/bootstrapDuck';
import {
    call,
    put,
    select,
} from 'typed-redux-saga';

export const generateNewListItemNumber = (list: any[], accessor: string): string => {
    const lastItemNumber = list.reduce((acc, item) => {
        return +item[accessor] > acc ? +item[accessor] : acc;
    }, 0);

    return String(lastItemNumber + 1);
};

export function* byQueryGetters () {
    let ledger: ReturnType<typeof selectLedger> = yield* select(selectLedger);
    function* updateLedger() {
        ledger = yield* select(selectLedger);
    }

    function* brandById (brandId: string) {
        let actualBrandId = brandId;

        if (!ledger.brands.byId[actualBrandId]) {
            // fixme: вместо generateGuid brandId и подобные должен генерировать индекс MongoDB
            actualBrandId = generateGuid();
            const clientsBrandNumber = generateNewListItemNumber(ledger.brands.list, 'clientsBrandNumber');
            const action = BRANDS.actions.added({
                clientsBrandNumber: clientsBrandNumber,
                brandId: actualBrandId,
                brandName: 'Автоматически созданный заказчик' + clientsBrandNumber,
                brandType: 'Заказчик',
                person: '',
                email: '',
                phone: '',
                address: '',
                web: '',
                managerUserId: '',
                removed: false
            });

            yield* put(action);
            yield* call(sleep, 10);
            yield* call(updateLedger);

            console.log(`Brand ${brandId} not found, create one`, action);
        } else {
            console.log(`Brand ${brandId} found`);
        }

        return ledger.brands.byId[actualBrandId] as BrandVO;
    }

    function* legalById ({legalId, brandId}: {
        legalId: string,
        brandId: string
    }) {
        let actualLegalId = legalId;

        if (!ledger.legals.byId[actualLegalId]) {
            actualLegalId = generateGuid();
            const clientsLegalNumber = generateNewListItemNumber(ledger.legals.list, 'clientsLegalNumber');
            const action = LEGALS.actions.added({
                brandId,
                clientsLegalNumber,
                legalId: actualLegalId,
                legalName: 'Автоматически созданное юр. лицо' + clientsLegalNumber,
                region: ''
            });

            yield* put(action);
            yield* call(sleep, 10);
            yield* call(updateLedger);

            console.log(`Legal ${legalId} not found, create one`, action);
        } else {
            console.log(`Legal ${legalId} found`);
        }

        return ledger.legals.byId[actualLegalId];
    }


    // @ts-ignore
    function* siteByClientsNumber (clientsSiteNumber: string) {
        let actualClientsSiteNumber = clientsSiteNumber;

        const siteByNumberFind = (({ clientsSiteNumber: value }: { clientsSiteNumber: string }) => value === actualClientsSiteNumber);

        if (!ledger.sites.list.find(siteByNumberFind)) {
            actualClientsSiteNumber = generateNewListItemNumber(ledger.sites.list, 'clientsSiteNumber');

            const newBrand = yield* call(brandById, '');
            const newLegal = yield* call(legalById, {legalId: '', brandId: newBrand.brandId});

            const action = SITES.actions.added({
                clientsSiteNumber: actualClientsSiteNumber,
                siteId: generateGuid(),
                brandId: newBrand.brandId,
                legalId: newLegal.legalId,
                address: 'Автоматически созданный объект' + actualClientsSiteNumber,
                city: '-',
                contactInfo: '',
                KPP: '',
                managerUserId: '',
                techUserId: '',
                clientsEngineerUserId: ''
            });

            yield* put(action);
            yield* call(sleep, 10);
            yield* call(updateLedger);

            console.log(`Site ${clientsSiteNumber} not found, create one`, action);
        } else {
            console.log(`Site ${clientsSiteNumber} found`);
        }

        return ledger.sites.list.find(siteByNumberFind);
    }

    function* userByClientsNumber (clientsNumber: string) {
        if (!clientsNumber || !ledger.users.list.find(user => user.clientsUserNumber === clientsNumber)) {
            console.log(`User ${clientsNumber} not found`);
            return {};
        } else {
            console.log(`User ${clientsNumber} found`);
            return ledger.users.list.find(user => user.clientsUserNumber === clientsNumber);
        }
    }

    function* employeeByClientsNumber (clientsNumber: string) {
        if (!clientsNumber || !ledger.employees.list.find(user => user.clientsEmployeeNumber === clientsNumber)) {
            console.log(`Employee ${clientsNumber} not found`);
            return {};
        } else {
            console.log(`Employee ${clientsNumber} found`);
            return ledger.employees.list.find(user => user.clientsEmployeeNumber === clientsNumber);
        }
    }

    return {
        brandById,
        legalById,
        siteByClientsNumber,
        userByClientsNumber,
        employeeByClientsNumber,
    };
}
