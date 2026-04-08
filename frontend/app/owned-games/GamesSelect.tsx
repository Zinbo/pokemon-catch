'use client'

import Game from "@/types/Game";
import useSWR, {mutate} from "swr";
import User, {BankAccess} from "@/types/User";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Radio,
    RadioGroup,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {InfoIcon} from "@chakra-ui/icons";

const fetcher = (url: string) => fetch(url).then(r => r.json())

const difficultTooltipOlderGen = (
    <Tooltip
        label={<div>
            <div>Getting pokemon from this generation to Pokemon Home is a difficult and very tedious
                undertaking. You'll require a Nintendo DS or DS Lite, another Nintendo (3)DS, a Gen IV game (Diamond,
                Pearl, Platinum, Soul
                Silver, and Heart Gold), and a Gen V Pokémon game (Black, White, Black 2, or White
                2)
            </div>
            <div>Select these games only if you're willing to put in the time and effort!</div>
        </div>}><InfoIcon/></Tooltip>
)

const difficultTooltip = (
    <Tooltip
        label={<div>
            <div>Getting pokemon from this generation to Pokemon Home is a difficult and very tedious
                undertaking. You'll require 2 Nintendo (3)DSs and a Gen V Pokémon game (Black, White, Black 2, or White
                2)
            </div>
            <div>Select these games only if you're willing to put in the time and effort!</div>
        </div>}><InfoIcon/></Tooltip>
)

interface Generation {
    name: string
    games: Game[]
    requires ?: BankAccess
    difficulty ?: Difficulty
}

enum Difficulty {
    HARD = "HARD",
    HARDEST = "HARDEST"
}

const calculateAvailableGenerations = (user: User, generations: Generation[]) => {
    switch(user.pokemonBankAccess) {
        case "NONE":
            return generations.filter(g => !g.requires)
        case "BANK":
            return generations.filter(g => g.requires !== BankAccess.BANK_AND_TRANSPORTER)
        default:
            return generations
    }
}

export default function GamesSelect({generations}: { generations: Generation[] }) {
    const router = useRouter();
    const {data: user, error} = useSWR<User, any>(`/users/123`, fetcher);
    const [selectedGames, setSelectedGames] = useState(user?.ownedGames ?? []);
    const [loading, setLoading] = useState(true);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [pokemonBankAccess, setPokemonBankAccess] = useState<BankAccess>(user?.pokemonBankAccess ?? BankAccess.NONE);
    const [availableGenerations, setAvailableGenerations] = useState(generations);

    useEffect(() => {
        if (!user) return;
        if(!user.pokemonBankAccess) onOpen();
        setLoading(false);
        setSelectedGames(user.ownedGames);
        if(user.pokemonBankAccess) setPokemonBankAccess(user.pokemonBankAccess);
        setAvailableGenerations(calculateAvailableGenerations(user, generations));
    }, [user]);

    const toggleGame = (game: Game, event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return;

        let copy = [...selectedGames];

        if (event.target.checked) {
            copy.push(game);


        } else {
            copy = copy.filter(g => g.id !== game.id)
        }
        setSelectedGames(copy);
    }

    const submit = async () => {
        if (!selectedGames) return;
        setLoading(true);
        await fetch("/users/123/games", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(selectedGames.map(g => g.id))
        });
        router.push('/');
    }

    const savePokemonBankAccess = async () => {
        await fetch(`/users/123/pokemon-bank-access/${pokemonBankAccess}`, {method: 'POST'});
        await mutate(`/users/123`);
        onClose();
    }


    return <>
        <Flex><Button onClick={onOpen}>Pokémon Bank Settings</Button></Flex>
    <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Pokémon Bank and Poké Transporter</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Text>
                        <Text fontWeight={"bold"}>Important!</Text>
                        Due to the Nintendo 3DS store shutting down, you can no longer download the Pokémon Bank and the
                        Poké Transporter apps.<br/>
                        This means that if you do not already own a 3DS with Pokémon Bank app (and the Poké Transporter
                        app for Gen 1 - 5)
                        installed you cannot transfer pokemon from games that are not on the Nintendo Switch. <br/>
                        If you don't have these apps you can look into other means of acquiring them (such as described in this <a target="_blank" href={"https://www.youtube.com/watch?v=xeoDxF5Zp7A"} >video</a>), <b>but you do so at your own
                        risk.<br/>
                        I cannot take any responsibility for any issues you may have.</b>
                    </Text>
                    <br/>
                    <FormControl as='fieldset'>
                        <FormLabel as='legend'>
                            Please select whether you have access to these apps
                        </FormLabel>
                        <RadioGroup value={pokemonBankAccess} onChange={(v) => setPokemonBankAccess(v as BankAccess)}>
                            <Stack direction='column'>
                                <Radio value={BankAccess.NONE}>None</Radio>
                                <Radio value={BankAccess.BANK}>Pokémon Bank</Radio>
                                <Radio value={BankAccess.BANK_AND_TRANSPORTER}>Pokémon Bank and Poké Transporter</Radio>
                            </Stack>
                        </RadioGroup>
                        <FormHelperText>Your answer will hide games that you cannot transfer pokemon from. You can
                            change this at any time in your settings.</FormHelperText>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={savePokemonBankAccess}>
                        Save
                    </Button>
                    <Button variant='ghost' onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        <SimpleGrid columns={3} spacing={10}>
            {availableGenerations.map((generation) => (
                        <Card>
                            <CardHeader>
                                <Heading
                                    size='md'>{generation.name} {((generation.difficulty === Difficulty.HARDEST) && difficultTooltipOlderGen) || (generation.difficulty === Difficulty.HARD && difficultTooltip)}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Stack spacing={2}>
                                    {generation.games.map(game => (
                                        <Checkbox
                                            isDisabled={loading}
                                            isChecked={!!selectedGames?.find(selectedGames => selectedGames.id === game.id)}
                                            onChange={(e) => toggleGame(game, e)}>
                                            {game.name}
                                        </Checkbox>))}
                                </Stack>
                            </CardBody>
                        </Card>
                )
            )}
        </SimpleGrid>


        <Button
            mt={4}
            colorScheme='teal'
            type='submit'
            isLoading={loading}
            onClick={submit}
        >
            Submit
        </Button>
    </>
}