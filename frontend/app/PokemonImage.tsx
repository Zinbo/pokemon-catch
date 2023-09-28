import Image from "next/image";
import {StarIcon} from "@chakra-ui/icons";
import {Text} from "@chakra-ui/react";
import localFont from "next/font/local";

interface Props {
    pokedexNumber: number,
    name: string,
    isOwned: boolean,
    canBeAcquired: boolean,
    canBeBred?: boolean,
    hasBestCatchRate?: boolean
}

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
export default function PokemonImage({pokedexNumber, name, isOwned, canBeAcquired, canBeBred, hasBestCatchRate}: Props) {

    const getStyle = () => {
        if (isOwned) return {};
        if (canBeAcquired) return NOT_CAUGHT;
        return {...NOT_CAUGHT, ...CANNOT_CATCH}
    }

    const Egg = () => {
        if(!canBeBred) return <></>;
        return (
            <Image src="/egg.svg" alt={"egg"} width={32} height={32}
                   style={{
                       position: "absolute",
                       top: 0,
                       right: 0
                   }}/>
        );
    }

    const Star = () => {
        if (!hasBestCatchRate) return <></>;
        return <StarIcon style={{
            position: "absolute",
            top: 0,
            left: 0
        }}/>
    }

    return (
        <>
            <div style={{position: "relative"}}>
                <Image src={`/images/list/${pokedexNumber}.png`} width="96" height="96" alt={`i+1`}
                       style={{...getStyle(), display: "block"}}/>
                <Egg/>
                <Star/>
            </div>
            <Text className={pokemonFont.className} fontSize='xs'>{name}</Text>
        </>
    )
}