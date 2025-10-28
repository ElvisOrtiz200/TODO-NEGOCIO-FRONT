import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
   <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
