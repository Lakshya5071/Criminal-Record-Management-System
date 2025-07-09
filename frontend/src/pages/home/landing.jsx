import landingImg from "../../assets/images/landing.png";
import logo from "../../assets/images/logo.png"

function Landing() {
    return (
        <div className="relative h-[calc(60vh-65px)]">
            {/* Background container */}

            <div className="absolute inset-0">
                <img src={landingImg}
                    alt="landing"
                    className="w-full h-full object-cover brightness-90"
                />
            </div>

            {/* Content container */}
            <div className="relative h-full flex flex-col items-center justify-center px-container-px md:px-container-px-md">
                <img src={logo} alt="logo" className="w-[300px]" />
                <p className="pt-6 px-4 max-w-[500px] text-center text-black text-base md:text-lg font-light"
                    style={{ textShadow: '0 0 12px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.8)' }}>
                    Law Enforcement and Case Tracking System
                </p>
            </div>
        </div>
    )
}

export default Landing