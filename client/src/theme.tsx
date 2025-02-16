import { createTheme } from '@mui/material/styles';
import { jaJP } from '@mui/material/locale';

declare module '@mui/material/styles' {
  interface Palette {
    demands: Palette['primary'];
    supplies: Palette['primary'];
  }

  interface PaletteOptions {
    demands?: PaletteOptions['primary'];
    supplies?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    demands: true;
    supplies: true;
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#daa520',
    },
    demands: {
      main: 'hotpink',
      light: 'pink',
    },
    supplies: {
      main: 'deepskyblue',
      light: 'lightblue',
    },
  },
  typography: {
    fontFamily: [
      '"BIZ UDPGothic"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
}, jaJP);

export default theme;
