import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { HiMoon } from "react-icons/hi2";
import { HiSun } from "react-icons/hi2";

import { RootState } from "../interfaces/appInterfaces";
import { setTheme } from "../app/reducers/themeSlice";

export const BtnTheme: React.FC = () => {
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
    <div
      onClick={handleTheme}
      className="text-xl p-1  m-1 self-center rounded-2xl bg-transparent hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100">
      {theme === "dark" ? <HiSun /> : <HiMoon />}
    </div>
  );
};

export const BtnSession: React.FC = () => {
  return (
    <div className="text-xl p-1  m-1 self-center rounded-2xl bg-transparent hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100">
      <FaUserCircle />
    </div>
  );
};

export const BtnFn: React.FC = () => {
  return (
    <div className="flex flex-row items-center">
      <BtnTheme />
      <BtnSession />
    </div>
  );
};
