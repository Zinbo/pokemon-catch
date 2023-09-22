import {Flex, GridItem, IconButton, Text} from "@chakra-ui/react";
import Image from "next/image";
import {CheckIcon, CloseIcon, ViewIcon} from "@chakra-ui/icons";
import {useRouter} from "next/navigation";
import localFont from "next/font/local";
import {memo, useMemo} from "react";

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

const PokemonGridItem = memo(function PokemonGridItem({pokedexNumber, name, isOwned, canBeAcquired, canBeBred, visible, toggleCatchStatus}: {pokedexNumber: number, name: string, isOwned: boolean, canBeAcquired: boolean, canBeBred: boolean, visible: boolean, toggleCatchStatus: (pokedexNumber: number, isOwned: boolean) => void}) {
    const router = useRouter();

    const getStyle = () => {
        if(isOwned) return {};
        if(canBeAcquired) return NOT_CAUGHT;
        return {...NOT_CAUGHT, ...CANNOT_CATCH}
    }

    const Egg = () => {
        if(canBeBred) return (
            <Image src="/egg.svg" alt={"egg"} width={32} height={32}
                   style={{
                       position: "absolute",
                       top: 0,
                       right: 0
                   }}/>
        );
        return <></>;
    }

    const Card = useMemo(() => {
        return (
            <>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"} className='pokemon-grid-item--off'>
                    <div style={{position: "relative"}}>
                        <Image src={`/images/list/${pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                               style={{...getStyle(), display: "block"}}/>
                        <Egg/>
                    </div>
                    <Text className={pokemonFont.className} fontSize='xs'>{name}</Text>
                </Flex>
                <Flex id="back" justifyContent={"space-evenly"} alignItems={"center"} style={{height: "100%"}} className='pokemon-grid-item--on'>

                    <IconButton isRound={true} variant='outline' size='lg' aria-label='Search database'
                                icon={<ViewIcon/>} onClick={() => router.push(`/pokemon-details/${pokedexNumber}`)}/>
                    <IconButton isRound={true} variant='outline' size='lg' aria-label='Search database'
                                icon={isOwned ? <CloseIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/> : <CheckIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/>}/>

                </Flex>
            </>
        )
    }, [isOwned, canBeAcquired, canBeBred])

    return (
        <GridItem id="card" border='1px' borderColor='gray.200' backgroundColor={"white"} className='pokemon-grid-item' style={{display: visible ? "block" : "none"}}>
            {Card}
        </GridItem>

    )
});



export default PokemonGridItem;