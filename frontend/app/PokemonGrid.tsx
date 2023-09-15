import {Grid} from "@chakra-ui/react";
import PokemonGridItem from "@/app/PokemonGridItem";

export default function PokemonGrid() {
    return (
        <Grid templateColumns='repeat(6, 1fr)' gap={6}>
            {Array.from(Array(20).keys()).map((i) => (
                <PokemonGridItem i={i}/>
            ))}
        </Grid>
    )
}