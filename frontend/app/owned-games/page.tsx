import Game from "@/data/Game";
import GamesSelect from "@/app/owned-games/GamesSelect";
import {Flex, Heading, Text} from "@chakra-ui/react";
import allGames from "@/data/games.json"

export interface ImportedGame {
    id: number;
    name: string;
    console: string;
    expansion: boolean;
    generation: number;
};

async function getData(path: string) {
    const res = await fetch(`http://localhost:8080/${path}`)
    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json();
}


async function getGames() : Promise<Game[]> {
    return getData('games');
}

export default async function OwnedGamesPage() {
    // const allGames = await getGames();

    return (
        <Flex direction={"column"} style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <Heading>Select Owned Games</Heading>
            <GamesSelect allGames={allGames}/>
        </Flex>

    )
}