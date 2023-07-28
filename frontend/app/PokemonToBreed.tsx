import {Typography} from "@mui/material";
import React from "react";

export default function PokemonToBreed() {
    return (
        <>
            <Typography variant="h2">Pokemon To Breed</Typography>
            <ul>
                <li>Bulbasaur (Breed from Ivysaur)</li>
                <li>Venusaur (Breed from Ivysaur and level to 16)</li>
            </ul>
        </>
    )
}