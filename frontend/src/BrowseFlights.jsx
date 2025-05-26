import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    List,
    Skeleton,
    Switch,
    Slider,
    message,
} from 'antd';
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BrowseFlights = () => {
    const [flights, setFlights] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [interval, setInterval] = useState(24); // hours
    const [showMine, setShowMine] = useState(false);
    const { user } = useAuth();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return;
        const fetchFlights = async () => {
            setInitLoading(true);
            const now = new Date();
            try {
                const res = await axios.get(
                    `${BACKEND_URL}/flights/allFlights?time=${encodeURIComponent(now.toISOString())}&interval=${interval}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFlights(res.data || []);
            } catch (error) {
                message.error("Failed to load flights.");
                setFlights([]);
            } finally {
                setInitLoading(false);
            }
        };
        fetchFlights();
    }, [interval, token]);

    // Filter out own flights if toggle is off
    const filteredFlights = flights.filter(f =>
        showMine || !user || String(f.userId) !== String(user.google_id)
    );

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
            <h2 style={{ textAlign: "center" }}>Browse All Flights</h2>
            <div style={{ margin: "24px 0", display: "flex", alignItems: "center", gap: 24, justifyContent: "center" }}>
                <span>Show flights in next</span>
                <Slider
                    min={1}
                    max={168}
                    value={interval}
                    onChange={setInterval}
                    marks={{ 1: "1h", 24: "1d", 72: "3d", 168: "7d" }}
                    tooltip={{ open: true, formatter: v => (v >= 24 ? `${Math.round(v / 24)}d` : `${v}h`) }}
                    style={{ width: 200 }}
                />
                <span>{interval >= 24 ? `${Math.round(interval / 24)} day(s)` : `${interval} hour(s)`}</span>
                <Switch
                    checked={showMine}
                    onChange={setShowMine}
                    style={{ marginLeft: 24 }}
                />
                <span>Show my flights</span>
            </div>
            <List
                className="demo-loadmore-list"
                loading={initLoading}
                itemLayout="horizontal"
                dataSource={filteredFlights}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={
                                <>
                                    <span>{item.name}</span>
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                        {item.users?.name ? `by ${item.users.name}` : ""}
                                    </span>
                                </>
                            }
                            description={`Time: ${item.time} | User: ${item.userId}`}
                        />
                        <div>Enjoy your flight!</div>
                    </List.Item>
                )}
                locale={{ emptyText: "No flights found in this window." }}
            />
            <div style={{ display: "flex", gap: "16px", marginTop: "16px", justifyContent: "center" }}>
                <Button type="primary" onClick={() => navigate("/")}>Back</Button>
            </div>
        </div>
    );
};

export default BrowseFlights;