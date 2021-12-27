// Init
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Table from "../../components/common/Datatable";
import api from "../../api";
import Loader from "../../components/common/Loader";

const columns = [
  { id: "name", label: "Name", minWidth: 170, align: "center" },
  { id: "gender", label: "Gender", minWidth: 170, align: "center" },
  { id: "email", label: "Email", minWidth: 170, align: "center" },
  { id: "phone", label: "Phone", minWidth: 170, align: "center" },
  { id: "role", label: "Role", minWidth: 170, align: "center" },
  { id: "survey", label: "Survey", minWidth: 170, align: "center" },
];

// Patients Component
export default function Patients() {
  const [users, setUsers] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const users = await api("get", "/users/getPatients");
    setUsers(users.data.patients);
  };

  return (
    <div className="patientslist_main_container">
      <Typography
        variant="h4"
        noWrap
        component="div"
        sx={{ marginBottom: "30px" }}
      >
        Patients
      </Typography>
      {users ? <Table columns={columns} rows={users}></Table> : <Loader />}
    </div>
  );
}
