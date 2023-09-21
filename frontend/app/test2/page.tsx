import React from "react";
import Pokemon from "@/data/Pokemon";
import Grid from "@/app/test2/Grid";

async function getData() : Promise<Pokemon[]> {
    const res = await fetch(`http://localhost:8080/pokemon`)
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json();
}

// const pokemon = [{pokedexNumber: 1, name: "Bulbasaur"}, {pokedexNumber: 2, name: "Ivysaur"}, {pokedexNumber: 3, name: "Bulbasaur"}, {pokedexNumber: 4, name: "Charmander"}] as Pokemon[];

export default async function MyApp() {
    const allPokemon = await getData();

    return (
        <Grid allPokemon={allPokemon}/>
    );
}