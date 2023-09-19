import {
    Box,
    Button, Checkbox, Flex,
    Input,
    InputGroup,
    InputRightElement,
    Menu,
    MenuButton,
    MenuGroup, MenuItem,
    MenuList, Select
} from "@chakra-ui/react";
import {Icon, SearchIcon} from "@chakra-ui/icons";
import {BsFilter} from "react-icons/bs";

export default function Search() {
    return (
        <Flex flex={1} gap={'10px'}>
            <Box flex={1}>
                <InputGroup>
                    <Input placeholder='Search for pokemon...'/>
                    <InputRightElement>
                        <SearchIcon/>
                    </InputRightElement>
                </InputGroup>
            </Box>
            <Box>
                <Menu closeOnSelect={false}>
                    <MenuButton as={Button}>
                        <Icon as={BsFilter}/>
                    </MenuButton>
                    <MenuList>
                        <MenuGroup title='Filters'>
                            <MenuItem><Checkbox defaultChecked>Hide Owned Pokemon</Checkbox></MenuItem>
                            <MenuItem><Checkbox defaultChecked>Hide Pokemon that cannot be caught</Checkbox></MenuItem>
                        </MenuGroup>
                        <MenuGroup title='Show Pokemon From...'>
                            <MenuItem><Select onClick={e => e.stopPropagation()} placeholder='Select game'>
                                <option value='option1'>Red</option>
                                <option value='option2'>Yellow</option>
                                <option value='option3'>Crystal</option>
                            </Select>
                            </MenuItem>
                        </MenuGroup>

                    </MenuList>
                </Menu>
            </Box>
        </Flex>)
}