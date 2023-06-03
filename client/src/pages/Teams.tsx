import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/reducers";
import { selectTeams } from "../app/reducers/teamSlice";
import { useEffect } from "react";
import { fetchTeams } from "../app/actions/teamActions";
import CardTeam from "../components/CardTeam";

const Teams: React.FC = () => {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectTeams);
  const name = "";

  console.log(teams);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchTeams({ options: name }));
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [dispatch, name]);

  return (
    <div>
      <Outlet />
      Welcome to Teams information
      <div>{teams && teams.map((team, index) => <CardTeam key={index} params={team} />)}</div>
    </div>
  );
};

export default Teams;
