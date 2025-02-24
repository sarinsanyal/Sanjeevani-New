import { useState, useEffect, useRef } from 'react';
import { Paper, Box, TextField, Stack, Button, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { BackBtn } from '../components/CustomMui';

export default function Register() {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', level: 'info' });
    const [userType, setUserType] = useState('patient'); // Default to patient
    const [isUniqueUser, setIsUniqueUser] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const usernameCheckTimeout = useRef(null);

    const [formData, setFormData] = useState({
        userType: 'patient', // Default value
        name: '',
        age: '', // Only for patient
        totalBeds: '', // Only for hospital
        emptyBeds: '', // Only for hospital
        username: '',
        password: ''
    });

    const [formErrors, setFormErrors] = useState({
        name: '',
        age: '',
        totalBeds: '',
        emptyBeds: '',
        username: '',
        password: ''
    });


    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const response = await fetch('/api/whoami');
                if (response.ok) {
                    const data = await response.json();
                    if (data.loggedIn) {
                        navigate('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                showAlert('Error checking login status. Please try again.', 'error');
            }
        };
        checkLoggedIn();
    }, [navigate]);


    const showAlert = (msg, level) => {
        setAlert({ open: true, message: msg, level });
    };

    const handleClose = () => {
        setAlert({ ...alert, open: false });
    };


    const validateFields = (field, value) => {
        if (userType === 'patient') {
            if (field === 'name') {
                const nameRegex = /^[A-Za-z]+(\s[A-Za-z]+)*$/;
                if (!nameRegex.test(value)) {
                    return 'Name must contain only English letters, and spaces.';
                }
                if (value.length > 100) {
                    return 'Name must be 100 characters or less';
                }
            } else if (field === 'age') {
                if (!value) {
                    return 'Age is required';
                }
                const age = parseInt(value, 10);
                if (isNaN(age) || age <= 0 || age > 120) {
                    return 'Age must be a valid number between 1 and 120.';
                }
            }
        } else if (userType === 'hospital') {
            if (field === 'name') {
                if (!value) {
                    return 'Hospital name is required.';
                }
                if (value.length > 100) {
                    return 'Hospital name must be 100 characters or less.';
                }
            } else if (field === 'totalBeds') {
                if (!value) {
                    return 'Total beds is required.';
                }
                const beds = parseInt(value, 10);
                if (isNaN(beds) || beds <= 0) {
                    return 'Total beds must be a valid number greater than 0.';
                }
            } else if (field === 'emptyBeds') {
                if (!value) {
                    return 'Empty beds is required.';
                }
                const empty = parseInt(value, 10);
                if (isNaN(empty) || empty < 0) {
                    return 'Empty beds must be a valid number greater than or equal to 0.';
                }
                if (parseInt(formData.totalBeds, 10) < empty) {
                    return 'Empty beds cannot be greater than total beds.';
                }
            }
        }

        if (field === 'username') {
            const usernameRegex = /^[A-Za-z0-9_.]+$/;
            if (value.length < 4) {
                return 'Username must be at least 4 characters';
            }
            if (!usernameRegex.test(value)) {
                return 'Username must contain only letters, numbers, _ or .';
            }
        } else if (field === 'password') {
            const allowedCharsRegex = /^[A-Za-z\d@$!%*?&]+$/;
            if (value.length < 6) {
                return 'Password must be at least 6 characters long';
            }
            if (!allowedCharsRegex.test(value)) {
                return 'Password can only contain letters, numbers, and the special characters @$!%*?&';
            }
        }
        return '';
    };

    const handleChange = (field) => (event) => {
        const value = event.target.value;

        setFormData((prev) => ({ ...prev, [field]: value }));

        const errorMessage = validateFields(field, value);
        setFormErrors((prev) => ({ ...prev, [field]: errorMessage }));

        if (field === 'username') {
            // Live format checking
            if (errorMessage) {
                setIsUniqueUser(false);
                clearTimeout(usernameCheckTimeout.current);
                return;
            }

            // Trigger unique check after 2 seconds of inactivity
            clearTimeout(usernameCheckTimeout.current);
            usernameCheckTimeout.current = setTimeout(async () => {
                setIsCheckingUsername(true);
                try {
                    const response = await fetch(`/api/username?username=${value}`);
                    const data = await response.json();
                    if (response.ok && data.available) {
                        setIsUniqueUser(true);
                        setFormErrors((prev) => ({ ...prev, username: '' }));
                    } else {
                        setIsUniqueUser(false);
                        setFormErrors((prev) => ({ ...prev, username: 'Username is already taken.' }));
                    }
                } catch (error) {
                    setIsUniqueUser(false);
                    setFormErrors((prev) => ({ ...prev, username: 'Error checking username. Please try again.' }));
                } finally {
                    setIsCheckingUsername(false);
                }
            }, 2000);
        }

        if (field === 'totalBeds') {
            if (formData.emptyBeds && parseInt(value, 10) < parseInt(formData.emptyBeds, 10)) {
                setFormErrors((prev) => ({ ...prev, emptyBeds: 'Empty beds cannot be greater than total beds.' }));
            } else {
                setFormErrors((prev) => ({ ...prev, emptyBeds: '' }));
            }
        } else if (field === 'emptyBeds') {
            if (formData.totalBeds && parseInt(formData.totalBeds, 10) < parseInt(value, 10)) {
                setFormErrors((prev) => ({ ...prev, emptyBeds: 'Empty beds cannot be greater than total beds.' }));
            } else {
                setFormErrors((prev) => ({ ...prev, emptyBeds: '' }));
            }
        }
    };

    const handleUserTypeChange = (event) => {
        setUserType(event.target.value);
        setFormData(prev => ({
            ...prev,
            userType: event.target.value,
            name: '',
            age: '',
            totalBeds: '',
            emptyBeds: '',
            username: '',
            password: ''
        }));
        setFormErrors({
            name: '',
            age: '',
            totalBeds: '',
            emptyBeds: '',
            username: '',
            password: ''
        });
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate all fields before submission
        let errors = {};
        for (const key in formData) {
            if (key !== 'userType') {
                errors[key] = validateFields(key, formData[key]);
            }
        }

        setFormErrors(errors);

        if (Object.values(errors).some(error => error)) {
            return;
        }


        // Prepare the data to send to the server
        const payload = {
            ...formData,
        };

        // Submit the form
        setIsRegistering(true);
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                showAlert(result.message, 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Something went wrong. Please try again.', 'error');
            })
            .finally(() => {
                setIsRegistering(false);
            });
    };


    return (
        <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <BackBtn to={"/"} />
            <Paper sx={{ p: 3, maxWidth: '400px', width: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>

                        <FormControl fullWidth>
                            <InputLabel id="user-type-label">Registering as</InputLabel>
                            <Select
                                labelId="user-type-label"
                                id="user-type"
                                value={userType}
                                label="Registering as"
                                onChange={handleUserTypeChange}
                            >
                                <MenuItem value={'patient'}>Patient</MenuItem>
                                <MenuItem value={'hospital'}>Hospital</MenuItem>
                            </Select>
                        </FormControl>


                        <TextField
                            label={userType === 'patient' ? "Patient Name" : "Hospital Name"}
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            required
                        />

                        {userType === 'patient' && (
                            <TextField
                                label="Age"
                                fullWidth
                                variant="outlined"
                                type="number"
                                value={formData.age}
                                onChange={handleChange('age')}
                                error={!!formErrors.age}
                                helperText={formErrors.age}
                                required
                            />
                        )}

                        {userType === 'hospital' && (
                            <>
                                <TextField
                                    label="Total Number of Beds"
                                    fullWidth
                                    variant="outlined"
                                    type="number"
                                    value={formData.totalBeds}
                                    onChange={handleChange('totalBeds')}
                                    error={!!formErrors.totalBeds}
                                    helperText={formErrors.totalBeds}
                                    required
                                />
                                <TextField
                                    label="Currently Empty Beds"
                                    fullWidth
                                    variant="outlined"
                                    type="number"
                                    value={formData.emptyBeds}
                                    onChange={handleChange('emptyBeds')}
                                    error={!!formErrors.emptyBeds}
                                    helperText={formErrors.emptyBeds}
                                    required
                                />
                            </>
                        )}

                        <TextField
                            label="Username"
                            fullWidth
                            variant="outlined"
                            value={formData.username}
                            onChange={handleChange('username')}
                            error={!!formErrors.username}
                            helperText={
                                isCheckingUsername
                                    ? 'Checking username...'
                                    : formErrors.username
                            }
                            InputProps={{
                                endAdornment: isCheckingUsername ? <CircularProgress size={20} /> : null,
                            }}
                            disabled={isCheckingUsername}
                            required
                        />

                        <TextField
                            label="Password"
                            fullWidth
                            variant="outlined"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            required
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                isRegistering ||
                                Object.values(formErrors).some(error => error) ||
                                !formData.name ||
                                !formData.username ||
                                !formData.password ||
                                (userType === 'patient' && !formData.age) ||
                                (userType === 'hospital' && (!formData.totalBeds || !formData.emptyBeds)) ||
                                isCheckingUsername ||
                                !isUniqueUser
                            }
                        >
                            {!isRegistering ? "Register" : <CircularProgress size={20} />}
                        </Button>

                        <NavLink to="/login">
                            <Button variant="contained" color="secondary" fullWidth>
                                Login
                            </Button>
                        </NavLink>
                    </Stack>
                </form>
            </Paper>
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity={alert.level} variant="filled">
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
