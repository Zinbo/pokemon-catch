'use client'
import {Flex, Grid, GridItem, Text} from "@chakra-ui/react";
import Legend from "@/app/Legend";
import AddGame from "@/app/AddGame";
import Search from "@/app/Search";
import Image from "next/image";
import {StarIcon} from "@chakra-ui/icons";
import PokemonGrid from "@/app/PokemonGrid";
import {useEffect, useState} from "react";
import User from "@/data/User";

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

    return (
        <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
            <Search/>
            <PokemonGrid pokemon={pokemon} games={games} user={user} evolutionChains={evolutionChains}/>
        </Flex>
    )
}
