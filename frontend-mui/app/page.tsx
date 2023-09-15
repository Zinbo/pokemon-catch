'use client';
import React, {useEffect, useState} from "react";
import AllPokemonToCollect from "@/app/AllPokemonToCollect";
import PokemonToBreed from "@/app/PokemonToBreed";
import PokemonToGetInSelectedGame from "@/app/PokemonToGetInSelectedGame";
import ErrorDialog from "@/components/ErrorDialog";
import User from "@/data/User";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {

    const [user, setUser] = useState<null | User>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pokemon, setPokemon] = useState([]);
    const [games, setGames] = useState([]);
    const [evolutionChains, setEvolutionChains] = useState([]);

    const getUserDetails = async () => {
        const res = await fetch(`/users/123`);
        if (res.ok) {
            setUser(await res.json());
        } else {
            setError(true);
        }

    }

    const getPokemon = async() => {
        const res = await fetch('/pokemon');
        if (res.ok) {
            setPokemon(await res.json());
        } else {
            setError(true);
        }
    }

    const getEvolutionChains = async() => {
        const res = await fetch('/evolution-chains');
        if (res.ok) {
            setEvolutionChains(await res.json());
        } else {
            setError(true);
        }
    }

    const getGames = async() => {
        const res = await fetch('/games');
        if (res.ok) {
            setGames(await res.json());
        } else {
            setError(true);
        }

    }

    useEffect(() => {
        async function fetchData() {
            await Promise.all([getUserDetails(), getPokemon(), getGames(), getEvolutionChains()]);
            setLoading(false);
        }
        fetchData();
    }, [])

    const Page = () => {
        if (user === null) {
            return <LoadingScreen isLoading={loading}/>;
        } else if (error) {
            return (
                <ErrorDialog errorTitle="Could not load Pokemon data" open={true} onClose={() => {
                    setError(false);
                }}/>
            )
        } else {
            return (
                <>
                    <AllPokemonToCollect user={user} pokemon={pokemon} games={games}/>
                    <PokemonToBreed pokemon={pokemon} evolutionChains={evolutionChains} user={user} games={games}/>
                    <PokemonToGetInSelectedGame user={user} pokemon={pokemon} games={games}/>
                </>
            )
        }
    }

    return <Page/>
}
