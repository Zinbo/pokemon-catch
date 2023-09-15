import {
    Box, Button,
    Flex,
    IconButton, ListItem,
    Modal, ModalBody, ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text, UnorderedList,
    useDisclosure
} from "@chakra-ui/react";
import React from "react";
import {DataTable} from "@/app/DataTable";
import {createColumnHelper} from "@tanstack/table-core";
import {ArrowDownIcon, ViewIcon} from "@chakra-ui/icons";
import DetailModal from "@/app/DetailModal";

type Pokemon = {
    name: string;
    chance: number;
};

const data: Pokemon[] = [
    {
        name: "Bulbasaur",
        chance: 40
    },
    {
        name: "Weedle",
        chance: 100,
    },
    {
        name: "Butterfree",
        chance: 10,
    },
    {
        name: "Sandshrew",
        chance: 20,
    }
];

const columnHelper = createColumnHelper<Pokemon>();


export default function PokemonInSpecificGame() {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
            header: "Name"
        }),
        columnHelper.accessor("chance", {
            cell: (info) => info.getValue() + "%",
            header: "Chance",
            meta: {
                isNumeric: true
            }
        }),
        {
            cell: <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database' icon={<ViewIcon/>}
                              onClick={onOpen}/>,
            header: " "
        }
    ];

    return (
        <Flex direction={"column"}>
            <Box flex={1}>
                <Text
                    fontFamily={'heading'}
                    fontSize='6xl'>
                    Pokemon Available In Specific Game
                </Text>
            </Box>
            <Box>
                <Select placeholder='Select option'>
                    <option value='option1'>Red</option>
                    <option value='option2'>Yellow</option>
                    <option value='option3'>Crystal</option>
                </Select>
            </Box>
            <Box>
                <DataTable columns={columns} data={data}/>
            </Box>
            <DetailModal isOpen={isOpen} onClose={onClose}/>
        </Flex>
    )
}