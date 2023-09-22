'use client'

import {Box, Card, CardBody, CardHeader, Flex, Heading} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import EvolutionChain, {EvolvesTo} from "@/data/EvolutionChain";
import Image from "next/image";
import Xarrow from "react-xarrows";
import Breeding from "@/app/pokemon-details/[id]/Breeding";
import User from "@/data/User";
import Pokemon from "@/data/Pokemon";

export default function Evolutions({evolutionChain} : {evolutionChain: EvolutionChain}) {
    const [evoArrows, setEvoArrows] = useState<React.JSX.Element[]>([]);
    const [evoRow, setEvoRow] = useState<React.JSX.Element[][]>([]);

    useEffect(() => {
        const {row, arrows} = calculateEvolutionChain();
        setEvoArrows(arrows);
        setEvoRow(row);
    }, [evolutionChain]);

    const calculateEvolutionChain = () => {
        const row: React.JSX.Element[][] = [];
        const column: React.JSX.Element[] = [];
        const arrows: React.JSX.Element[] = [];
        row.push(column);
        calculateEvoColumn(evolutionChain.chain, column, row, arrows);
        return {row, arrows};
    }

    const calculateEvoColumn = (evo: EvolvesTo, column: React.JSX.Element[], evolutionRow: React.JSX.Element[][], arrows: React.JSX.Element[], prevName ?: string) => {

        column.push(<Flex direction={"column"} alignItems={"center"}>
            <Box><Image id={`${evo.name}Evo`} src={`/images/list/${evo.pokedexNumber}.png`} width="96" height="96" alt="pokemon"/></Box>
            {evo.name}
        </Flex>)

        if(prevName) {
            const criteria = evo.waysToEvolve.map(criteria => {
                if(criteria.trigger === "Level up") {
                    const level = criteria.triggerCriteria[0].value;
                    let way = `Level ${level}`;
                    if(criteria.triggerCriteria.length > 1 && criteria.triggerCriteria[1].type === "Relative physical stats") {
                        way += ` (${criteria.triggerCriteria[1].value})`
                    }
                    return way;
                }
                return `Trigger: ${criteria.trigger}, Conditions: [${criteria.triggerCriteria.map(c => `${c.type}: ${c.value}`).join(", ")}]`
            }).join(" OR ");
            arrows.push(<Xarrow
                start={`${prevName}Evo`}
                end={`${evo.name}Evo`}
                labels={{middle: <Card backgroundColor={"#D3D3D3"}><CardBody padding={"10px"}>{criteria}</CardBody></Card>}}
                // labels={{middle: <Box style={{border: "5px solid red", backgroundColor: "white", zIndex: 20}}>{criteria}</Box>}}
                path={'straight'}
                // gridBreak={"50"}
            />)
        }
        if(!evo?.evolvesTo?.length) return;
        const newColumn:  React.JSX.Element[] = [];
        evolutionRow.push(newColumn);
        evo.evolvesTo.forEach(e => calculateEvoColumn(e, newColumn, evolutionRow, arrows, evo.name));
    }

    return (
        <Card>
            <CardHeader>
                <Heading size='md'>Evolutions</Heading>
            </CardHeader>

            <CardBody>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                    {evoRow.map(column => (
                        <Flex direction={"column"} gap={"50px"} flex={1} alignItems={"center"}>
                            {column.map(p => p)}
                        </Flex>
                    ))}
                    <>{evoArrows}</>
                </Flex>
            </CardBody>
        </Card>
    )
}