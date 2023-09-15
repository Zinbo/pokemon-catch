import {Flex, GridItem, IconButton, Text, Tooltip, useDisclosure} from "@chakra-ui/react";
import Image from "next/image";
import {CheckIcon, StarIcon, ViewIcon} from "@chakra-ui/icons";
import {useState} from "react";
import ReactCardFlip from "react-card-flip";
import DetailModal from "@/components/DetailModal";

const NOT_CAUGHT = {WebkitFilter: "grayscale(100%)", filter: "grayscale(100%)"};
const CANNOT_CATCH = {opacity: "0.5"};

const getStyle = (index: number) => {
    const modResult = index % 4;
    if (modResult === 0) return {};
    if (modResult === 1) return NOT_CAUGHT;
    if (modResult === 2) return CANNOT_CATCH;
    return {...NOT_CAUGHT, ...CANNOT_CATCH};
}

export default function PokemonGridItem({i}: { i: number }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const {isOpen, onOpen, onClose} = useDisclosure();

    function openModal() {
        setIsFlipped(false);
        onOpen()
    }

    return (
        <GridItem id="card" onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)}>
            <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal"
                           containerStyle={{height: "100%", display: "flex", alignItems: "stretch"}}>
                <Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"}>
                    <div style={{position: "relative"}}>
                        <Image src={`/images/list/${i + 1}.png`} width="96" height="96" alt={`i+1`}
                               style={{...getStyle(i), display: "block"}}/>
                        {i % 4 === 0 ?
                            <Tooltip label='Can be bred'><Image src="/egg.svg" alt={"egg"} width={32} height={32}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    right: 0
                                                                }}/></Tooltip> : <></>}
                        {i % 6 === 0 ?
                            <Tooltip label='Best catch rate in this game'><StarIcon boxSize={8} color={"#FFCD00"}
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        top: 0,
                                                                                        left: 0
                                                                                    }}/></Tooltip> : <></>}
                    </div>
                    <Text>Bulbasaur</Text>
                </Flex>
                <Flex id="back" justifyContent={"center"} alignItems={"center"} style={{height: "100%"}}>
                    <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                                icon={<ViewIcon/>} onClick={() => openModal()}/>
                    <IconButton isRound={true} variant='outline' size='sm' aria-label='Search database'
                                icon={<CheckIcon/>}/>
                    <DetailModal isOpen={isOpen} onClose={onClose}/>

                </Flex>
            </ReactCardFlip>

        </GridItem>

    )
}