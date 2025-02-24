import React from 'react';
import { Box, Avatar, IconButton } from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


const DynamicAvatar = ({ src, name, handleAvatarChange, mb = 0 }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', mb: mb }}>
            <Avatar
                alt={name}
                src={src}
                sx={{ width: 100, height: 100, borderStyle: 'solid', borderWidth: '1px', borderColor: 'grey.900' }}
            />
            <IconButton
                component="label"
                sx={{
                    height: 100,
                    width: 100,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'grey.500',
                    opacity: 0,
                    color: 'white',
                    borderRadius: '50%',
                    '&:hover': {
                        opacity: 0.6,
                        bgcolor: 'grey.900'
                    }
                }}
            >
                <Edit />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                />
            </IconButton>
        </Box>
    );
};

const BackBtn = ({ to }) => {
    const navigate = useNavigate();
    return (
        <IconButton
            onClick={() => navigate(to)}
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                borderRadius: '12px',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: 'grey.900',
                color: 'grey.900',
            }}
        >
            <ArrowBack />
        </IconButton>
    );
};


export { DynamicAvatar, BackBtn };
