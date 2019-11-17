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
    MuiFormControlLabel: {
      label: {
        fontSize: '1em',
      },
    },
    MuiFab: {
      primary: { color: 'white' },
    },
    MuiSelect: {
      root: {
        fontSize: '2em',
      },
    },
    MuiSvgIcon: {
      root: {
        fontSize: '2em',
      },
    },
  },

});
