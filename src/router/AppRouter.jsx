import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Guards from "./guards";

import Dashboard from "../pages/Dashboard";
import Dokter from "../pages/Dokter";
import Hewan from "../pages/Hewan";

import Login from "../pages/auth/Login";

const AppRouter = () => {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PRIVATE */}
        <Route
          path="/"
          element={
            <Guards>
              <MainLayout />
            </Guards>
          }
        >

          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="dokter"
            element={<Dokter />}
          />

          <Route
            path="hewan"
            element={<Hewan />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
};

export default AppRouter;