import Analysis from "./analysis"

export default function HomePage() {


    return (
        <div className="bg-gradient-to-br from-gray-100 to-white">
            {/* <Landing /> */}
            {/* Refer to tailwind.config.js for container, container-px and container-px-md variables */}
            <div className="max-w-container px-container-px py-5 mx-auto flex flex-col md:py-7 md:px-container-px-md">
                <Analysis />
            </div>
        </div >


    )
}