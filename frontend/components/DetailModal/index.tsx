import {
    Box,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";
import {DataTable} from "@/components/DataTable";
import React, {RefObject, useEffect, useRef, useState} from "react";
import {createColumnHelper} from "@tanstack/table-core";
import Image from "next/image";
import Xarrow, {xarrowPropsType} from "react-xarrows";
import Pokemon from "@/types/Pokemon";
import EvolutionChain from "@/types/EvolutionChain";
import EvolutionChain, {EvolvesTo} from "@/types/EvolutionChain";
import Evolutions from "@/app/pokemon-details/[id]/Evolutions";
import Breeding from "@/app/pokemon-details/[id]/Breeding";
import User from "@/types/User";

type EncounterRow = {
    method: string;
    location: string;
    game: string;
    condition: string;
    chance: number;
};

const data: EncounterRow[] = [
    {
        method: "Receive as gift",
        location: "Cerulean City",
        game: "Yellow",
        condition: "None",
        chance: 100
    },
    {
        method: "Walking in tall grass or a cave",
        location: "Viridian Forest",
        game: "Red",
        condition: "None",
        chance: 40
    },
];

const columnHelper = createColumnHelper<EncounterRow>();

export default function Index({isOpen, onClose, pokemon, evolutionChain, user}: { isOpen: boolean, onClose: () => void, pokemon: Pokemon, evolutionChain: EvolutionChain, user: User }) {
    const columns = [
        columnHelper.accessor("method", {
            cell: (info) => info.getValue(),
            header: "Method"
        }),
        columnHelper.accessor("location", {
            cell: (info) => info.getValue(),
            header: "Location"
        }),
        columnHelper.accessor("game", {
            cell: (info) => info.getValue(),
            header: "Game"
        }),
        columnHelper.accessor("condition", {
            cell: (info) => info.getValue(),
            header: "Condition"
        }),
        columnHelper.accessor("chance", {
            cell: (info) => info.getValue() + "%",
            header: "Chance",
            meta: {
                isNumeric: true
            }
        })
    ];

    const breedingRefs: RefObject<any>[] = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

    const Lines = ({refs}: { refs: RefObject<any>[] }) => {
        let prevRef: RefObject<SVGSVGElement> | null = null;
        const lines: React.JSX.Element[] = [];

        refs.forEach(ref => {
            if (prevRef === null) {
                prevRef = ref;
                return;
            }

            lines.push(<Xarrow
                start={prevRef}
                end={ref}
                labels={{middle: <div style={{paddingTop: "20px"}}>Level 28</div>}}
            />)
            prevRef = ref;
        })
        return <>{lines}</>
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent flex={1} maxW="1000px">
                <ModalHeader>{pokemon.name}</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Flex direction={"column"}>
                        <Box alignSelf={"center"}>
                            <Image src={`/images/description/${pokemon.pokedexNumber}.png`} width="95" height="95" alt="pokemon"/>
                        </Box>
                        <Box>
                            <DataTable columns={columns} data={data}/>
                        </Box>
                        <Box>
                            <Text
                                fontFamily={'heading'}
                                fontSize='xl'>
                                Evolutions
                            </Text>
                        </Box>
                        <Evolutions evolutionChain={evolutionChain}/>
                        <Breeding user={user} pokemon={pokemon} evolutionChain={evolutionChain}/>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}