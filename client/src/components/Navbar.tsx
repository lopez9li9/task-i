import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { RootState } from "../interfaces/appInterfaces";
import { setTheme } from "../app/reducers/themeSlice";

const Navbar = () => {
  const dispatch = useDispatch();

  const theme = useSelector<RootState, string>((state) => state.theme.theme);

  const [localTheme, setLocalTheme] = useState<string>(theme);

  const htmlDoc = document.documentElement;

  const handleTheme = () => {
    setLocalTheme(localTheme === "light" ? "dark" : "light");
    dispatch(setTheme(localTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (htmlDoc.classList) {
      localTheme === "light" ? htmlDoc.classList.remove("dark") : htmlDoc.classList.add("dark");
    }
  }, [localTheme, htmlDoc.classList]);

  return (
    <div className="flex flex-row justify-between px-5 py-3 font-bold text-red-600 bg-gray-200 dark:bg-gray-800 dark:text-slate-400">
      <div className="px-3 py-1 text-lg rounded-2xl dark:bg-transparent dark:hover:bg-gray-700 dark:hover:text-gray-100">
        <Link to="/">Landing</Link>
      </div>
      <div onClick={handleTheme}>{localTheme === "light" ? "dark" : "light"}</div>
    </div>
  );
};

export default Navbar;
