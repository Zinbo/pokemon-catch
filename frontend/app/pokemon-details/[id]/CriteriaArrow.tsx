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

    // Special pokemon
    const pokedexNumber = pokemonEvolution.pokedexNumber;
    if (pokedexNumber === 292) return <CriteriaBox text={"Level up to 20, have empty slot in party, have pokéball in bag"}/>;
    if (pokedexNumber === 892) return <CriteriaBox text={"Train in Tower of Darkness or Tower of Waters"}/>;
    if (pokedexNumber === 865) return <CriteriaBox text={"Land three critical hits in a battle"}/>;
    if (pokedexNumber === 869) return <CriteriaBox text={"Spin whilst holding Sweet"}/>
    if (pokedexNumber === 867) return <CriteriaBox text={"Take 49 or more damage and then run under stone arch in the Dusty Bowl"}/>
    if (pokedexNumber === 899) return <CriteriaBox text={"Use Psyshield Bash 20 times in Agile Style"}/>
    if (pokedexNumber === 904) return <CriteriaBox text={"Use Barb Barrage 20 times in Agile Style"}/>
    if (pokedexNumber === 550) return <CriteriaBox text={"Take 294 recoil damage in battle"}/>
    if (pokedexNumber === 923 || pokedexNumber === 947 || pokedexNumber === 954 || pokedexNumber === 947) return <CriteriaBox text={"Walk 1000 steps in Let's Go"}/>
    if (pokedexNumber === 925) return <CriteriaBox text={"Level up to 25+ in battle"}/>
    if (pokedexNumber === 964) return <CriteriaBox text={"Level up to 28 in Union Circle"}/>
    if (pokedexNumber === 979) return <CriteriaBox text={"Use Rage Fist 20 times"}/>
    if (pokedexNumber === 983) return <CriteriaBox text={"Defeat 3 Bisharp that are holding Leader's Crest and then level up"}/>
    if (pokedexNumber === 1000) return <CriteriaBox text={"Collect 999 Gimmighoul Coins and then level up"}/>

    // Alolan pokemon
    if(pokedexNumber === 20) return <CriteriaBox text={"Level up to 20"} tooltipList={["At night if Alolan form"]}/>
    if(pokedexNumber === 28) return <CriteriaBox text={"Level up to 22"} tooltipList={["Or use an Ice Stone if Alolan form"]}/>
    if(pokedexNumber === 38) return <CriteriaBox text={"Use a Fire Stone"} tooltipList={["Or use an Ice Stone if Alolan form"]}/>
    if(pokedexNumber === 53) return <CriteriaBox text={"Level up to 28"} tooltipList={["Or have high friendship if Alolan form"]}/>
    if(pokedexNumber === 80) return <CriteriaBox text={"Level up to 37"} tooltipList={["Or use Galarica Cuff if Galarian form"]}/>
    if(pokedexNumber === 199) return <CriteriaBox text={"Trade holding Kings Rock"} tooltipList={["Or use Galarica Wreath if Galarian form"]}/>
    if(pokedexNumber === 105) return <CriteriaBox text={"Level up to 28"} tooltipList={["At night if Alolan form"]}/>
    if(pokedexNumber === 470) return <CriteriaBox text={"Use Leaf Stone"} tooltipList={["Or level up in Eterna Forest, Pinwheel Forest, or Kalos Route 20"]}/>
    if(pokedexNumber === 471) return <CriteriaBox text={"Use Ice Stone"} tooltipList={["Or level up in Route 217, Twist Mountain, or Frost Cavern"]}/>
    if(pokedexNumber === 700) return <CriteriaBox text={"Level up when knows Fairy-type move and either has 2 affection in Gen 6-7 or >160 happiness in Gen 8"}/>
    if(pokedexNumber === 476) return <CriteriaBox text={"Level up in Kalos Route 13, Chargestone Cave, or Mt. Coronet"}/>
    if(pokedexNumber === 555) return <CriteriaBox text={"Level up to 35"} tooltipList={["Or use an Ice Stone if Alolan form"]}/>
    if(pokedexNumber === 745) return <CriteriaBox text={"Level Up to 25 during the day in Sun/Ultra Sun, during the night in Moon/Ultra Moon, or any time in Galar and Paldea"}/>


    const wayToEvolve = pokemonEvolution.waysToEvolve[0];

    if (wayToEvolve.trigger === "Level up") return getElement(wayToEvolve, "Level up", "Min level", (value ?: string) => value ? `Level up to ${value}` : "Level up");
    if (wayToEvolve.trigger === "Trade") return getElement(wayToEvolve, "Trade", "Held item", (value ?: string) => value ? `Trade holding ${value}` : `Trade`);
    if (wayToEvolve.trigger === "Use item") return getElement(wayToEvolve, "Use item", "Item to use", (value ?: string) => value ? `Use ${value}` : `Use`);

    return defaultElement(pokemonEvolution.waysToEvolve);
}