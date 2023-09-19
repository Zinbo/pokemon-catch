import {
    Button,
    Checkbox,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from "@chakra-ui/react";
import {useEffect, useState} from "react";
import Game from "@/data/Game";
import User from "@/data/User";

export default function AddGame() {
    const [user, setUser] = useState<null | User>(null);
    const [games, setGames] = useState<null | Game[]>(null);
    const [error, setError] = useState(false);
    const [usersGames, setUsersGames] = useState<null | Game[]>(null);
    const [updatedUsersGames, setUpdatedUsersGames] = useState<null | Game[]>(null);
    const {isOpen, onOpen, onClose} = useDisclosure()

    const getGames = async () => {
        const res = await fetch(`/games`);
        if (res.ok) {
            setGames(await res.json());
        } else {
            setError(true);
        }
    }

    const getUserDetails = async () => {
        const res = await fetch(`/users/123`);
        if (res.ok) {
            const user = await res.json();
            setUser(user);
            setUsersGames(user.ownedGames);
            setUpdatedUsersGames(user.ownedGames);
        } else {
            setError(true);
        }
    }

    const submit = async () => {
        if(!updatedUsersGames) return;
        const res = await fetch("/users/123/games", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedUsersGames.map(g => g.name))
        });
        setUsersGames(updatedUsersGames);
        onClose();
    }

    const revertGameChanges = () => {
        setUpdatedUsersGames(usersGames);
        onClose();
    }

    const toggleGame = (game: Game, event: React.ChangeEvent<HTMLInputElement>) => {
        if(!user) return;
        let games = updatedUsersGames ? [...updatedUsersGames] : []

        if(event.target.checked) {
            games.push(game);

        } else {
            games = games.filter(g => g.id !== game.id)
        }
        setUpdatedUsersGames(games);
    }

    useEffect(() => {
        getUserDetails();
        getGames();
    }, [])

    return (
        <>
            <Button colorScheme='blue' onClick={onOpen}>Owned Games</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Owned Games</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex direction={"column"}>
                            {games?.map(game => (<Checkbox
                                isChecked={!!updatedUsersGames?.find(g => g.id === game.id)}
                                onChange={(e) => toggleGame(game, e)}>
                                {game.name}
                            </Checkbox>))}
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={submit}>
                            Save
                        </Button>
                        <Button variant='ghost' onClick={revertGameChanges}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}