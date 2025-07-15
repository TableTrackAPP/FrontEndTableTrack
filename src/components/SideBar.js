import React, { useState } from 'react';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import { useNavigate } from 'react-router-dom';
import './../styles/Sidebar.css';

const SideBar = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        setOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <>
            <IconButton
                className="menu-icon"
                onClick={() => setOpen(!open)}
                size="large"
                edge="end"
            >
                <MenuIcon />
            </IconButton>

            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <div className="sidebar-content">
                    <List>

                        <ListItem button onClick={() => handleNavigation('/Dashboard')}>
                            <ListItemIcon><HomeIcon /></ListItemIcon>
                            <ListItemText primary="Menu inicial" />
                        </ListItem>

                        <Divider />

                        <ListItem button onClick={() => handleNavigation('/subscribe')}>
                            <ListItemIcon><SubscriptionsIcon /></ListItemIcon>
                            <ListItemText primary="Assinatura" />
                        </ListItem>

                        <Divider />

                        <ListItem button onClick={() => handleNavigation('/establishments')}>
                            <ListItemIcon><StorefrontTwoToneIcon /></ListItemIcon>
                            <ListItemText primary="Editar Catálogo" />
                        </ListItem>

                        <Divider />

                        <ListItem button onClick={() => handleNavigation('/products')}>
                            <ListItemIcon><CategoryIcon /></ListItemIcon>
                            <ListItemText primary="Gerenciar Produtos" />
                        </ListItem>

                        <Divider />

                        <ListItem button onClick={() => handleNavigation('/orders')}>
                            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                            <ListItemText primary="Visualizar Pedidos" />
                        </ListItem>

                        <Divider />

                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                            <ListItemText primary="Sair" />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </>
    );
};

export default SideBar;
