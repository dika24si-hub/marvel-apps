import { Navigate } from "react-router-dom";

const Guards = ({ children }) => {

  const isLogin =
    localStorage.getItem("isLogin");

  if(!isLogin){
    return <Navigate to="/login" />;
  }

  return children;
};

export default Guards;