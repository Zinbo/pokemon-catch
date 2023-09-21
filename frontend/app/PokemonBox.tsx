import {Flex, GridItem, Text} from "@chakra-ui/react";
import Image from "next/image";
import localFont from "next/font/local";
import Pokemon from "@/data/Pokemon";
import {canBeAcquired, userOwnsPokemon} from "@/lib/PokemonService";
import {memo} from "react";

const pokemonFont = localFont({
    src: [
        {
            path: '../public/fonts/pokemongb.ttf',
            weight: '400'
        }
    ],
    variable: '--font-pokemon'
})

const NOT_CAUGHT = {WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)"};
const CANNOT_CATCH = {opacity: "0.5"};

const getStyle = (isOwned: boolean, canBeAcquired: boolean) => {
    if(isOwned) return {};
    if(canBeAcquired) return NOT_CAUGHT;
    return {...NOT_CAUGHT, ...CANNOT_CATCH}
}

const PokemonBox = memo(function PokemonBox({pokedexNumber, name, isOwned, canBeAcquired} : {pokedexNumber: number, name : string, isOwned: boolean, canBeAcquired: boolean}) {
    console.log(`Rendering PokemonBox!`);
    console.log(`Props: ${pokedexNumber}, ${name}, ${isOwned}, ${canBeAcquired}`);
    return (
        <GridItem id="card" border='1px' borderColor='gray.200' backgroundColor={"white"} className='pokemon-grid'>
            <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"} className='pokemon-grid--off'>
                <div style={{position: "relative"}}>
                    <Image src={`/images/list/${pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                           style={{...getStyle(isOwned, canBeAcquired), display: "block"}}/>
                    {/*<Egg/>*/}
                </div>
                <Text className={pokemonFont.className} fontSize='xs'>{name}</Text>
            </Flex>
            {/*            <Flex id="back" justifyContent={"center"} alignItems={"center"} style={{height: "100%"}} className='pokemon-grid-item--on'>

                <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                            icon={<ViewIcon/>} onClick={() => router.push(`/pokemon-details/${pokemon.pokedexNumber}`)}/>
                <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                            icon={<CheckIcon/>}/>

            </Flex>*/}
        </GridItem>
    )
});

export default PokemonBox;