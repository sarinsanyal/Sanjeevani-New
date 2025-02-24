import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import { DynamicAvatar, BackBtn } from '../components/CustomMui';
import { Logout } from '@mui/icons-material';


export default function Profile() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [alert, setAlert] = useState({ open: false, message: '', level: 'info' });

    const showAlert = (msg, level) => {
        setAlert({ open: true, message: msg, level });
    };

    const handleCloseSnackbar = () => {
        setAlert({ ...alert, open: false });
    };


    const checkLoginStatus = async () => {
        try {
            const response = await fetch('/api/whoami', { credentials: 'include' });
            const data = await response.json();
            if (data.loggedIn) {
                setUser(data.user);
            } else {
                navigate('/login');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error checking login status:', error);
            showAlert('Error checking login status.', 'error');
        }
    };
    useEffect(() => {
        checkLoginStatus();
    }, []);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadAvatar(file);
        }
    };

    const uploadAvatar = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/profile/newavatar', {
                method: 'PUT',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();
            if (response.ok) {
                setUser(result.user);
            } else {
                showAlert(result.message || 'Failed to update avatar.', 'error');
            }
        } catch (error) {
            showAlert('Error updating avatar. Please try again.', 'error');
        }
    };

    const handleLogout = async () => {
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <>
            <BackBtn to={"/dashboard"} />
            <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
                <Box sx={{ textAlign: 'center' }} >
                    <DynamicAvatar src={user.avatar} name={user.name} handleAvatarChange={handleAvatarChange} mb={2} />
                    <Typography variant="h5" fontWeight="bold">
                        {user.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" marginBottom={2}>
                        {'@' + user.username}
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Logout />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>

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
            </Box>
        </>
    )
}