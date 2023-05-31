import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";

import { BtnFn } from "./BtnFn";

const Navbar: React.FC = () => {
  const routes = ["inscriptions", "teams", "stages", "games"];
  return (
    <div className="flex flex-row justify-between px-5 py-3 font-bold text-gray-600 bg-gray-400 dark:bg-gray-800 dark:text-gray-400">
      <div className="text-xl p-1  m-1 self-center rounded-2xl bg-transparent hover:text-gray-800 dark:hover:text-gray-100">
        <Link to="/">
          <AiFillHome />
        </Link>
      </div>

      <div className="flex flex-row">
        {routes.map((route, index) => (
          <Link
            to={route}
            key={index}
            className="px-2 py-1 m-1 text-xl uppercase rounded-2xl bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100">
            {route}
          </Link>
        ))}
      </div>

      <BtnFn />
    </div>
  );
};

export default Navbar;
