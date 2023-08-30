import {valueTypes} from '../core/valueTypes'
import {createResource} from '../core/createResource'



const issuesRaw = createResource('issue',{
            clientsIssueNumber: valueTypes.string({headerName:'Номер заявки'}),
            status: valueTypes.string({headerName: 'Статус'}),
            brandId: valueTypes.itemOf({headerName: 'Заказчик',linkedResourceName: 'BRANDS',required: true,immutable:true}),
            legalId: valueTypes.itemOf({headerName: 'Юр. Лицо',linkedResourceName: 'LEGALS',required: true,immutable:true}),
            contractId: valueTypes.itemOf({headerName: 'Договор',linkedResourceName: 'CONTRACTS',required: true,immutable:true}),
            siteId: valueTypes.itemOf({headerName: 'Объект',linkedResourceName: 'SITES',required: true,immutable:true}),
            subId: valueTypes.itemOf({headerName: 'Подписка',linkedResourceName: 'CONTRACTS',required: true,immutable:true}),
            payMode: valueTypes.string({headerName: 'Оплата'}),
            userId: valueTypes.string(),
            responsibleEngineer: valueTypes.string({headerName: 'Отвественный инженер'}),
            registerDate: valueTypes.date({headerName:'Дата регистрации'}),
            workStartedDate: valueTypes.date({headerName:'Дата начала работ'}),
            plannedDate: valueTypes.date({headerName: 'Плановая дата'}),
            completedDate: valueTypes.date({headerName: 'Дата завершения'}),
            description: valueTypes.string({headerName: 'Описание'}),
            removed: valueTypes.boolean({select: false}),
    },
    {
            indexes:['brandId','contractId','legalId','siteId','subId','userId'],
            langRU: {
                    singular:'Заявка',
                    plural:'Заявки',
                    some:'Заявки'
            }
    }
)

export const issueResource = {
        ...issuesRaw,
}

export type IssueVO = typeof issueResource.exampleItem


export const ISSUES = issueResource
