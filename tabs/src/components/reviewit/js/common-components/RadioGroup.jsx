import React from 'react'
import { RadioGroup } from '@fluentui/react-northstar'

const customRadioGroup = () => {
    return (
        <RadioGroup
        id="priority"
        defaultCheckedValue="1"
        items={[
            {
            key: '0',
            label: 'Low',
            value: '0',
            },
            {
            key: '1',
            label: 'Normal',
            value: '1',
            },
            {
            key: '2',
            label: 'High',
            value: '2',
            },
        ] }
        className="customCardSpace"
    />
    );
}
  
export default customRadioGroup


