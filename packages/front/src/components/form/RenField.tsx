import { ProFormDatePicker } from '@ant-design/pro-components';
import {
    Button,
    Checkbox,
    DatePicker,
    Divider,
    Form,
    Input,
    Select,
    Space,
    Typography
} from 'antd';
import { ExtractProps } from '@sha/react-fp';
import getCrudPathname from '../../hooks/getCrudPathname';
import CreateButton from '../elements/CreateButton';
import { useContextEditorProperty } from '../pages/chapter-modal/useEditor';
import locale from 'antd/es/date-picker/locale/ru_RU';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import {
    AnyMeta,
    isItemOfMeta
} from 'iso/src/store/bootstrap/core/valueTypes';
import React, {
    useEffect,
    useRef,
    useState
} from 'react';
import {
    getRes,
    RESOURCES_MAP
} from 'iso/src/store/bootstrap/resourcesList';
import { useISOState } from 'iso/src/ISOState';
import './RenField.css';

const {Text, Link} = Typography;
type RenFormDateProps = ExtractProps<typeof ProFormDatePicker>
//2023-09-21T04:32:05.151Z
const DATE_FORMAT = 'YYYY-MM-DDTHH:MM:SS.sssZ';

export default ({meta, disabled, customOptions, defaultValue}: {
    meta: AnyMeta,
    disabled?: boolean,
    customOptions?: {
        value: string,
        label: string
    }[],
    defaultValue?: any,
}) => {
    const [itemToFocus, setItemToFocus] = useState(null);
    const editorProperty = useContextEditorProperty(meta.name);

    const state = useISOState();
    const {
        value,
        updateItemProperty,
        property,
        error,
        mode,
        params,
        editor
    } = editorProperty;

    const sharedProps = {
        disabled: (mode === 'edit' ? (property.immutable) : false) || disabled
    };

    const inputRef = useRef(null);

    useEffect(() => {
        if (itemToFocus) {
            itemToFocus?.current?.focus();
            setItemToFocus(null);
        }
    }, [error]);

    const renderInputControl = () => {

        if (property.immutable && mode === 'edit') {
            let text = value;
            if (isItemOfMeta(property)) {
                const reses = getRes(property.linkedResourceName);
                const linkedItem = reses.selectById(value)(state);

                if (linkedItem)
                    text = reses.getItemName(linkedItem);
            }
            return (
                <Text type="success">{text}</Text>
            );
        }
        if (isItemOfMeta(property)) {
            const { linkedResourceName } = property;
            const resource = RESOURCES_MAP[linkedResourceName];

            return (
                <Select
                    value={value}
                    optionFilterProp={'label'}
                    allowClear
                    showSearch
                    placeholder={property.headerName}
                    disabled={disabled}
                    onClear={() => {
                        updateItemProperty(null);
                    }}
                    onChange={e => {
                        updateItemProperty(e);
                    }}
                    style={{minWidth: '200px'}}
                    options={params.options}
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            <Divider style={{margin: '8px 0'}}/>
                            <Space style={{padding: '0 8px 4px'}}>
                                <CreateButton type="text" label="Добавить" resource={resource} />
                            </Space>
                        </>
                    )}
                    {...sharedProps}
                />);
        }
        if (property.type === 'enum') {
            return (
                <Select
                    value={value}
                    optionFilterProp={'label'}
                    showSearch={true}
                    placeholder={property.headerName}
                    onChange={e => {
                        console.log('Select onChange', e);
                        updateItemProperty(e);
                    }}
                    style={{minWidth: '200px'}}
                    options={customOptions || params.options}
                    dropdownRender={(menu) => (
                        <>
                            {menu}

                        </>
                    )}
                    {...sharedProps}
                />);
        } else if (editorProperty.property.type === 'boolean')
            return (
                <Checkbox
                    checked={value}
                    onChange={e => {
                        updateItemProperty(e.target.checked);
                    }}
                    {...sharedProps}/>)
                ;
        else if (editorProperty.property.type === 'date')
            return (
                <DatePicker
                    format="DD-MM-YYYY"
                    allowClear
                    locale={locale}
                    defaultValue={defaultValue}
                    value={value === undefined || value === null ? undefined : dayjs(value)}
                    onChange={e => {
                        updateItemProperty(e ? e.toDate().toISOString() : null);
                    }}
                    {...sharedProps}
                />
            );
        else if (editorProperty.property.type === 'text')
            return (
                <TextArea
                    value={value}
                    onBlur={e => {
                        updateItemProperty(e.target.value);
                    }}
                    onChange={e => {
                        updateItemProperty(e.target.value);
                    }}
                    {...sharedProps}
                />
            );
        else return (
            <Input
                ref={inputRef}
                value={editorProperty.value}
                onBlur={e => {
                    updateItemProperty(e.target.value);
                }}
                onChange={e => {
                    setItemToFocus(inputRef);
                    updateItemProperty(e.target.value);
                }}
                {...sharedProps}
            />
        );
    };

    if (error) {
        return (
            <Form.Item label={property.headerName} validateStatus={'error'} hasFeedback={true} help={error}
                       required={property.required}>{renderInputControl()}</Form.Item>)
            ;
    }
    return (
        <Form.Item label={property.headerName}
                   required={property.required}>{renderInputControl()}<span></span></Form.Item>)
        ;
};