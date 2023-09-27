'use client'

import Game from "@/data/Game";
import useSWR from "swr";
import User from "@/data/User";
import {
    Button,
    Checkbox,
    Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack, Text,
    useDisclosure
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GamesSelect({allGames}: { allGames: Game[] }) {
    const router = useRouter();
    const {data: user, error} = useSWR<User, any>(`/users/123`, fetcher);
    const [selectedGames, setSelectedGames] = useState(user?.ownedGames ?? []);
    const [loading, setLoading] = useState(true);
    const {isOpen, onOpen, onClose} = useDisclosure();

    useEffect(() => {
        if(!user) return;
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
        if(!selectedGames) return;
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
                        Due to the Nintendo 3DS store shutting down, you can no longer download the Pokémon Bank and the Poké Transporter.<br/>
                        This means that if you do not already own a 3DS with the Pokémon Bank and the Poké Transporter apps installed you cannot transfer pokemon from games that are not on the Nintendo Switch.
                    </Text>
                    <br/>
                    <Text>Please select below whether you have access to these apps (these settings can be changed later):</Text>
                    <Checkbox>

                        Pokémon Bank
                    </Checkbox>
                    <Checkbox>
                        Pokémon Bank and Poké Transporter
                    </Checkbox>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>
                        Save
                    </Button>
                    <Button variant='ghost'>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <Stack spacing={5}>
            {allGames.map(game => (
                <Checkbox
                    isChecked={!!selectedGames?.find(selectedGames => selectedGames.id === game.id)}
                    onChange={(e) => toggleGame(game, e)}>
                    {game.name}
                </Checkbox>))}
        </Stack>
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