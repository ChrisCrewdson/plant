import { createMuiTheme } from '@material-ui/core/styles';
import cyan from '@material-ui/core/colors/cyan';
import deepOrange from '@material-ui/core/colors/deepOrange';

// https://material-ui.com/customization/globals
export const theme = createMuiTheme({
  palette: {
    primary: cyan,
    secondary: deepOrange,
  },
  overrides: {
    MuiFab: {
      primary: { color: 'white' },
    },
    MuiButton: {
      textPrimary: {
        // color: 'white',
        fontSize: 'medium',
        backgroundColor: 'red',
      },
      text: {
        color: 'white',
        backgroundColor: 'red',
      },
      // primary: { color: 'white' },
    },
    MuiSvgIcon: {
      root: {
        fontSize: '3em',
      },
    },
  },

});
