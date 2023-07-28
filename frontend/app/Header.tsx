import {AppBar, Button, Toolbar, Typography} from "@mui/material";
import React from "react";
import Link from "next/link";
import pokemonFont from "@/utils/pokemonFont";

export default function Header() {
    return (
        <AppBar position="static" sx={{borderBottom: '2px solid #FFDE59'}}>
        <Toolbar>
            <Typography variant="h6" component="div"
                        sx={{
                            flexGrow: 1,
                            fontSize: '40px'
                        }}
            className={pokemonFont.className}>
                <Link href={"/"} style={{ textDecoration: 'none', color: 'inherit' }}>Pokemon Catch</Link>
            </Typography>
            <Button color="inherit" sx={{fontWeight: 'bold'}} href={"/add-games"}>Add Games</Button>
        </Toolbar>
    </AppBar>)
}

