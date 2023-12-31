import React from 'react';
import {Space, Table, Tag} from 'antd';
import type {ColumnsType} from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Номер',
    dataIndex: 'key',
    key: 'key',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Объект',
    dataIndex: 'status',
    key: 'status',
    render: (text) => <a>Новосибирск, ул. Первая, д 16 б.</a>,
  },
  {
    title: 'Заказчик',
    dataIndex: 'age',
    key: 'age',
    render: (text) => <a>Иванов И.И.</a>,
  },
  {
    title: 'Плановая дата',
    dataIndex: 'address',
    key: 'address',
    render: (text) => <span>13 мая 2023 </span>,
  },
  {
    title: 'Руководитель',
    dataIndex: 'address',
    key: 'address',
    render: (text) => <a>Иванов И.И.</a>,
  },

  {
    title: 'Смета',
    dataIndex: 'amount',
    key: 'amount',
    render: (text) => <a>12,234</a>,
  },
  {
    title: 'Статус',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
                <Tag color={color} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
            );
          })}
        </>
    ),
  },
  {
    title: 'Действия',
    key: 'action',
    render: (_, record) => (
        <Space size="middle">
          <a>Редактировать</a>

        </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sydney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
];

const App: React.FC = () => <Table columns={columns} dataSource={data} />;

export default App;