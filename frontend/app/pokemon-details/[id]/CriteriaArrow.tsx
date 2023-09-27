import {EvolutionCriteria, EvolvesTo} from "@/data/EvolutionChain";
import {Flex, ListItem, Text, Tooltip, UnorderedList} from "@chakra-ui/react";
import {Icon, InfoIcon} from "@chakra-ui/icons";
import {HiOutlineArrowLongRight} from "react-icons/hi2";
import React from "react";

const triggerTypes = ["Level up", "Trade", "Use item", "Shed", "Spin", "Train in the Tower of Darkness", "Train in the Tower of Waters", "Land three critical hits in a battle", "Go somewhere after taking damage", "Other", "Agile-style-move", "Strong-style-move", "Recoil-damage"]


// -- Handle the case where there's only one trigger --


// Level
//// if the only criteria is "Min level", then format the text as "Level up to X".
//// If there are more criteria then display an info icon and a tooltip with the extra info

// Trade
//// if the only criteria is "Held item", then format the text as "Trade holding X".
//// If there are more criteria then display an info icon and a tooltip with the extra info

// Use item
//// If the only criteria is "Item to use", then format the text as "Use X".
//// If there are more criteria then display an info icon and a tooltip with the extra info

// -- Handle the case where there's multiple triggers --
// For now, just default to displaying all the info.

const CriteriaBox = ({text, tooltipList}: { text: string, tooltipList?: string[] }) => (
    <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}>
        <Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/>
        <Flex alignItems={"center"} gap={"5px"}>
            <Text>{text}</Text>
            {!!tooltipList?.length && <Tooltip label={<UnorderedList>{tooltipList.map(o =>
                <ListItem>{o}</ListItem>)}</UnorderedList>}><InfoIcon/></Tooltip>}
        </Flex>
    </Flex>)

const getElement = (wayToEvolve: EvolutionCriteria, trigger: string, mandatoryCriteriaType: string, messageFunc: (value ?: string) => string) => {
    if (wayToEvolve.trigger === trigger) {
        let otherCriteria: string[] = [];
        let mandatoryCriteriaValue: string | undefined = undefined;
        wayToEvolve.triggerCriteria.forEach(criterion => {
            if (criterion.type === mandatoryCriteriaType) mandatoryCriteriaValue = criterion.value;
            else otherCriteria.push(`${criterion.type}: ${criterion.value}`)
        })

        return <CriteriaBox text={messageFunc(mandatoryCriteriaValue)} tooltipList={otherCriteria}/>;
    }
}

const defaultElement = (waysToEvolve: EvolutionCriteria[]) => {
    const criteria = waysToEvolve.map(criteria => `Trigger: ${criteria.trigger}, Conditions: [${criteria.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`).join(" OR ");
    return (
        <Flex direction={"column"} className={"criteria"} justifyContent={"center"} alignItems={"center"}>
            <Icon boxSize={"4em"} viewBox={"0 0 24 10"} as={HiOutlineArrowLongRight}/>
            <Text>{criteria}</Text>
        </Flex>
    )
}

export default function CriteriaArrow({pokemonEvolution}: { pokemonEvolution: EvolvesTo }) {

    if (pokemonEvolution.waysToEvolve.length > 1) return defaultElement(pokemonEvolution.waysToEvolve);

    // Special pokemon
    if (pokemonEvolution.pokedexNumber === 292) return <CriteriaBox text={"Level up to 20, have empty slot in party, have pokéball in bag"}/>;
    if (pokemonEvolution.pokedexNumber === 892) return <CriteriaBox text={"Train in Tower of Darkness or Tower of Waters"}/>;
    if (pokemonEvolution.pokedexNumber === 865) return <CriteriaBox text={"Land three critical hits in a battle"}/>;
    if (pokemonEvolution.pokedexNumber === 869) return <CriteriaBox text={"Spin whilst holding Sweet"}/>
    if (pokemonEvolution.pokedexNumber === 867) return <CriteriaBox text={"Take 49 or more damage and then run under stone arch in the Dusty Bowl"}/>
    if (pokemonEvolution.pokedexNumber === 899) return <CriteriaBox text={"Use Psyshield Bash 20 times in Agile Style"}/>
    if (pokemonEvolution.pokedexNumber === 904) return <CriteriaBox text={"Use Barb Barrage 20 times in Agile Style"}/>
    if (pokemonEvolution.pokedexNumber === 550) return <CriteriaBox text={"Take 294 recoil damage in battle"}/>
    if (pokemonEvolution.pokedexNumber === 923 || pokemonEvolution.pokedexNumber === 947 || pokemonEvolution.pokedexNumber === 954 || pokemonEvolution.pokedexNumber === 947) return <CriteriaBox text={"Walk 1000 steps in Let's Go"}/>
    if (pokemonEvolution.pokedexNumber === 925) return <CriteriaBox text={"Level up to 25+ in battle"}/>
    if (pokemonEvolution.pokedexNumber === 964) return <CriteriaBox text={"Level up to 28 in Union Circle"}/>
    if (pokemonEvolution.pokedexNumber === 979) return <CriteriaBox text={"Use Rage Fist 20 times"}/>
    if (pokemonEvolution.pokedexNumber === 983) return <CriteriaBox text={"Defeat 3 Bisharp that are holding Leader's Crest and then level up"}/>
    if (pokemonEvolution.pokedexNumber === 1000) return <CriteriaBox text={"Collect 999 Gimmighoul Coins and then level up"}/>

    const wayToEvolve = pokemonEvolution.waysToEvolve[0];

    if (wayToEvolve.trigger === "Level up") return getElement(wayToEvolve, "Level up", "Min level", (value ?: string) => value ? `Level up to ${value}` : "Level up");
    if (wayToEvolve.trigger === "Trade") return getElement(wayToEvolve, "Trade", "Held item", (value ?: string) => value ? `Trade holding ${value}` : `Trade`);
    if (wayToEvolve.trigger === "Use item") return getElement(wayToEvolve, "Use item", "Item to use", (value ?: string) => value ? `Use ${value}` : `Use`);

    return defaultElement(pokemonEvolution.waysToEvolve);
}