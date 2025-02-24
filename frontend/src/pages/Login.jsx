import { useState, useEffect } from 'react';
import { Paper, Box, TextField, Stack, Button, Snackbar, Alert, CircularProgress, Typography } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { BackBtn } from '../components/CustomMui';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [formErrors, setFormErrors] = useState({ username: '', password: '' });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', level: 'info' });

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const response = await fetch('/api/whoami');
                if (response.ok) {
                    const data = await response.json();
                    if (data.loggedIn) navigate('/dashboard');
                }
            } catch (error) {
                showAlert('Error checking login status. Please try again.', 'error');
            }
        };
        checkLoggedIn();
    }, [navigate]);

    const showAlert = (msg, level) => setAlert({ open: true, message: msg, level });
    const handleCloseSnackbar = () => setAlert({ ...alert, open: false });

    const validateFields = (field, value) => {
        if (field === 'username' && (value.length < 4 || !/^[A-Za-z0-9_.]+$/.test(value))) {
            return 'Username must be at least 4 characters and contain only letters, numbers, _ or .';
        }
        if (field === 'password' && (value.length < 6 || !/^[A-Za-z\d@$!%*?&]+$/.test(value))) {
            return 'Password must be at least 6 characters with allowed special characters @$!%*?&';
        }
        return '';
    };

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: validateFields(field, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usernameError = validateFields('username', formData.username);
        const passwordError = validateFields('password', formData.password);
        if (usernameError || passwordError) return setFormErrors({ username: usernameError, password: passwordError });
        setIsLoggingIn(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                showAlert(data.message, 'success');
                setTimeout(() => navigate('/dashboard'), 1000);
            } else {
                showAlert(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch {
            showAlert('Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
            <BackBtn to={'/'} />
            <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center',border:"1px solid black" ,borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold">Welcome Back</Typography>
                <Typography variant="body2" color="textSecondary">Login to access your dashboard</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField label="Username" fullWidth variant="outlined" value={formData.username} onChange={handleChange('username')} error={!!formErrors.username} helperText={formErrors.username} />
                        <TextField label="Password" fullWidth variant="outlined" type="password" value={formData.password} onChange={handleChange('password')} error={!!formErrors.password} helperText={formErrors.password} />
                        <Button type="submit" variant="contained" disabled={!formData.username || !formData.password || isLoggingIn}>
                            {isLoggingIn ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Login'}
                        </Button>
                        <NavLink to="/register" style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" color="secondary" fullWidth>Register</Button>
                        </NavLink>
                    </Stack>
                </form>
            </Paper>
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={alert.level} sx={{ width: '100%' }}>{alert.message}</Alert>
            </Snackbar>
        </Box>
    );
}
