import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { MEZZO_API_PATH } from '@caribou-crew/mezzo-constants';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';
import { openInNewTab } from '../utils/urlHelper';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
  name: string;
};

export default function Headers(props: Props) {
  const navigate = useNavigate();

  // TODO fire API call to server to get enabled capabilities?  This way if users don't care about recording they don't see it
  const navItems = [
    {
      label: 'Home',
      path: `/`,
      isLink: true,
    },
    {
      label: 'Record',
      path: `/record`,
      isLink: true,
    },
    // {
    //   label: 'Reset State',
    //   path: `${MEZZO_API_PATH}/routeVariants`,
    //   method: 'DELETE',
    // },
    // {
    //   label: 'Reset Route Settings',
    //   path: 'https://github.com/caribou-crew/mezzo',
    //   method: 'GET',
    // },
  ];

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (navItem?: {
    label: string;
    path: string;
    method?: string;
    isLink?: boolean;
  }) => {
    if (navItem?.isLink) {
      navigate(navItem?.path);
    } else if (navItem?.path && navItem?.method) {
      fetch(navItem.path, { method: navItem.method });
      // TODO refresh UI now that server has reset the state of all variants back to default
    }
    setAnchorElNav(null);
  };

  return (
    <AppBar position="relative">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, mb: 0.5, display: { xs: 'none', md: 'flex' } }}
          >
            <Logo
              title={props.name}
              style={{ width: 70, marginTop: 5 }}
              fill="white"
            />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu()}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* Hamburger menu */}
              {navItems.map((navItem) => (
                <MenuItem
                  key={navItem.label}
                  onClick={() => handleCloseNavMenu(navItem)}
                >
                  <Typography textAlign="center">{navItem.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            <Logo title={props.name} style={{ width: 100 }} fill="white" />
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {/* Nav bar */}
            {navItems.map((navItem) => (
              <Button
                key={navItem.label}
                onClick={() => handleCloseNavMenu(navItem)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {navItem.label}
              </Button>
            ))}
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() =>
              openInNewTab('https://github.com/caribou-crew/mezzo')
            }
            color="inherit"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() =>
              openInNewTab('https://caribou-crew.github.io/mezzo/')
            }
            color="inherit"
          >
            <HelpIcon />
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
