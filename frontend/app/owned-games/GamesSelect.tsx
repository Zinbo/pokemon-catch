'use client'

import Game from "@/types/Game";
import useSWR from "swr";
import User from "@/types/User";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Checkbox,
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
    SimpleGrid, Skeleton,
    Stack,
    Text,
    Tooltip,
    useDisclosure
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {InfoIcon} from "@chakra-ui/icons";

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ROMAN_NUMERALS = ["I (Nintendo 3DS Virtual Console)", "II", "III", "VI", "V", "VI", "VII", "VIII", "IX"];

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

export default function GamesSelect({allGames}: { allGames: Game[] }) {
    const router = useRouter();
    const {data: user, error} = useSWR<User, any>(`/users/123`, fetcher);
    const [selectedGames, setSelectedGames] = useState(user?.ownedGames ?? []);
    const [loading, setLoading] = useState(true);
    const {isOpen, onOpen, onClose} = useDisclosure();

    useEffect(() => {
        if (!user) return;
        onOpen();
        setLoading(false);
        setSelectedGames(user.ownedGames);
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
            body: JSON.stringify(selectedGames.map(g => g.name))
        });
        router.push('/');
    }

    return <>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Pokémon Home and Poké Transporter</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Text>
                        <Text fontWeight={"bold"}>Important!</Text>
                        Due to the Nintendo 3DS store shutting down, you can no longer download the Pokémon Bank and the
                        Poké Transporter apps.<br/>
                        This means that if you do not already own a 3DS with Pokémon Bank app (and the Poké Transporter
                        app for Gen 1 - 5)
                        installed you cannot transfer pokemon from games that are not on the Nintendo Switch.
                    </Text>
                    <br/>
                    <FormControl as='fieldset'>
                        <FormLabel as='legend'>
                            Please select whether you have access to these apps
                        </FormLabel>
                        <Checkbox>
                            Pokémon Bank
                        </Checkbox>
                        <Checkbox>
                            Pokémon Bank and Poké Transporter
                        </Checkbox>
                        <FormHelperText>Your answers will hide games that you cannot transfer pokemon from. You can
                            change this at any time in your settings.</FormHelperText>
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Save
                    </Button>
                    <Button variant='ghost'>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        <SimpleGrid columns={3} spacing={10}>
            {ROMAN_NUMERALS.map((value, index) => (
                        <Card>
                            <CardHeader>
                                <Heading
                                    size='md'>Generation {value} {((index === 1 || index == 2) && difficultTooltipOlderGen) || (index === 3 && difficultTooltip)}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Stack spacing={2}>
                                    {allGames.filter(game => game.generation === (index + 1)).map(game => (
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