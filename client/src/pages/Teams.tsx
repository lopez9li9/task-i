import { Outlet } from "react-router-dom";

const Teams: React.FC = () => {
  return (
    <div>
      Welcome to Teams information
      <Outlet />
    </div>
  );
};

export default Teams;
