'use client';
import React, {useEffect, useState} from "react";
import AllPokemonToCollect from "@/app/AllPokemonToCollect";
import PokemonToBreed from "@/app/PokemonToBreed";
import PokemonToGetInSelectedGame from "@/app/PokemonToGetInSelectedGame";
import ErrorDialog from "@/components/ErrorDialog";
import User from "@/data/User";

export default function Home() {

    const [user, setUser] = useState<null | User>(null);
    const [error, setError] = useState(false);

    const getUserDetails = async () => {
        const res = await fetch(`/users/123`);
        if (res.ok) {
            setUser(await res.json());
        } else {
            setError(true);
        }
    }

    useEffect(() => {
        getUserDetails()
    }, [])

    return (
        <>
            {error && <ErrorDialog errorTitle="Could not load Pokemon data" open={true} onClose={() => {
                setError(false);
            }}/>}
            <AllPokemonToCollect/>
            <PokemonToBreed/>
            <PokemonToGetInSelectedGame/>
        </>
    )
}
