import Link from "next/link";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import React, {useState} from "react";

export default function PokemonToGetInSelectedGame() {

    const [selectedGame, setSelectedGame] = useState<null|string>(null);

    return (
        <>
            <Typography variant="h2">Pokemon To Get In Selected Game</Typography>

            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedGame}
                    label="Selected Game"
                    onChange={e => setSelectedGame(e.target.value as string)}
                >
                    <MenuItem value={'red'}>Red</MenuItem>
                    <MenuItem value={'yellow'}>Yellow</MenuItem>
                    <MenuItem value={'crystal'}>Crystal</MenuItem>
                </Select>
            </FormControl>

            <ul>
                <li>Bulbasaur (Breed from Ivysaur)</li>
                <li>Venusaur (Breed from Ivysaur and level to 16)</li>
                <li>Ekans (Let’s Go Pikachu! - Route 51 - Walking)</li>
            </ul>
        </>
    )
}