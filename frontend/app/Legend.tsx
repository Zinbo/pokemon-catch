import {
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, Text, useDisclosure
} from "@chakra-ui/react";
import Image from "next/image";
import {StarIcon} from "@chakra-ui/icons";

export default function Legend() {
    const {isOpen, onOpen, onClose} = useDisclosure()
    return (
        <>
            <Button colorScheme='blue' onClick={onOpen}>Show Legend</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Legend</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Flex direction={"column"}>
                            <Flex alignItems={"center"}>
                                <Image src={"/images/list/6.png"} width={96} height={96} alt={"egg"}/>
                                <Text>Caught</Text>
                            </Flex>
                            <Flex alignItems={"center"}>
                                <Image style={{WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)"}}
                                       src={"/images/list/6.png"} width={96} height={96} alt={"egg"}/>
                                <Text>Not caught</Text>
                            </Flex>
                            <Flex alignItems={"center"}>
                                <Image
                                    style={{WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)", opacity: "0.5"}}
                                    src={"/images/list/6.png"} width={96} height={96} alt={"egg"}/>
                                <Text>Not caught, and cannot be caught with current games</Text>
                            </Flex>
                            <Flex alignItems={"center"}>
                                <Image style={{opacity: "0.5"}} src={"/images/list/6.png"} width={96} height={96}
                                       alt={"egg"}/>
                                <Text>Caught, and cannot be caught with current games</Text>
                            </Flex>
                            <Flex alignItems={"center"}>
                                <Image src={"/egg.svg"} width={96} height={96} alt={"egg"}/>
                                <Text>Can be bred from existing pokemon</Text>
                            </Flex>
                            <Flex alignItems={"center"}>
                                <StarIcon boxSize={24} color={"#FFCD00"}/>
                                <Text>Selected game has the best encounter chance for this pokemon</Text>
                            </Flex>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}