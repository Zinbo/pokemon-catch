import {
    Box, Button,
    Flex, IconButton, ListItem, Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    UnorderedList
} from "@chakra-ui/react";
import {DataTable} from "@/app/DataTable";
import {ArrowDownIcon, ViewIcon} from "@chakra-ui/icons";
import React from "react";
import {createColumnHelper} from "@tanstack/table-core";

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

    return (
        <Box flex={1} width={"2000px"}>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent flex={1} maxW="1000px">
                    <ModalHeader>Weedle</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex direction={"column"}>
                            <Box>
                                <Text
                                    fontFamily={'heading'}
                                    fontSize='xl'>
                                    Encounters
                                </Text>
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
                            <Box>
                                <Text>Weedle</Text>
                                <UnorderedList>
                                    <ListItem>Trigger: Level up, Conditions: [Min level: 28]</ListItem>
                                    <ListItem>Trigger: Level up, Conditions: [Min level: 28, Time of day:
                                        night]</ListItem>
                                </UnorderedList>
                            </Box>
                            <ArrowDownIcon/>
                            <Box>
                                <Text>Kakuna</Text>
                                <UnorderedList>
                                    <ListItem>Trigger: Level up, Conditions: [Min level: 28]</ListItem>
                                    <ListItem>Trigger: Level up, Conditions: [Min level: 28, Time of day:
                                        night]</ListItem>
                                </UnorderedList>
                            </Box>
                            <ArrowDownIcon/>
                            <Box>
                                <Text>Beedrill</Text>
                            </Box>
                            <Box>
                                <Text
                                    fontFamily={'heading'}
                                    fontSize='xl'>
                                    Breeding
                                </Text>
                            </Box>
                            <Box>
                                <Text>Breed from Beedrill</Text>
                            </Box>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}