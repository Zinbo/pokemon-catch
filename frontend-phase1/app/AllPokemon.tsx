import {Box, CloseButton, Flex, IconButton, Text, useDisclosure} from "@chakra-ui/react";
import {CheckIcon, CloseIcon, ViewIcon} from "@chakra-ui/icons";
import {createColumnHelper} from "@tanstack/table-core";
import {DataTable} from "@/app/DataTable";
import DetailModal from "@/app/DetailModal";

type Pokemon = {
    name: string;
    canBeCaught: boolean;
    canBeBred: boolean;
    owned: boolean;
};

const data: Pokemon[] = [
    {
        name: "Bulbasaur",
        canBeCaught: true,
        canBeBred: false,
        owned: true
    },
    {
        name: "Weedle",
        canBeCaught: true,
        canBeBred: false,
        owned: false
    },
    {
        name: "Butterfree",
        canBeCaught: false,
        canBeBred: true,
        owned: false
    },
    {
        name: "Sandshrew",
        canBeCaught: false,
        canBeBred: false,
        owned: false
    }
];

const columnHelper = createColumnHelper<Pokemon>();



export default function AllPokemon() {
    const {isOpen, onOpen, onClose} = useDisclosure()

    const columns = [
        columnHelper.accessor("name", {
            cell: (info) => info.getValue(),
            header: "Name"
        }),
        columnHelper.accessor("canBeCaught", {
            cell: (info) => info.getValue() ? <CheckIcon/> : <CloseIcon/>,
            header: "Can be caught"
        }),
        columnHelper.accessor("canBeBred", {
            cell: (info) => info.getValue() ? <CheckIcon/> : <CloseIcon/>,
            header: "Can be bred"
        }),
        columnHelper.accessor("owned", {
            cell: (info) => <IconButton isRound={true} variant='outline' size='sm' aria-label='Mark as owned'
                                        icon={info.getValue() ? <CheckIcon/> : <CloseButton/>}/>,
            header: "Owned"
        }),
        {
            cell: <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database' icon={<ViewIcon/>} onClick={onOpen}/>,
            header: " "
        }
    ];

    return (<Flex direction={"column"}>
        <Box flex={1}>
            <Text
                fontFamily={'heading'}
                fontSize='6xl'>
                All Pokemon To Collect
            </Text>
        </Box>
        <Box flex={1}>
            <DataTable columns={columns} data={data}/>
        </Box>
        <DetailModal isOpen={isOpen} onClose={onClose}/>
    </Flex>)
}