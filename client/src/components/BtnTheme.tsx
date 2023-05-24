import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../app/reducers/themeSlice";
import { RootState } from "../interfaces/appInterfaces";

const BtnTheme: React.FC = () => {
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

  return <button onClick={handleTheme}>{theme === "dark" ? "Light" : "Dark"}</button>;
};

export default BtnTheme;
