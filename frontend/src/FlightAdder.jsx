import React, { useState } from 'react';
import {
  Button,
  DatePicker,
  TimePicker,
  Form,
  Input,
  Upload,
} from 'antd';

const onFinish = async (inputs) => {
    const values = Object.assign(Object.assign({}, inputs), {
      'date': inputs['date'].format('YYYY-MM-DD'),
      'time': inputs['time'].format('HH:mm:ss'),
      'name': inputs['name']
    });
    console.log("Received the following values: ", values);
    try {
        const res = await fetch('http://localhost:3000/flights/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
  
        if (!res.ok) 
            throw new Error(`Bad HTTP server response with status: ${res.status}`);
  
        const data = await res.json();
        console.log('Flight addition requested successfully!');
        console.log({data});
    } catch (error) {
        console.error('Failed connection: ', error);
    }
};

export const FlightAdder = () => {
    const [form] = Form.useForm();

    return (
        <Form
        form={form}
        onFinish={onFinish} 
        style={{ maxWidth: 600 }}
        labelAlign="right"
        >
            <Form.Item 
                name="name" 
                label="Name" 
                rules={[{ required: true, message: 'Please enter your name!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please choose a date!' }]}
            >
                <DatePicker />
            </Form.Item>
            
            <Form.Item 
                name="time" 
                label="Time"
                rules={[{ type: 'object', required: true, message: 'Please select a time!' }]}
            >
                <TimePicker />
            </Form.Item>

            <Form.Item 
                wrapperCol={{ offset: 6, span: 16 }}
            >
                <Button type="primary" htmlType="submit">
                Submit
                </Button>
            </Form.Item>
        </Form>
    );
};
