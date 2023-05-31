import { Link } from "react-router-dom";

import miracle from "../assets/images/Miracle-.png";

import { BtnFn } from "../components/BtnFn";
import { useDispatch, useSelector } from "react-redux";
import { selectUsers } from "../app/reducers/userSlice";
import { useEffect, useState } from "react";
import { fetchUsers } from "../app/actions/userActions";
import { store } from "../app/store";
import { RootState } from "../interfaces/appInterfaces";
export type AppDispatch = typeof store.dispatch;
const Landing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector<RootState>(selectUsers);
  const [name, setName] = useState("");

  console.log(users);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUsers({ options: name })).unwrap();
        console.log("i -------");
      } catch (error) {
        console.log(error);
        // Manejo de errores en caso de que la solicitud falle
      }
    };

    fetchData();
  }, [dispatch, name]);

  return (
    <div className="w-screen h-screen text-gray-700 bg-slate-200 dark:bg-gray-700 dark:text-slate-400">
      <div className="flex p-2 justify-end ">
        <BtnFn />
      </div>
      <div className="flex felx-row">
        <div className="w-2/3 py-2 px-5">
          <span className="py-5 m-2 text-5xl font-bold uppercase">i-musabaqa</span>
          <p className="p-2 text-2xl font-semibold text-justify">
            Welcome to our Dota 2 Tournament! Join the action and participate in this exciting competition alongside the best players in the world.
            Show your strategic ability and experience unforgettable moments in the virtual arena. Don't miss the opportunity to be part of this
            unique experience! Sign up now and get ready for battle!
          </p>
          <div className="text-red-400 text-5xl">In this part the possible awards are rendered</div>
        </div>
        <div className="flex flex-col justify-center p-2">
          <img src={miracle} alt="Miracle profile picture" />
          <Link
            to="/home"
            className="flex p-2 m-5 w-1/3 font-semibold hover:font-bold justify-center self-center bg-slate-300 dark:bg-slate-600 rounded-2xl hover:bg-gray-400 dark:hover:bg-gray-500 hover:text-gray-800 dark:hover:text-gray-100">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
