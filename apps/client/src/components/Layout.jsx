import { Outlet, Link } from "react-router-dom";
import Navbar from "./ui/Navbar";


export default function Layout() {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}