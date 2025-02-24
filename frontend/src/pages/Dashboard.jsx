import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, AppBar, Toolbar, Avatar, Menu, MenuItem, Divider, ListItemIcon, Snackbar, Alert, TextField, Typography } from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import './styles/Dashboard.css'


export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [anchorPFMenu, setAnchorPFMenu] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', level: 'info' });
    const [hospitals, setHospitals] = useState([]);
    const [requestedHosp, setRequestedHosp] = useState("");

    const showAlert = (msg, level) => {
        setAlert({ open: true, message: msg, level });
    };

    const handleCloseSnackbar = () => {
        setAlert({ ...alert, open: false });
    };

    const handlePFClick = (event) => {
        setAnchorPFMenu(event.currentTarget);
    };
    const handlePFMenuClose = () => {
        setAnchorPFMenu(null);
    };

    const checkLoginStatus = async () => {
        try {
            const response = await fetch("/api/whoami", {
                method: "GET",
                credentials: "include"
            });
            const data = await response.json();
            if (data.loggedIn) {
                setUser(data.user);
            } else {
                navigate("/login");
            }
        } catch (error) {
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setAnchorPFMenu(null);
        try {
            const response = await fetch("/api/auth/logout", {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                navigate("/login");
            } else {
                showAlert("Error Logging out. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error logging out:", error);
            showAlert("Error Logging out. Please try again.", "error");
        }
    };

    const fetchHospitals = async () => {
        try {
            const response = await fetch("/api/data/hospitals", {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                setHospitals(data);
            } else {
                showAlert("Error fetching hospitals. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error fetching:", error);
            showAlert("Error fetching. Please try again.", "error");
        }
    }

    const requestHospital = async (to) => {
        if (requestedHosp) {
            showAlert("You have already requested to a hospital, please wait", "info");
            return
        }
        try {
            const response = await fetch("/api/data/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ to: to })
            });
            if (response.ok) {
                const data = await response.json();
                setRequestedHosp(to);
                showAlert(data.message, "success");
            } else {
                showAlert("Error requesting hospital. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error requesting:", error);
            showAlert("Error requesting. Please try again.", "error");
        }
    }


    const cancelHospital = async () => {
        try {
            const response = await fetch("/api/data/cancel", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRequestedHosp("");
                showAlert(data.message, "success");
            } else {
                showAlert("Error requesting hospital. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error requesting:", error);
            showAlert("Error requesting. Please try again.", "error");
        }
    }

    const admitPatient = async (who) => {
        try {
            const response = await fetch("/api/data/admit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ who: who })
            });
            if (response.ok) {
                const data = await response.json();
                showAlert(data.message, "success");
                setUser({ ...user, requests: data.requests, admits: data.admits });
            } else {
                showAlert("Error requesting hospital. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error requesting:", error);
            showAlert("Error requesting. Please try again.", "error");
        }
    }
    const rejectPatient = async (who) => {
        try {
            const response = await fetch("/api/data/reject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ who: who })
            });
            if (response.ok) {
                const data = await response.json();
                showAlert(data.message, "success");
                setUser({ ...user, requests: data.requests });
            } else {
                showAlert("Error rejecting hospital. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error rejecting:", error);
            showAlert("Error rejecting. Please try again.", "error");
        }
    }



    const releasePatient = async (who) => {
        try {
            const response = await fetch("/api/data/release", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ who: who })
            });
            if (response.ok) {
                const data = await response.json();
                showAlert(data.message, "success");
                console.log(data)
                setUser({ ...user, admits: data.admits });
            } else {
                showAlert("Error releasing hospital. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error releasing:", error);
            showAlert("Error releasing. Please try again.", "error");
        }
    }

    useEffect(() => {
        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (user.userType == 'patient') {
            fetchHospitals();
            if (user.state === "pending") {
                setRequestedHosp(user.to);
            }
        }
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" sx={{ backgroundColor: "black", padding: "10px", borderRadius: "10px", width: "80vw", margin: "auto", marginTop: "20px" }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Hi {user?.name}! ({user?.userType})
                        </Typography>

                        {/* <img
                            src="/image.png"
                            alt="icon"
                            style={{
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                filter: 'brightness(0) invert(1)', // Turns dark image white
                                marginRight: '10px'
                            }}
                        /> */}

                        <Avatar
                            alt={user?.name} src={user?.avatar}
                            sx={{ cursor: 'pointer', borderStyle: 'solid', borderWidth: '1px', borderColor: 'grey.900' }}
                            onClick={handlePFClick}
                        />
                        <Menu
                            anchorEl={anchorPFMenu}
                            open={!!anchorPFMenu}
                            onClose={handlePFMenuClose}
                            onClick={handlePFMenuClose}
                            slotProps={{
                                paper: {
                                    elevation: 0,
                                    sx: {
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                        mt: 1.5,
                                        '& .MuiAvatar-root': {
                                            width: 32,
                                            height: 32,
                                            ml: -0.5,
                                            mr: 1,
                                        },
                                        '&::before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 14,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={() => navigate('/profile')}>
                                <Avatar alt={user?.name} src={user?.avatar} /> Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <Box sx={{
                    p: 4
                }}>
                    {user.userType === "patient" && (
                        user.state === "admitted" ? (
                            <>
                                <h2>You are admitted in: {user.to}</h2>
                            </>
                        ) : user.state === "rejected" ? (
                            // Add rejected UI here
                            <p>Rejected: </p>
                        ) : (
                            <ul className="hospital-list">
                                {hospitals.map((hospital, index) => (
                                    <li key={index} className="hospital-item">
                                        <span className="hospital-name">{hospital.name}</span>
                                        <span className="available-beds">Empty Beds: {hospital.emptyBeds}</span>
                                        <div className="button-group">
                                            <button
                                                onClick={() => requestHospital(hospital.username)}
                                                disabled={requestedHosp === hospital.username}
                                                className="request-button"
                                            >
                                                Request
                                            </button>
                                            <button className="cancel-button" onClick={cancelHospital}>
                                                Cancel
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    )}
                    {user.userType === "hospital" && (
                        <>
                            <h1>Hospital Name: {user.name}</h1>
                            <h3>Pending Requests:</h3>
                            <ul className="user-list">
                                {Object.entries(user.requests).map(([username, details]) => (
                                    <li className="user-item" key={username}>
                                        <span className="user-name">Name of patient: {details.name}</span>
                                        <div className="button-group">
                                            <button className="request-button" onClick={() => admitPatient(username, user.username)}>Accept</button>
                                            <button className="cancel-button" onClick={() => { rejectPatient(username) }}>Reject</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <h3>Admitted:</h3>
                            <ul>
                                {Object.entries(user.admits || {}).length > 0 ? (
                                    Object.entries(user.admits || {}).map(([username, details]) => (
                                        <li className="user-item" key={username}>
                                            <span className="user-name">
                                                Admitted Patient: {details?.name || "Unknown"}
                                            </span>
                                            <div className="button-group">
                                                <button className="release-button" onClick={() => releasePatient(username)}>Release</button>
                                                <button className="refer-button ">Refer</button>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li>No admitted patients</li>
                                )}
                            </ul>

                        </>
                    )}

                </Box>
                <Snackbar
                    open={alert.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert onClose={handleCloseSnackbar} severity={alert.level} sx={{ width: '100%' }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Box >
        </>
    );
}
