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
import {Property} from "csstype";
import Filter = Property.Filter;
import Filters from "@/app/Filters";
import Game from "@/types/Game";

export default function Search({filters, setFilters, searchTerm, setSearchTerm, games, selectedGame, setSelectedGame} :
{filters: Filters, setFilters: (filter: Filters) => void, searchTerm: string, setSearchTerm: (term: string) => void, games: Game[], selectedGame: Game|null, setSelectedGame: (game: Game) => void}) {


    return (
        <Flex flex={1} gap={'10px'}>
            <Box flex={1}>
                <InputGroup backgroundColor={"white"}>
                    <Input placeholder='Search for pokemon...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
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
                            <MenuItem><Checkbox isChecked={filters.hideOwned} onChange={(e) => setFilters({...filters, hideOwned: e.target.checked})}>Hide Owned Pokemon</Checkbox></MenuItem>
                            <MenuItem><Checkbox isChecked={filters.hideUncatchable} onChange={(e) => setFilters({...filters, hideUncatchable: e.target.checked})}>Hide Pokemon that can't be caught or bred</Checkbox></MenuItem>
                            <MenuItem><Checkbox isChecked={filters.onlyShowBreedable} onChange={(e) => setFilters({...filters, onlyShowBreedable: e.target.checked})}>Only show breedable pokemon</Checkbox></MenuItem>
                            <MenuItem><Checkbox isDisabled={!selectedGame} isChecked={filters.onlyShowBestEncounters} onChange={(e) => setFilters({...filters, onlyShowBestEncounters: e.target.checked})}>Only show pokemon with best encounter rate in game (Game must be selected below)</Checkbox></MenuItem>
                        </MenuGroup>
                        <MenuGroup title='Show Pokemon From...'>
                            <MenuItem><Select onClick={e => e.stopPropagation()} onChange={e => {
                                const index = e.target.value as unknown as number;
                                const game = games[index];
                                setSelectedGame(game);
                                if(!game) setFilters({...filters, onlyShowBestEncounters: false});
                            }} placeholder='Select game'>
                                {
                                    games.map((g, index) => <option key={index} value={index}>{g.name}</option>)
                                }
                            </Select>
                            </MenuItem>
                        </MenuGroup>

                    </MenuList>
                </Menu>
            </Box>
        </Flex>)
}