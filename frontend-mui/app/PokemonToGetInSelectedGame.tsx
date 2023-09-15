import Link from "next/link";
import {FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import React, {useState} from "react";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
}

interface PokemonEncounter {
    pokemonName: string
    catchRate: number
    locationName: string
    method: string
    conditions: string[]
}

export default function PokemonToGetInSelectedGame({user, pokemon, games}: Props) {

    const [selectedGameId, setSelectedGameId] = useState<null|number>(null);

    const getPokemonThatCanBeCaughtInThisGame = () => {
        console.log(`Getting pokemon that can be caught in ${selectedGameId}`)
        return pokemon.flatMap(p => {
            if(user.ownedPokemon.includes(p.pokedexNumber)) return [];
            const encountersInThisGame = p.encounterDetails.encounters.filter(e => e.location.gameId === selectedGameId)
            if(!encountersInThisGame.length) return [];

            const encounter = encountersInThisGame[0];

            return [{pokemonName: p.name, catchRate: encounter.catchRate, locationName: encounter.location.name, method: encounter.method, conditions: encounter.conditions}];
        });
    }

    return (
        <>
            <Typography variant="h2">Pokemon To Catch In Selected Game</Typography>

            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Selected Game</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedGameId}
                    label="Selected Game"
                    onChange={e => setSelectedGameId(e.target.value as number)}
                >
                    {
                        user.ownedGames.map(g => <MenuItem value={g.id}>{g.name}</MenuItem>)
                    }
                </Select>
            </FormControl>

            <Typography variant="h2">All missing pokemon that can be caught in this game</Typography>
            {/*<ul>
                {pokemon.map(p => {
                    if(user.ownedPokemon.includes(p.pokedexNumber)) return <></>;
                    else {
                        if(p.encounterDetails.bestCatchRate === -1) return <li>{`${p.name} (Cannot be caught)`}</li>
                        const bestEncounter = p.encounterDetails.encounters.filter(e => e.catchRate === p.encounterDetails.bestCatchRate)[0];
                        if(!bestEncounter) return <li>{`${p.name} ?`}</li>
                        return <li>{`${p.name} (${bestEncounter.method} - ${bestEncounter.location.name} - ${games.find(g => g.id===bestEncounter.location.gameId).name} - ${bestEncounter.conditions} - ${p.encounterDetails.bestCatchRate}%)`}</li>
                    }
                })}
            </ul>*/}
            <ul>
                {getPokemonThatCanBeCaughtInThisGame().map(p => <li>{`${p.pokemonName} (${p.method} - ${p.locationName} - ${p.conditions} - ${p.catchRate}%)`}</li>)}
            </ul>
        </>
    )
}