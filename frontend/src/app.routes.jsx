import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/Pages/Home";
import Interview from "./features/Pages/Interview";


export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
         path: "/",
        element: <Home/>
    },
    {
        path:"/interview/:interviewId",
        element: <Interview />
    }
])