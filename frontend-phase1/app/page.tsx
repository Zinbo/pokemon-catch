'use client'
import React from "react";
import AllPokemon from "@/app/AllPokemon";
import PokemonInSpecificGame from "@/app/PokemonInSpecificGame";

export default function Home() {
    return (
        <>
            <AllPokemon/>
            <PokemonInSpecificGame/>
        </>
    )
}
