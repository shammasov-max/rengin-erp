import { Column, Pie } from '@ant-design/plots';
import React, { FC } from 'react';
import { IssueVO, paymentTypes, TExpense } from 'iso/src/store/bootstrap/repos/issues';
import { getAnnotation, formatMoneyRub, getAnnotationDataCount } from './helpers';
import Space from 'antd/es/space';

const getExpenses = (issue: IssueVO): TExpense[] => issue.expenses;

const EXPENSE_PURPOSE = {
    material: 'Материалы',
    service: 'Работы',
    gsm: 'ГСМ',
    other: 'Прочее',
}

const materialsFilter = (expense: TExpense) => expense.purposeType === EXPENSE_PURPOSE.material;
const serviceFilter = (expense: TExpense) => expense.purposeType === EXPENSE_PURPOSE.service;
const gsmFilter = (expense: TExpense) => expense.purposeType === EXPENSE_PURPOSE.gsm;
const otherFilter = (expense: TExpense) => expense.purposeType === EXPENSE_PURPOSE.other;

const cashFilter = (expense: TExpense) => expense.paymentType === paymentTypes.cash;
const cashlessFilter = (expense: TExpense) => expense.paymentType === paymentTypes.cashless;

const amountReducer = (acc: number, expense: TExpense) => {
    const localAmount = expense.amount ? expense.amount : 0;
    return acc += localAmount;
}

interface ExpensesChartProps {
    allIssues: IssueVO[];
}

export const ExpensesChart: FC<ExpensesChartProps> = (
    {
        allIssues,
    }
) => {
    let data: Array<{ type: string, value: number, paymentType: string }> = [];

    const allExpenses: TExpense[] = allIssues.map(getExpenses).filter(e => !!e).flat();

    const amount = {
        material: {
            cash: allExpenses.filter(materialsFilter).filter(cashFilter).reduce(amountReducer, 0),
            cashless: allExpenses.filter(materialsFilter).filter(cashlessFilter).reduce(amountReducer, 0)
        },
        service: {
            cash: allExpenses.filter(serviceFilter).filter(cashFilter).reduce(amountReducer, 0),
            cashless: allExpenses.filter(serviceFilter).filter(cashlessFilter).reduce(amountReducer, 0),
        },
        gsm: {
            cash: allExpenses.filter(gsmFilter).filter(cashFilter).reduce(amountReducer, 0),
            cashless: allExpenses.filter(gsmFilter).filter(cashlessFilter).reduce(amountReducer, 0),
        },
        other: {
            cash: allExpenses.filter(otherFilter).filter(cashFilter).reduce(amountReducer, 0),
            cashless: allExpenses.filter(otherFilter).filter(cashlessFilter).reduce(amountReducer, 0),
        },
    }

    data = [
        {
            type: EXPENSE_PURPOSE.material,
            value: Math.round(amount.material.cash),
            paymentType: paymentTypes.cash,
        },
        {
            type: EXPENSE_PURPOSE.material,
            value: Math.round(amount.material.cashless),
            paymentType: paymentTypes.cashless,
        },
        {
            type: EXPENSE_PURPOSE.service,
            value: Math.round(amount.service.cash),
            paymentType: paymentTypes.cash,
        },
        {
            type: EXPENSE_PURPOSE.service,
            value: Math.round(amount.service.cashless),
            paymentType: paymentTypes.cashless,
        },
        {
            type: EXPENSE_PURPOSE.gsm,
            value: Math.round(amount.gsm.cash),
            paymentType: paymentTypes.cash,
        },
        {
            type: EXPENSE_PURPOSE.gsm,
            value: Math.round(amount.gsm.cashless),
            paymentType: paymentTypes.cashless,
        },
        {
            type: EXPENSE_PURPOSE.other,
            value: Math.round(amount.other.cash),
            paymentType: paymentTypes.cash,
        },
        {
            type: EXPENSE_PURPOSE.other,
            value: Math.round(amount.other.cashless),
            paymentType: paymentTypes.cashless,
        },
    ];

    const pieDataType = Object.values(EXPENSE_PURPOSE).map(category => ({
        type: category,
        value: data.reduce((acc, current) => current.type === category ? acc + current.value : acc, 0),
    }));

    const pieDataPaymentType = [
        {
            type: paymentTypes.cash,
            value: data.reduce((acc, current) => current.paymentType === paymentTypes.cash ? acc + current.value : acc, 0),
        },
        {
            type: paymentTypes.cashless,
            value: data.reduce((acc, current) => current.paymentType === paymentTypes.cashless ? acc + current.value : acc, 0),
        },
    ];
 
    const materialAmount = amount.material.cash + amount.material.cashless;
    const serviceAmount = amount.service.cash + amount.service.cashless;
    const gsmAmount = amount.gsm.cash + amount.gsm.cashless;
    const otherAmount = amount.other.cash + amount.other.cashless;

    const dataCount = getAnnotationDataCount(data);
    const annotations = [
        getAnnotation(EXPENSE_PURPOSE.material, materialAmount, { dataCount, content: formatMoneyRub(materialAmount) }),
        getAnnotation(EXPENSE_PURPOSE.service, serviceAmount, { dataCount, content: formatMoneyRub(serviceAmount) }),
        getAnnotation(EXPENSE_PURPOSE.gsm, gsmAmount, { dataCount, content: formatMoneyRub(gsmAmount) }),
        getAnnotation(EXPENSE_PURPOSE.other, otherAmount, { dataCount, content: formatMoneyRub(otherAmount) }),
    ];

    const config = {
        annotations,
        data,
        xField: 'type',
        yField: 'value',
        isStack: true,
        seriesField: 'paymentType',
        label: {
            position: 'middle',
            layout: [
                {
                    type: 'interval-adjust-position',
                },
                {
                    type: 'interval-hide-overlap',
                },
                {
                    type: 'adjust-color',
                },
            ],
        },
        tooltip: {
            formatter: (datum) => ({
              name: datum.paymentType,
              value: formatMoneyRub(datum.value),
            }),
          },
    };

    const pieConfigType = {
        appendPadding: 10,
        data: pieDataType,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        label: {
            type: 'inner',
            content: '{percentage}',
        },
        interactions: [
            {
                type: 'pie-legend-active',
            },
            {
                type: 'element-active',
            },
        ],
    };

    const pieConfigPaymentType = {
        ...pieConfigType,
        data: pieDataPaymentType,
    };

    return (
        <Space direction='vertical' style={{ width: '100%' }}>
            <Column {...config} />
            <Space>
                <Pie {...pieConfigType} />
                <Pie {...pieConfigPaymentType} />
            </Space>
        </Space>
    );
};