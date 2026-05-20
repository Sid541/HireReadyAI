import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/Pages/Home";
import Interview from "./features/Pages/Interview";
import AllInterview from "./features/Pages/AllInterview";
import InterviewReport from "./features/Pages/InterviewReport";


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
    },
    {
        path:"/interview",
        element:<AllInterview/>
    },
    {
        path:"/interview/report",
        element:<InterviewReport/>
    }
])