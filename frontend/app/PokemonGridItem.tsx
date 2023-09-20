import {Flex, GridItem, IconButton, Text, useDisclosure} from "@chakra-ui/react";
import Image from "next/image";
import {CheckIcon, ViewIcon} from "@chakra-ui/icons";
import {useState} from "react";
import ReactCardFlip from "react-card-flip";
import Index from "@/components/DetailModal";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import EvolutionChain from "@/data/EvolutionChain";
import {useRouter} from "next/navigation";
import localFont from "next/font/local";
import {canBeAcquired, notOwnedAndCanBeBred, userOwnsPokemon} from "@/lib/PokemonService";

const NOT_CAUGHT = {WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)"};
const CANNOT_CATCH = {opacity: "0.5"};

const pokemonFont = localFont({
    src: [
        {
            path: '../public/fonts/pokemongb.ttf',
            weight: '400'
        }
    ],
    variable: '--font-pokemon'
})


export default function PokemonGridItem({pokemon, user, evolutionChain}: { pokemon: Pokemon, user: User, evolutionChain: EvolutionChain }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();

    const getStyle = (pokemon: Pokemon) => {
        if(userOwnsPokemon(pokemon.pokedexNumber, user)) return {};
        if(canBeAcquired(pokemon, evolutionChain, user)) return NOT_CAUGHT;
        return {...NOT_CAUGHT, ...CANNOT_CATCH}
    }

    const Egg = () => {
        if(notOwnedAndCanBeBred(pokemon, evolutionChain, user)) return (
            <Image src="/egg.svg" alt={"egg"} width={32} height={32}
                   style={{
                       position: "absolute",
                       top: 0,
                       right: 0
                   }}/>
        );
        return <></>;

    }

    return (
        <GridItem id="card" onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)} border='1px' borderColor='gray.200' backgroundColor={"white"} >
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal"
                           containerStyle={{height: "100%", display: "flex", alignItems: "stretch"}}>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}>
                    <div style={{position: "relative"}}>
                        <Image src={`/images/list/${pokemon.pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                               style={{...getStyle(pokemon), display: "block"}}/>
                        <Egg/>
                    </div>
                    <Text className={pokemonFont.className} fontSize='xs'>{pokemon.name}</Text>
                </Flex>
                <Flex id="back" justifyContent={"center"} alignItems={"center"} style={{height: "100%"}}>
                    <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                                icon={<ViewIcon/>} onClick={() => router.push(`/pokemon-details/${pokemon.pokedexNumber}`)}/>
                    <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                                icon={<CheckIcon/>}/>
                    <Index isOpen={isOpen} onClose={onClose} pokemon={pokemon} evolutionChain={evolutionChain} user={user}/>

                </Flex>
            </ReactCardFlip>

        </GridItem>

    )
}