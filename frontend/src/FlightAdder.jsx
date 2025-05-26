import React from 'react';
import {
    Button,
    DatePicker,
    TimePicker,
    Form,
    Input,
    message,
} from 'antd';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const FlightAdder = ({ mode, id, handleSubmit, data, setData, form, userTimezone = "UTC" }) => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleAdd = async ({ values }) => {
        try {
            const res = await axios.post(`${BACKEND_URL}/flights/`, values, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            message.success('Flight added successfully!');
            setData([...data, res.data]);
        } catch (error) {
            message.error('Failed to add flight');
            console.error('Failed connection: ', error);
        }
    };

    const handleEdit = async ({ values }) => {
        try {
            const res = await axios.put(`${BACKEND_URL}/flights/${id}`, values, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            message.success('Flight updated successfully!');
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
                const localDateTime = dayjs(`${inputs['date'].format('YYYY-MM-DD')}T${inputs['time'].format('HH:mm:ss')}`).tz(userTimezone, true);
                const utcTime = localDateTime.utc().format();

                const values = {
                    name: inputs['name'],
                    time: utcTime
                };
                switch (mode) {
                    case "add":
                        handleAdd({ values });
                        break;
                    case "edit":
                        handleEdit({ values });
                        break;
                    default:
                        console.error("Unknown mode:", mode);
                        break;
                }
                handleSubmit();
            }}
            style={{ maxWidth: 600, margin: "0 auto" }}
            labelAlign="right"
            layout="vertical"
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
                <Form.Item
                    wrapperCol={{ span: 24 }}
                    style={{ display: "flex", justifyContent: "left" }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form.Item>
        </Form>
    );
};