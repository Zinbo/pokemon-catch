import {
    Button, Checkbox,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay, Text, useDisclosure
} from "@chakra-ui/react";
import Image from "next/image";
import {StarIcon} from "@chakra-ui/icons";

export default function AddGame() {
    const {isOpen, onOpen, onClose} = useDisclosure()
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
                            <Checkbox>
                                Red
                            </Checkbox>
                            <Checkbox>
                                Yellow
                            </Checkbox>
                            <Checkbox>
                                Crystal
                            </Checkbox>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Save
                        </Button>
                        <Button variant='ghost'>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}