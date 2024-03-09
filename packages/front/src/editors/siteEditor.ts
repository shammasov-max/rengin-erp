import {buildEditor, PropRule} from "iso/src/store/bootstrap/buildEditor";
import {USERS} from "iso/src/store/bootstrap/repos/users";
import ISSUES from "iso/src/store/bootstrap/repos/issues";
import BRANDS from "iso/src/store/bootstrap/repos/brands";
import {clone} from "ramda";
import SITES from "iso/src/store/bootstrap/repos/sites";

export const clientsEngineerUserId: PropRule<{ clientsEngineerUserId: typeof ISSUES.properties.clientsEngineerUserId}, 'clientsEngineerUserId', any> = {
    getErrors: ({value, item, state}) => {
        const currentUser = USERS.selectById(value)(state)
        if(currentUser) {
            const usersBrand = BRANDS.selectById(currentUser.brandId)(state)
            const currentBrand = BRANDS.selectById(item.brandId)(state)
            if (currentBrand && usersBrand && currentUser.brandId !== usersBrand.brandId)
                return 'Назначен ответственный инженер от заказчика '+usersBrand.brandName
        }
    },
    getParams: ({item, state}) => {
        var engeneers = USERS.selectEq({role: 'ответственный инженер'})(state)
        if(item.brandId)
            engeneers = engeneers.filter(e => e.brandId === item.brandId)
        return {
            options: USERS.asOptions(engeneers),
            addNewItemDefaults: {}
        }
    },
    getUpdate: ({item, value, state}) => {
        const currentUser = USERS.selectById(value)(state)
        const newItem = clone(item)
        if(!item.brandId && currentUser && currentUser.brandId)
            newItem.brandId = currentUser.brandId
        newItem.clientsEngineerUserId = value
        return newItem
    }
}

export const managerUserId:PropRule<{ managerUserId: typeof ISSUES.properties.managerUserId }, any> = {
    getParams: ({item, state}) => {
        var managers = USERS.selectAll(state).filter(m => m.role==='руководитель' || m.role ==='менеджер')
        return {
            options: USERS.asOptions(managers),
        }
    },
}

export const techUserId: PropRule<{ techUserId: typeof ISSUES.properties.techUserId }, any> = {
    getParams: ({item, state}) => {
        var managers = USERS.selectAll(state).filter(m => m.role==='техник')
        return {
            options: USERS.asOptions(managers),
        }
    },
}


export const siteEditor = buildEditor(SITES, {
    brandId: {
        getUpdate: ({value,item,property,state})=> {
            return {...value, brandId: value, siteId: undefined, legalId: undefined, subId: undefined}
        }
    },
    managerUserId: managerUserId,
    clientsEngineerUserId: clientsEngineerUserId,
    techUserId: techUserId,



})
