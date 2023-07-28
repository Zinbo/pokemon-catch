'use client';
import React, {useEffect, useState} from "react";
import {Button, Checkbox, FormControlLabel, FormGroup, Typography} from "@mui/material";
import User from "@/data/User";
import Game from "@/data/Game";
import ErrorDialog from "@/components/ErrorDialog";
import {useRouter} from "next/navigation";

export default function AddGames() {
    const router = useRouter();
    const [user, setUser] = useState<null | User>(null);
    const [games, setGames] = useState<null | Game[]>(null);
    const [error, setError] = useState(false);
    const [usersGames, setUsersGames] = useState<null | Game[]>(null);

    useEffect(() => {
        getUserDetails();
        getGames();
    }, [])

    const getUserDetails = async () => {
        const res = await fetch(`/users/123`);
        if (res.ok) {
            const user = await res.json();
            setUser(user);
            setUsersGames(user.ownedGames);
        } else {
            setError(true);
        }
    }

    const getGames = async () => {
        const res = await fetch(`/games`);
        if (res.ok) {
            setGames(await res.json());
        } else {
            setError(true);
        }
    }

    const toggleGame = (game: Game, event: React.ChangeEvent<HTMLInputElement>) => {
        if(!user) return;
        let games = usersGames ? [...usersGames] : []

        if(event.target.checked) {
            games.push(game);

        } else {
            games = games.filter(g => g.id !== game.id)
        }
        setUsersGames(games);
    }

    const submit = async () => {
        if(!usersGames) return;
        const res = await fetch("/users/123/games", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usersGames.map(g => g.name))
        });
        router.push("/");
    }

    return (
        <>
            {error && <ErrorDialog errorTitle="Could not load Pokemon data" open={true} onClose={() => {
                setError(false);
                router.push('/');
            }}/>}
            <Typography variant="h2">Select Games</Typography>
            <FormGroup>
                {games?.map(game => <FormControlLabel control={
                    <Checkbox
                        checked={!!usersGames?.find(g => g.id === game.id)}
                    onChange={(e) => toggleGame(game, e)}/>}
                                                      label={game.name} />)}
            </FormGroup>
            <Button variant="contained" onClick={submit}>Save</Button>
        </>
    )
}
