import {Typography} from "@mui/material";
import React from "react";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";
import Game from "@/data/Game";

interface Props {
    user: User
    pokemon: Pokemon[]
    games: Game[]
}


export default function AllPokemonToCollect({user, pokemon, games}: Props) {

    return (
        <>
            <Typography variant="h2">All Pokemon To Collect</Typography>
            <ul>
                {pokemon.map(p => {
                    if(user.ownedPokemon.includes(p.pokedexNumber)) return <></>;
                    else {
                        if(p.encounterDetails.bestCatchRate === -1) return <li>{`${p.name} (Cannot be caught)`}</li>
                        const bestEncounter = p.encounterDetails.encounters.filter(e => e.catchRate === p.encounterDetails.bestCatchRate)[0];
                        if(!bestEncounter) return <li>{`${p.name} ?`}</li>
                        return <li>{`${p.name} (${bestEncounter.method} - ${bestEncounter.location.name} - ${games.find(g => g.id===bestEncounter.location.gameId).name} - ${bestEncounter.conditions} - ${p.encounterDetails.bestCatchRate}%)`}</li>
                    }
                })}
            </ul>
        </>
    )
}