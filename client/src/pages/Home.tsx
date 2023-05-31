import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="w-screen h-screen text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-slate-400">
      <Navbar />
      Home
      <Outlet />
    </div>
  );
};

export default Home;
