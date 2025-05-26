import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useAuth } from "./hooks/useAuth";
import {
  Avatar,
  Button,
  List,
  Skeleton,
  Popconfirm,
  Modal,
  DatePicker,
  TimePicker,
  Form,
  Input,
  Upload,
  message
} from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FlightAdder } from './FlightAdder.jsx';
import { useNavigate } from "react-router-dom";
import axios from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);

export const FlightEditor = () => {
  const [args, setArgs] = useState({});
  const [initLoading, setInitLoading] = useState(true);
  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const { user } = useAuth();

  const userTimezone = user?.timezone || "UTC";

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await axios.get(`${BACKEND_URL}/flights/user/${user.google_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const results = Array.isArray(res.data) ? res.data : [];
      setInitLoading(false);
      setData(results);
    })();
  }, [user]);

  const handleDelete = async (deleted) => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/flights/${deleted.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Flight deleted requested successfully!');
      const newData = data.filter(flight => flight.id !== deleted.id);
      setData(newData);
    } catch (error) {
      message.error('Error deleting flight');
    }
  };

  const handleAdd = async () => {
    setArgs({
      mode: "add",
    });
    form.resetFields();
  };

  const handleEdit = async (edited) => {
    setArgs({
      mode: "edit",
      id: edited.id,
    });
    const flightDate = dayjs(edited.time).tz(userTimezone);
    form.setFieldsValue({
      name: edited.name,
      date: flightDate,
      time: flightDate,
    });
  };

  return (
    <>
      <Modal
        title={args.mode === "add" ? 'Add Flight' : 'Edit Flight'}
        open={"mode" in args}
        footer={null}
        width={800}
        destroyOnHidden
        onCancel={() => setArgs({})}
      >
        <FlightAdder
          mode={args.mode}
          id={args.id}
          handleSubmit={() => setArgs({})}
          data={data}
          setData={setData}
          form={form}
          userTimezone={userTimezone}
        />
      </Modal>
      <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <List.Item
            actions={[
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              >
                Edit
              </Button>,
              <Popconfirm
                key="delete"
                title="Are you sure to delete this flight?"
                onConfirm={() => handleDelete(item)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={
                <Link to={`/Profile`}>
                  {item.name}
                </Link>
              }
              description={dayjs(item.time).tz(userTimezone).format("YYYY-MM-DD HH:mm")}
            />
            <div>Enjoy your flight!</div>
          </List.Item>
        )}
      />
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "16px",
          justifyContent: "center",
        }}
      >
        <Button type="primary" onClick={handleAdd}>Add Flight</Button>
        <Button type="primary" onClick={() => navigate("/")}>Back</Button>
      </div>
    </>
  );
};