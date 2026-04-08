import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Flex,
    Input,
    InputGroup,
    InputRightElement,
    Select,
    Text
} from "@chakra-ui/react";
import {SearchIcon} from "@chakra-ui/icons";
import Filters from "@/app/Filters";
import Game from "@/types/Game";

interface FilterToggleProps {
    label: string
    isHidden: boolean
    isDisabled: boolean
    onToggle: () => void
}

function FilterToggle({label, isHidden, isDisabled, onToggle}: FilterToggleProps) {
    return (
        <Flex direction="column" align="center" gap={1}>
            <Text fontSize="xs" fontWeight="medium" color={isDisabled ? "gray.400" : "gray.600"} userSelect="none">
                {label}
            </Text>
            <ButtonGroup size="sm" isAttached>
                <Button
                    colorScheme={isHidden ? "red" : "gray"}
                    variant={isHidden ? "solid" : "outline"}
                    isDisabled={isDisabled}
                    onClick={() => { if (!isHidden) onToggle(); }}
                >
                    Hide
                </Button>
                <Button
                    colorScheme={!isHidden ? "green" : "gray"}
                    variant={!isHidden ? "solid" : "outline"}
                    isDisabled={isDisabled}
                    onClick={() => { if (isHidden) onToggle(); }}
                >
                    Show
                </Button>
            </ButtonGroup>
        </Flex>
    );
}

export default function Search({filters, setFilters, searchTerm, setSearchTerm, games, selectedGame, setSelectedGame}:
{
    filters: Filters,
    setFilters: (filter: Filters) => void,
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    games: Game[],
    selectedGame: Game | null,
    setSelectedGame: (game: Game | null) => void
}) {

    const filtersDisabled = filters.onlyShowBestEncounters;
    const selectedGameIndex = selectedGame ? games.findIndex(g => g.id === selectedGame.id) : -1;

    return (
        <Flex direction="column" gap={4}>
            <InputGroup backgroundColor="white">
                <Input placeholder='Search for pokemon...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <InputRightElement>
                    <SearchIcon/>
                </InputRightElement>
            </InputGroup>

            <Flex gap={6} align="flex-start" wrap="wrap">
                <FilterToggle
                    label="Owned Pokémon"
                    isHidden={filters.hideOwned}
                    isDisabled={filtersDisabled}
                    onToggle={() => setFilters({...filters, hideOwned: !filters.hideOwned})}
                />
                <FilterToggle
                    label="Unobtainable Pokémon"
                    isHidden={filters.hideUncatchable}
                    isDisabled={filtersDisabled}
                    onToggle={() => setFilters({...filters, hideUncatchable: !filters.hideUncatchable})}
                />
                <FilterToggle
                    label="Catchable Pokémon"
                    isHidden={filters.hideCatchable}
                    isDisabled={filtersDisabled}
                    onToggle={() => setFilters({...filters, hideCatchable: !filters.hideCatchable})}
                />
                <FilterToggle
                    label="Breedable Pokémon"
                    isHidden={filters.hideBreedable}
                    isDisabled={filtersDisabled}
                    onToggle={() => setFilters({...filters, hideBreedable: !filters.hideBreedable})}
                />
            </Flex>

            <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Show Pokémon from</Text>
                <Select
                    backgroundColor="white"
                    maxW="320px"
                    value={selectedGameIndex >= 0 ? selectedGameIndex : ''}
                    onChange={e => {
                        const index = e.target.value as unknown as number;
                        const game = games[index] ?? null;
                        setSelectedGame(game);
                        if (!game) setFilters({...filters, onlyShowBestEncounters: false});
                    }}
                    placeholder='Select game'
                >
                    {games.map((g, index) => <option key={index} value={index}>{g.name}</option>)}
                </Select>
                <Checkbox
                    mt={2}
                    isDisabled={!selectedGame}
                    isChecked={filters.onlyShowBestEncounters}
                    onChange={(e) => setFilters({...filters, onlyShowBestEncounters: e.target.checked})}
                >
                    <Text fontSize="sm">Only show pokemon with best encounter rate in game</Text>
                </Checkbox>
            </Box>
        </Flex>
    );
}
