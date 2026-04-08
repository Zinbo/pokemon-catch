import GamesSelect from "@/app/owned-games/GamesSelect";
import {Flex, Heading} from "@chakra-ui/react";
import allGames from "@/data/games.json"

export default async function OwnedGamesPage() {
    return (
        <Flex direction={"column"} style={{paddingTop: "20px", paddingBottom: "20px"}}>
            <Heading>Select Owned Games</Heading>
            <GamesSelect generations={allGames}/>
        </Flex>

    )
}