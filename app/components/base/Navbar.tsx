import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { PlantStateTree } from '../../../lib/types/react-common';
import { actionFunc } from '../../actions';
import AddPlantButton from '../common/AddPlantButton';
import { isUserLoggedIn } from '../../libs/auth-helper';
import { UserPlantsMenu } from './navbar/user-location-link';
import utils from '../../libs/utils';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}),
);

const appBarLinkItem = {
  marginRight: '10px',
};

// const tempStyle = {
//   marginTop: '50px',
// };

export default function MenuAppBar(): JSX.Element {
  const dispatch = useDispatch();
  const user = useSelector((state: PlantStateTree) => state.user) || {};
  const interimMap = useSelector((state: PlantStateTree) => state.interim);

  const logout = (): void => {
    dispatch(actionFunc.logoutRequest());
  };

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const { name: userName, _id: userId } = user;
  const displayName = userName || 'placeholder-user-name';

  const loggedIn = isUserLoggedIn(user);
  const notEditing = !Object.keys(interimMap).length;
  const locationsUrl = `/locations/${utils.makeSlug(displayName)}/${userId}`;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4" className={classes.title}>
            <Link to="/" style={appBarLinkItem}>
              Plant
            </Link>
            <AddPlantButton
              mini
              show={!!(loggedIn && notEditing)}
              style={{ marginTop: '5px' }}
            />
          </Typography>
          <Typography variant="h4">
            <UserPlantsMenu
              loggedIn={loggedIn}
              user={user}
            />
            {loggedIn
              && (
              <span>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <Link to={locationsUrl}>
                      Your Locations
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <Link to="/profile">
                      Profile
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={logout}>
                    <Link to="/">
                      Logout
                    </Link>
                  </MenuItem>
                </Menu>
              </span>
              )}
            {!loggedIn
              && (
              <Link to="/login" style={appBarLinkItem}>
                    Login
              </Link>
              )}
            <Link to="/help" title="help">
                Help
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
