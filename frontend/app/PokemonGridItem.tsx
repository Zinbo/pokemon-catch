import {Flex, GridItem, IconButton, Text} from "@chakra-ui/react";
import Image from "next/image";
import {CheckIcon, DeleteIcon, StarIcon, ViewIcon} from "@chakra-ui/icons";
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

const PokemonGridItem = memo(function PokemonGridItem(
    {pokedexNumber, name, isOwned, canBeAcquired, canBeBred, visible, toggleCatchStatus, hasBestCatchRate}:
        {pokedexNumber: number, name: string, isOwned: boolean, canBeAcquired: boolean, canBeBred: boolean, visible: boolean, toggleCatchStatus: (pokedexNumber: number, isOwned: boolean) => void, hasBestCatchRate: boolean}) {
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

    const Star = () => {
        if(!hasBestCatchRate) return <></>;
        return <StarIcon style={{
            position: "absolute",
            top: 0,
            left: 0
        }}/>
    }

    const GreyOutCard = useMemo(() => {
        return (
            <>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}  position={"relative"} className='pokemon-grid-item-transparent'>
                    <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}  position={"relative"} className='pokemon-grid-item-transparent--off'>
                        <div style={{position: "relative"}}>
                            <Image src={`/images/list/${pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                                   style={{...getStyle(), display: "block"}}/>
                            <Egg/>
                            <Star/>

                        </div>
                        <Text className={pokemonFont.className} fontSize='xs'>{name}</Text>
                    </Flex>
                    <Flex position={"absolute"} className='pokemon-grid-item-transparent--on' style={{width: '100%'}} justifyContent={"space-evenly"}>
                        <IconButton isRound={true} variant='outline'  size='lg' aria-label='Search database' backgroundColor={"white"}
                                    icon={<ViewIcon/>}  onClick={() => router.push(`/pokemon-details/${pokedexNumber}`)} colorScheme={"black"}/>
                        <IconButton isRound={true} size='lg' variant='outline' backgroundColor={"white"} aria-label='Search database' colorScheme={"black"}
                                    icon={isOwned ? <DeleteIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/> : <CheckIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/>}/>
                    </Flex>
                </Flex>
            </>
        )
    }, [isOwned, canBeAcquired, canBeBred, hasBestCatchRate])

    return (
        <GridItem id="card" border='1px' borderColor='gray.200' backgroundColor={"white"}  style={{display: visible ? "block" : "none"}} className={'pokemon-grid-item'}>
            {GreyOutCard}
        </GridItem>

    )
});



export default PokemonGridItem;