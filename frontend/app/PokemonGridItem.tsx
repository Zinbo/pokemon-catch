import {Flex, GridItem, IconButton} from "@chakra-ui/react";
import {CheckIcon, DeleteIcon, ViewIcon} from "@chakra-ui/icons";
import {useRouter} from "next/navigation";
import {memo, useMemo} from "react";
import PokemonImage from "@/app/PokemonImage";

interface Props {
    pokedexNumber: number,
    name: string,
    isOwned: boolean,
    canBeAcquired: boolean,
    canBeBred: boolean,
    visible: boolean,
    toggleCatchStatus: (pokedexNumber: number, isOwned: boolean) => void,
    hasBestCatchRate: boolean
}

const PokemonGridItem = memo(function PokemonGridItem(
    {pokedexNumber, name, isOwned, canBeAcquired, canBeBred, visible, toggleCatchStatus, hasBestCatchRate}: Props) {
    const router = useRouter();

    const GreyOutCard = useMemo(() => {
        return (
            <>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}
                      position={"relative"} className='pokemon-grid-item-transparent'>
                    <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}
                          position={"relative"} className='pokemon-grid-item-transparent--off'>
                        <PokemonImage pokedexNumber={pokedexNumber} name={name} isOwned={isOwned} canBeAcquired={canBeAcquired} canBeBred={canBeBred} hasBestCatchRate={hasBestCatchRate}/>
                    </Flex>
                    <Flex position={"absolute"} className='pokemon-grid-item-transparent--on' style={{width: '100%'}}
                          justifyContent={"space-evenly"}>
                        <IconButton isRound={true} variant='outline' size='lg' aria-label='Search database'
                                    backgroundColor={"white"}
                                    icon={<ViewIcon/>} onClick={() => router.push(`/pokemon-details/${pokedexNumber}`)}
                                    colorScheme={"black"}/>
                        <IconButton isRound={true} size='lg' variant='outline' backgroundColor={"white"}
                                    aria-label='Search database' colorScheme={"black"}
                                    icon={isOwned ?
                                        <DeleteIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/> :
                                        <CheckIcon onClick={() => toggleCatchStatus(pokedexNumber, isOwned)}/>}/>
                    </Flex>
                </Flex>
            </>
        )
    }, [isOwned, canBeAcquired, canBeBred, hasBestCatchRate])

    return (
        <GridItem id="card" border='1px' borderColor='gray.200' backgroundColor={"white"}
                  style={{display: visible ? "block" : "none"}} className={'pokemon-grid-item'}>
            {GreyOutCard}
        </GridItem>

    )
});


export default PokemonGridItem;