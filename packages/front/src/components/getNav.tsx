import React from 'react'
import {ExtractRouteParams, routeBuilder, RoutePath} from '@sha/router'
import LoginPage from './auth-views/LoginPage'
import {Route, RouteComponentProps} from 'react-router'
import ForgotPasswordPage from './auth-views/ForgotPasswordPage'

import StartPage from './in-app/StartPage'
import BrandsChapter from './auth-views/brands/BrandsChapter.js'
import LegalsChapter from './auth-views/clients/LegalsChapter'
import SitesChapter from './auth-views/clients/SitesChapter'
import ContractsChapter from './auth-views/contracts/ContractsChapter'
import SubsChapter from './auth-views/contracts/SubsChapter'
import ImportSItesPage from './in-app/ImportSItesPage'
import IssuesListPage from './in-app/tickets/TicketsListPage'
import AddIssuePage from './in-app/tickets/AddTicketPage'
import DashboardPage from "./auth-views/dashboard/DashboardPage";
import UsersChapter from "./in-app/users/UsersListPage";
import moize from "moize";


type RouteRenderProps<RPath extends RoutePath> = RouteComponentProps<ExtractRouteParams<RPath>>
export type RouteScreen<RPath extends RoutePath> = React.ComponentType<RouteRenderProps<RPath> &
    ExtractRouteParams<RPath>>


const buildNav = <Path extends string, Comp extends RouteScreen<Path>>
    (path: Path, Component: Comp) => {
        const builder = routeBuilder(path)
        return Object.assign(builder, {
            Component
        })
    }

export type BuildNav = ReturnType<typeof buildNav>


export const getNav = moize(() => {
    return  {
        index: buildNav('/', () => <div></div>),
        login: buildNav('/app/login', LoginPage),
        forgot: buildNav('/app/forgot', ForgotPasswordPage),
        start: buildNav('/app/in/start', StartPage),
        // issuesList: buildNav('/app/in/issues',ContractsListPage ),
        usersList: buildNav('/app/in/users', UsersChapter),

        brandsList: buildNav('/app/in/brands', BrandsChapter),

        legalsList: buildNav('/app/in/legals', LegalsChapter),
        legalsCreate: buildNav('/app/in/legals/create', LegalsChapter),
        legalsEdit: buildNav('/app/in/legals/:id', LegalsChapter),

        sitesList: buildNav('/app/in/sites', SitesChapter),
        sitesCreate: buildNav('/app/in/sites/create', SitesChapter),
        sitesEdit: buildNav('/app/in/sites/:id', SitesChapter),

        contractsList: buildNav('/app/in/contracts', ContractsChapter),
        contractsCreate: buildNav('/app/in/contracts/create', ContractsChapter),
        contractsEdit: buildNav('/app/in/contracts/:id', ContractsChapter),

        subsList: buildNav('/app/in/subs', SubsChapter),
        subsCreate: buildNav('/app/in/subs/create', SubsChapter),
        subsEdit: buildNav('/app/in/subs/:id', SubsChapter),
        importSites: buildNav('/app/in/import-sites', ImportSItesPage),
        issues: buildNav('/app/in/issues', IssuesListPage),
        issueCreate: buildNav('/app/in/issues/create', AddIssuePage),
        issuesEdit: buildNav('/app/in/issues/:id', IssuesListPage),

        dashboard: buildNav('/app/in/dashboard', DashboardPage)
        //addressesList: buildNav('/app/in/addresses', AddressesListPage),
        // addressPage: buildNav('/app/in/addresses/:addressId', props => <AddressItemPage id={props.addressId}/>),
        // contractsList: buildNav('/app/in/contracts', ContractsListPage),
        // contractsPage: buildNav('/app/in/contracts/:contractId', props => <ContractItemPage id={props.contractId}/>),

    }
})




export type Nav = typeof getNav
export type KeyOfNav = keyof Nav
/**
export const rootRoutes = collectBy(prop('Component'),Object.values(getNav()))
    .map((navs: BuildNav[]) => {
        const Comp =navs[0].Component
        const path = navs.map(n => n.pattern)

        return (
            <Route
                exact={false}
                key={navs[0].pattern}
                path={path[0]}
                render={routeProps => {
                    // @ts-ignore
                    return (
                        <Comp {...routeProps} {...routeProps.match.params} />
                )
                }}
            />
        )
    })
*/
export const rootRoutes = () =>
    Object.values(getNav())
    .map(({Component, pattern, exact}) => (
        <Route
            exact={true}
            key={pattern}
            path={pattern}
            render={routeProps => {
                // @ts-ignore
                return (
                    <Component {...routeProps} {...routeProps.match.params} />
                )
            }}
        />
    ))
