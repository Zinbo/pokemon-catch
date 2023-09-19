import {Flex, GridItem, IconButton, Text, Tooltip, useDisclosure} from "@chakra-ui/react";
import Image from "next/image";
import {CheckIcon, StarIcon, ViewIcon} from "@chakra-ui/icons";
import {useState} from "react";
import ReactCardFlip from "react-card-flip";
import Index from "@/components/DetailModal";
import Pokemon from "@/data/Pokemon";
import User from "@/data/User";
import EvolutionChain from "@/data/EvolutionChain";
import {useRouter} from "next/navigation";

const NOT_CAUGHT = {WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)"};
const CANNOT_CATCH = {opacity: "0.5"};

import localFont from "next/font/local";

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

    function openModal() {
        setIsFlipped(false);
        onOpen()
    }

    const getStyle = (pokemon: Pokemon) => {
        if(user.ownedPokemon.includes(pokemon.pokedexNumber)) return {};
        else return NOT_CAUGHT;
        /*if (modResult === 0) return {};
        if (modResult === 1) return NOT_CAUGHT;
        if (modResult === 2) return CANNOT_CATCH;
        return {...NOT_CAUGHT, ...CANNOT_CATCH};*/
    }

    return (
        <GridItem id="card" onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)} border='1px' borderColor='gray.200'>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal"
                           containerStyle={{height: "100%", display: "flex", alignItems: "stretch"}}>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}>
                    <div style={{position: "relative"}}>
                        <Image src={`/images/list/${pokemon.pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                               style={{...getStyle(pokemon), display: "block"}}/>
                        {/*{i % 4 === 0 ?
                            <Tooltip label='Can be bred'><Image src="/egg.svg" alt={"egg"} width={32} height={32}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    right: 0
                                                                }}/></Tooltip> : <></>}
                        {i % 6 === 0 ?
                            <Tooltip label='Best catch rate in this game'><StarIcon boxSize={8} color={"#FFCD00"}
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: 0,
                                                                                        left: 0
                                                                                    }}/></Tooltip> : <></>}*/}
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