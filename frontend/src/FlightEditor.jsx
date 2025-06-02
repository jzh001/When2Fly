import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useAuth } from "./hooks/useAuth";
import { Avatar, Button, List, Popconfirm, Modal, Form, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FlightAdder } from "./FlightAdder.jsx";
import axios from "axios";
import AllowUsersOnly from "./components/allowUsersOnly.jsx";
import "./Home.css"; // Import Home.css for consistent styling

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
      const res = await axios.get(
        `${BACKEND_URL}/flights/user/${user.google_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const results = Array.isArray(res.data) ? res.data : [];
      setInitLoading(false);
      setData(results);
    })();
  }, [user]);

  const handleDelete = async (deleted) => {
    try {
      await axios.delete(`${BACKEND_URL}/flights/${deleted.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Flight deleted requested successfully!");
      const newData = data.filter((flight) => flight.id !== deleted.id);
      setData(newData);
    } catch (error) {
      message.error("Error deleting flight");
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
    const flightDateTime = dayjs.utc(edited.time).tz(userTimezone);
    form.setFieldsValue({
      name: edited.name,
      date: flightDateTime,
      time: dayjs(flightDateTime.format("HH:mm:ss"), "HH:mm:ss"),
    });
  };
  return (
    <>      <AllowUsersOnly>
        <div className="home-root" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 16px' }}>
          <div className="home-body" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '700px', background: '#fff', borderRadius: '14px', boxShadow: '0 4px 24px rgba(30,41,59,0.09)', padding: '36px 32px', marginBottom: '40px' }}>
            <div
              style={{
                textAlign: "center",
                color: "#888",
                fontSize: 14,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Showing times in your timezone: <b>{userTimezone}</b>
            </div>
            <List
              className="demo-loadmore-list"
              loading={initLoading}
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item) => (
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
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<Link to={`/Profile`}>{item.name}</Link>}
                    description={dayjs
                      .utc(item.time)
                      .tz(userTimezone)
                      .format("YYYY-MM-DD HH:mm")}
                  />
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
              <Button type="primary" onClick={handleAdd}>
                Add Flight
              </Button>
              <Button type="primary" onClick={() => navigate("/")}>
                Back
              </Button>
            </div>
          </div>
        </div>
        <Modal
          title={args.mode === "add" ? "Add Flight" : "Edit Flight"}
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
      </AllowUsersOnly>
    </>
  );
};
