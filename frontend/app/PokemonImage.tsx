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
    catchAndBreed?: boolean,
    hasBestCatchRate?: boolean
    alolan ?: boolean
    galarian ?: boolean
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
export default function PokemonImage({pokedexNumber, name, isOwned, canBeAcquired, canBeBred, catchAndBreed, hasBestCatchRate, alolan, galarian}: Props) {

    const getStyle = () => {
        if (isOwned) return {};
        if (canBeAcquired || catchAndBreed) return NOT_CAUGHT;
        return {...NOT_CAUGHT, ...CANNOT_CATCH}
    }

    const Egg = () => {
        if(!canBeBred) return <></>;
        return (
            <Image src="/images/list/egg-cropped.png" alt={"egg"} width={32} height={32}
                   style={{
                       position: "absolute",
                       top: 0,
                       right: 0
                   }}/>
        );
    }

    const CatchAndBreedIcon = () => {
        if (!catchAndBreed) return <></>;
        return (
            <div style={{position: "absolute", top: 0, right: 0, display: "flex", alignItems: "center"}}>
                <svg width="16" height="16" viewBox="0 0 100 100" aria-label="catch and breed">
                    <circle cx="50" cy="50" r="47" fill="white" stroke="#333" strokeWidth="5"/>
                    <path d="M 3 50 A 47 47 0 0 1 97 50" fill="#e53e3e"/>
                    <line x1="3" y1="50" x2="97" y2="50" stroke="#333" strokeWidth="7"/>
                    <circle cx="50" cy="50" r="13" fill="white" stroke="#333" strokeWidth="5"/>
                </svg>
                <Image src="/images/list/egg-cropped.png" alt={"egg"} width={16} height={16}/>
            </div>
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

    const imageName = !!alolan ? `${pokedexNumber}-alola` : !!galarian ? `${pokedexNumber}-galar` : `${pokedexNumber}`;

    return (
        <>
            <div style={{position: "relative"}}>
                <Image src={`/images/list/${imageName}.png`} width="96" height="96" alt={`i+1`}
                       style={{...getStyle(), display: "block"}}/>
                <Egg/>
                <CatchAndBreedIcon/>
                <Star/>
            </div>
            <Text className={pokemonFont.className} fontSize='xs'>{name}</Text>
        </>
    )
}