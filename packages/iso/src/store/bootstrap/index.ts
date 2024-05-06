import EXPENSES from './repos/expenses';
import TASKS from './repos/tasks';
import {USERS} from './repos/users'
import {SITES} from './repos/sites'
import contractsCrud, {CONTRACTS} from './repos/contracts'
import {ISSUES} from './repos/issues'
import settingsDuck from './settingsDuck'
import SUBS from "./repos/subs";
import BRANDS from "./repos/brands";
import LEGALS from "./repos/legals";
import EMPLOYEES from "./repos/employees";
type C = typeof CONTRACTS
type S = typeof SITES
type U = typeof USERS
type I = typeof ISSUES
type Su = typeof SUBS
type B = typeof BRANDS
type L = typeof LEGALS
type E = typeof EMPLOYEES
type Ex = typeof EXPENSES
type Ts = typeof TASKS
USERS.rid ='user'
USERS.idProp = 'userId'
type Any = C|S|U|I|Su|B|L|E|Ex|Ts
const a : Any = {} as Any

//.idProp()//.properties.userId
export {
    settingsDuck,
    SITES,
    contractsCrud,
    ISSUES,
    USERS,
    EMPLOYEES,
    EXPENSES,
    TASKS,
}
