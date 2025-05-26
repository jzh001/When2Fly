import React, { useState } from 'react';
import {
  Button,
  DatePicker,
  TimePicker,
  Form,
  Input,
  Upload,
  message,
} from 'antd';
import { useNavigate } from "react-router-dom";
import axios from "axios";


export const FlightAdder = ({ mode, id, handleSubmit, data, setData }) => {
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleAdd = async ({ values }) => {
        try {
            const res = await axios.post('http://localhost:3000/flights/', values, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
    
            message.success('Flight added successfully!');
            console.log(res.data);

            setData([...data, res.data]);
        } catch (error) {
            message.error('Failed to add flight');
            console.error('Failed connection: ', error);
        }
    };
    
    const handleEdit = async ({ values }) => {
        try {
            const res = await axios.put(`http://localhost:3000/flights/${id}`, values, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
    
            message.success('Flight updated successfully!');
            console.log(res.data);
    
            setData(data.map(flight => flight.id === id ? res.data : flight));
        } catch (error) {
            message.error('Failed to update flight');
            console.error('Failed connection: ', error);
        }
    };

    return (
        <Form
        form={form}
        onFinish={inputs => {
            const values = {
                name: inputs['name'],
                time: `${inputs['date'].format('YYYY-MM-DD')}T${inputs['time'].format('HH:mm:ss')}`
            };
            console.log("Received the following values: ", values);
            switch (mode) {
                case "add":
                    handleAdd({ 
                        values: values,
                    });
                    break;
                case "edit":
                    handleEdit({ 
                        values: values,
                     });
                    break;
                default:
                    console.error("Unknown mode:", mode);
                    break;
            }
            handleSubmit();
        }}
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
