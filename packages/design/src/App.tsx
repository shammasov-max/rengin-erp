import React, {useState} from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {Breadcrumb, Button, Layout, Menu, Modal, theme} from 'antd';
import TicketsPage from "./pages/TicketsPage";
import TicketsTable from "./pages/TicketsTable";
import TicketForm from "./pages/TicketForm";
import MainMenu from "./MainMenu";

const { Header, Content, Sider } = Layout;

const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
    key,
    label: `nav ${key}`,
}));

const items2: MenuProps['items'] = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
    (icon, index) => {
        const key = String(index + 1);

        return {
            key: `sub${key}`,
            icon: React.createElement(icon),
            label: `subnav ${key}`,

            children: new Array(4).fill(null).map((_, j) => {
                const subKey = index * 4 + j + 1;
                return {
                    key: subKey,
                    label: `option${subKey}`,
                };
            }),
        };
    },
);

const App: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');

    const showModal = () => {
        setOpen(true);
    };

    const handleOk = () => {
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };
    return (
        <Layout>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="70" fill="none" viewBox="0 0 279 70">
                    <mask id="a" width="233" height="70" x="23" y="0" maskUnits="userSpaceOnUse" style={{maskType:"luminance"}}>
                        <path fill="#fff" d="M256 0H23v70h233V0Z"/>
                    </mask>
                    <g mask="url(#a)">
                        <path fill="url(#b)" d="M85.231 68.19V31.199l-10.447-3.115-2.176.985V3.962L62.352 0 39.974 10.33v34.29l-10.089 3.093V68.19H23v1.672h8.654V48.927l8.344-2.566v23.502h8.942V47.049l-7.197-2.428V11.384l19.772-9.14v31.817l-10.95 4.948v30.854h8.296V45.125l12.002-4.123v28.86h9.73V40.957l-7.985-1.81V30.9l2.32-1.054 8.558 2.543v37.474h7.1V68.19h-5.355Zm-38.06-19.95v19.928H41.72V46.384l5.45 1.856Zm23.692-9.025-13.747 4.718v24.235h-4.805V40.062l18.552-8.36v7.513Zm0-9.369-7.579 3.413V2.153l7.579 2.932v24.761Zm7.985 12.438v25.907h-6.24V40.864l6.24 1.42Z"/>
                        <path fill="#fff" d="M150.876 23.755v16.424h4.411V17.011h-4.191l-12.983 16.425V17.01h-4.411v23.17h4.192l12.982-16.424Zm28.717-6.744h-20.427v3.627h7.977v19.541h4.442V20.638h8.008V17.01Zm37.79-1.558c4.16 0 6.287-1.709 6.318-4.796h-3.096c-.063 1.649-1.252 2.548-3.222 2.548-2.003 0-3.098-.9-3.129-2.548h-3.128c.031 3.057 2.096 4.796 6.257 4.796Zm-6.32 17.983V17.01h-4.411v23.17h4.193l12.981-16.424V40.18h4.411V17.011h-4.161l-13.013 16.425Zm26.558-16.425-.343 9.591c-.25 6.534-1.127 9.95-4.066 9.95-.376 0-.689-.03-1.033-.12l-.313 3.747c.938.21 1.689.33 2.44.33 5.224 0 6.632-4.945 6.944-14.057l.219-5.784h9.541v19.511h4.411V17.011h-17.8ZM111.523 55.585v-8.752h-2.346v12.348h2.221l6.914-8.752v8.752h2.346V46.833h-2.221l-6.914 8.752Zm21.804-3.657h-6.663v-5.095h-2.378v12.348h2.378v-5.305h6.663v5.305h2.377V46.833h-2.377v5.095Zm22.961-5.095h-2.534l-3.19 5.185h-2.221v-5.185h-2.316v5.185h-2.283l-3.128-5.185h-2.534l3.754 5.904-4.036 6.444h2.753l3.253-5.215h2.221v5.215h2.316v-5.215h2.221l3.222 5.215h2.753l-4.005-6.414 3.754-5.934Zm4.317 8.752v-8.752h-2.346v12.348h2.221l6.913-8.752v8.752h2.346V46.833h-2.221l-6.913 8.752Zm21.773-3.657h-6.664v-5.095h-2.377v12.348h2.377v-5.305h6.664v5.305h2.408V46.833h-2.408v5.095Zm8.383 3.657v-8.752h-2.377v12.348h2.221l6.913-8.752v8.752h2.377V46.833h-2.221l-6.913 8.752Zm18.019-8.752h-5.287v12.318h2.377v-3.566h2.91c3.379 0 5.474-1.679 5.474-4.376 0-2.698-2.095-4.376-5.474-4.376Zm-.094 6.834h-2.785V48.78h2.785c2.096 0 3.19.9 3.19 2.458-.031 1.528-1.094 2.428-3.19 2.428Zm10.197 1.918v-8.752h-2.346v12.348h2.221l6.915-8.752v8.752h2.346V46.833h-2.221l-6.915 8.752Zm21.805-3.657h-6.663v-5.095h-2.377v12.348h2.377v-5.305h6.663v5.305h2.377V46.833h-2.377v5.095Zm6.006 7.253h2.346v-10.4h6.381v-1.948h-8.727v12.348ZM113.682 33.496h5.443c6.35 0 10.292-3.148 10.292-8.243 0-5.125-3.942-8.242-10.292-8.242h-7.758l-2.19 3.627h9.76c3.942 0 5.975 1.678 5.975 4.585 0 2.908-2.033 4.586-5.975 4.586h-9.76v10.34h4.505v-6.653Zm85.244-12.888 2.19-3.597h-17.644v3.597h15.454Zm-10.949 9.561h11.668v-3.537h-16.173v13.547h18.145v-3.626h-13.64v-6.384Z"/>
                    </g>
                    <defs>
                        <linearGradient id="b" x1="255.421" x2="216.902" y1="69.863" y2="-58.285" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#2AF598"/>
                            <stop offset="1" stop-color="#009EFD"/>
                        </linearGradient>
                    </defs>
                </svg>


            </Header>
            <Layout>
                <Sider width={200} style={{ background: colorBgContainer }}>
                    <MainMenu/>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>List</Breadcrumb.Item>
                        <Breadcrumb.Item>App</Breadcrumb.Item>
                    </Breadcrumb>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                        }}
                    >
                        <Button onClick={() => showModal()} type={'primary'}>Добавить</Button>
                        <TicketsTable/>
                        <Modal
                            title="Title"
                            open={open}
                            onOk={handleOk}
                            confirmLoading={confirmLoading}
                            onCancel={handleCancel}
                        >
                            <TicketForm/>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default App;