import {createTheme} from '@mui/material/styles';
import {Epilogue} from 'next/font/google'

const epilogue = Epilogue({
    weight: ["300", "400"],
    style: ["normal", "italic"],
    subsets: ["latin"],
});

export const theme = createTheme({
    palette: {
        primary: {
            main: '#AF0000',
        },
        secondary: {
            main: '#FFCD00',
        },
        mode: 'light',
    },
    typography: {
        fontFamily: epilogue.style.fontFamily
    },
});

