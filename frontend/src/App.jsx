import { Routes, Route } from 'react-router';
import Header from "./components/header";
import { Footer } from "flowbite-react";
import { ThemeProvider } from "./context/ThemeContext";
import Cases from "./pages/cases/";
import People from "./pages/people/"
import CaseDetails from "./pages/caseDetails/";
import Admin from "./pages/admin/";
import { Toaster } from 'react-hot-toast';
import HomePage from "./pages/home/index";

export default function App() {
  return (
    <ThemeProvider>
      <div className="bg-complementPrimary min-h-screen flex flex-col">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: 'green',
              },
            },
            error: {
              style: {
                background: 'red',
              },
            },
          }}
        />
        <Header />
        <div className="pt-[65px] flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analysis" element={<HomePage />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/people" element={<People />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <Footer container className="border-t-2 border-gray-200 rounded-none">
          <Footer.Copyright href="#" by="BCT" year={2025} />
          <Footer.LinkGroup>
            <Footer.Link href="#">Analysis</Footer.Link>
            <Footer.Link href="#">Cases</Footer.Link>
            <Footer.Link href="#">People</Footer.Link>
          </Footer.LinkGroup>
        </Footer>
      </div>
    </ThemeProvider>
  );
}
