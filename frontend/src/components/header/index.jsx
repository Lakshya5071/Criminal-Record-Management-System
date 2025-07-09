import { Link } from "react-router"
import logo from "../../assets/images/logo.png"
import { FiCamera } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { useState } from "react";
import { FaUser } from "react-icons/fa";

export default function Header() {
    return (
        <>
            <header className="
                z-10
                fixed top-0 left-0 right-0
                h-[70px]
                bg-slate-100/90 backdrop-blur-xl
                shadow-[0_4px_5px_0px_rgba(0,0,0,0.1)]
                flex justify-between items-center
                px-container-px md:px-container-px-md

            ">
                <Link to="/">
                    <img
                        src={logo}
                        alt="Photography Club NITK"
                        className={`w-[100px]`}
                    />
                </Link>
                <div className="flex items-center justify-center gap-8 text-md">


                    <Link to="/analysis" className="hover:text-red-500 font-dmSans transition-colors">
                        Analysis
                    </Link>
                    <Link to="/people" className="hover:text-red-500 font-dmSans transition-colors">
                        People
                    </Link>
                    <Link to="/cases" className="hover:text-red-500 font-dmSans transition-colors">
                        Cases
                    </Link>
                    <Link to="/admin" className="hover:text-red-500 font-dmSans transition-colors ">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-2 bg-blue-50">
                            <FaUser />
                            Admin
                        </div>
                    </Link>

                </div>
            </header>
        </>
    )
}