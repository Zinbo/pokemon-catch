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
import React, {RefObject, useRef} from "react";
import {createColumnHelper} from "@tanstack/table-core";
import Image from "next/image";
import Xarrow from "react-xarrows";

type Pokemon = {
    method: string;
    location: string;
    game: string;
    condition: string;
    chance: number;
};

const data: Pokemon[] = [
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

const columnHelper = createColumnHelper<Pokemon>();

export default function DetailModal({isOpen, onClose}: { isOpen: boolean, onClose: () => void }) {
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

    const evoRefs: RefObject<any>[] = [useRef<any>(null), useRef<any>(null), useRef<any>(null)];
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
                <ModalHeader>Bulbasaur</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Flex direction={"column"}>
                        <Box alignSelf={"center"}>
                            <Image src={`/images/description/1.png`} width="95" height="95" alt="pokemon"/>
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
                        <Flex justifyContent={"space-between"}>
                            <Image ref={evoRefs[0]} src={`/images/list/1.png`} width="96" height="96" alt="pokemon"/>
                            <Image ref={evoRefs[1]} src={`/images/list/2.png`} width="96" height="96" alt="pokemon"/>
                            <Image ref={evoRefs[2]} src={`/images/list/3.png`} width="96" height="96" alt="pokemon"/>
                            <Lines refs={evoRefs}/>
                        </Flex>
                        <Box>
                            <Text
                                fontFamily={'heading'}
                                fontSize='xl'>
                                Breeding
                            </Text>
                        </Box>
                        <Flex justifyContent={"space-between"}>
                            <Image ref={breedingRefs[0]} src={`/images/list/3.png`} width="96" height="96" alt="pokemon"/>
                            <Image ref={breedingRefs[1]} src={`/egg.svg`} width="96" height="96" alt="pokemon"/>
                            <Image ref={breedingRefs[2]} src={`/images/list/2.png`} width="96" height="96" alt="pokemon"/>
                            <Image ref={breedingRefs[3]} src={`/images/list/3.png`} width="96" height="96" alt="pokemon"/>
                            <Lines refs={breedingRefs}/>
                        </Flex>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}