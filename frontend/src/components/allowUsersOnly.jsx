import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { message } from "antd";
import { useEffect, useRef } from "react";

export default function AllowUsersOnly({ children }) {
  const { user, loading } = useAuth();
  const hasShownLoginMessage = useRef(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!loading && !user && !hasShownLoginMessage.current) {
      messageApi.error("You must be logged in to access this page");
      hasShownLoginMessage.current = true;
      setTimeout(() => {
        hasShownLoginMessage.current = false;
      }, 1000);
    }
  }, [user, loading, messageApi]);

  if (loading) return <p>Loading...</p>;
  if (!user) {
    return (
      <>
        {contextHolder}
        <Navigate to={"/"} replace />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}
