import React, { useEffect, useState } from 'react';
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
  message } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FlightAdder } from './FlightAdder.jsx';
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const FlightEditor = () => {
  const [args, setArgs] = useState({});
  const [initLoading, setInitLoading] = useState(true);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const form = Form.useForm();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // It turns out that the function passed to useEffect can only return a cleanup function,
    // and async functions are not supported since they return a promise
    (async () => {
      const res = await axios.get('http://localhost:3000/flights/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched user flights successfully!");
      const results = Array.isArray(res.data) ? res.data : [];
      console.log({results});
      setInitLoading(false);
      setData(results);
    })();
  }, []);

  // More lightweight than editing: direcly updates the list of flights
  const handleDelete = async (deleted) => {
    try {
        const res = await axios.delete(`http://localhost:3000/flights/${deleted.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success('Flight deleted requested successfully!');

        const newData = data.filter(flight => flight.id !== deleted.id);
        setData(newData);
    } catch (error) {
      console.error('Error deleting flight:', error);
      message.error('Error deleting flight');
    }
  };

  // Requires updating the state to display a modal & thus needs to keep track of flight id
  const handleAdd = async () => {
    setArgs({
      mode: "add",
    });
  };

  const handleEdit = async (edited) => {
    setArgs({
      mode: "edit",
      id: edited.id,
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
    >
      <FlightAdder
        mode={args.mode} 
        id={args.id}
        handleSubmit={() => setArgs({})}
        data={data}
        setData={setData}
      />
    </Modal>
    <List
      className="demo-loadmore-list"
      loading={initLoading}
      itemLayout="horizontal"
      dataSource={data}
      renderItem={item => (
        <List.Item
          actions={[<Button 
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
          </Popconfirm>]}
        >
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={
              <Link to={`/Profile`}>
                {item.name}
              </Link>
            }
            description={item.time.split("T").join(" ")}
          />
          <div>Enjoy your flight!</div>
        </List.Item>
      )}
    />
    <Button type="primary" onClick={handleAdd}>Add Flight</Button>
    <Button type="primary" onClick={() => navigate("/")}>Back</Button>
  </>
  );
};