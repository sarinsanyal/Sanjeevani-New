import react, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

export default function Home() {
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const response = await fetch('/api/whoami');
            if (response.ok) {
                const data = await response.json();
                setLoggedIn(data.loggedIn);
            }
        };
        checkLoggedIn();
    }, [navigate]);

    const showButton = location.pathname === '/';

    return (
        <>
            {/* Navigation Bar */}
            <nav style={{ backgroundColor: "black", padding: "10px", borderRadius: "10px", width: "80vw", margin: "auto", marginTop: "20px" }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    maxWidth: "1200px", margin: "auto"
                }}>
                    <Link to="/" style={{ color: "white", textDecoration: "none", fontSize: "20px", fontWeight: "bold" }}>
                        Sanjeevani
                    </Link>
                    {showButton && (
                        <Link to={loggedIn ? "/dashboard" : "/login"}>
                            <button style={{
                                backgroundColor: "gray", color: "white", border: "none",
                                padding: "10px 20px", cursor: "pointer", borderRadius: "5px",
                                fontSize: "16px", fontWeight: "bold", transition: "0.3s"
                            }}
                                onMouseOver={(e) => e.target.style.opacity = "0.8"}
                                onMouseOut={(e) => e.target.style.opacity = "1"}>
                                {loggedIn ? "Dashboard" : "Login"}
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", textAlign: "center", padding: "60px 20px",
                maxWidth: "800px", margin: "auto", borderRadius: "10px", marginTop: "20px"
            }}>
                <h1 style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "10px" }}>
                    <Typewriter
                        words={["Welcome to Sanjeevani!"]}
                        cursor
                        cursorStyle="_"
                        typeSpeed={80}  
                        deleteSpeed={50}  
                        delaySpeed={1000}
                    />
                </h1>
                <h3 style={{ fontSize: "20px", color: "#555", marginBottom: "30px" }}>
                    A platform to help you find the right hospital at the quickest time possible.
                </h3>
                <h4 style={{ fontSize: "18px", color: "#555", marginBottom: "30px" }}>
                    Register now to get started!
                </h4>
                <p style={{
                    fontSize: "18px", lineHeight: "1.6", color: "#444",
                    padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                    Created by <strong>Team GodsOfDev</strong> consisting of: <br /><br />
                    1. Malay Patra <br />
                    2. Sarin Sanyal <br />
                    3. Soumyadeep Roy Chowdhury <br /><br />
                    For IEEE Double Slash 3.0 2024
                </p>
            </div>
        </>
    );
}
