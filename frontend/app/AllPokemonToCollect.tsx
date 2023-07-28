import Link from "next/link";
import {Typography} from "@mui/material";
import React from "react";

export default function AllPokemonToCollect() {
    return (
        <>
            <Typography variant="h2">All Pokemon To Collect</Typography>
            <ul>
                <li>Bulbasaur (Breed from Ivysaur)</li>
                <li>Venusaur (Breed from Ivysaur and level to 16)</li>
                <li>Ekans (Let’s Go Pikachu! - Route 51 - Walking)</li>
            </ul>
        </>
    )
}