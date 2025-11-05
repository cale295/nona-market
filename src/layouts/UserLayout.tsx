import React from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/common/Navbar"

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
