import { Link } from "react-router"

export default function Footer() {
    return (
        <footer className="bg-[#c8c2a6] border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800">
                    <p className="text-center text-sm text-gray-600">
                        © {new Date().getFullYear()} BCT. All rights reserved.
                    </p>
                </div>
            </div>

        </footer>
    )
}