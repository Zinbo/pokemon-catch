'use client'
import React, {memo, useMemo, useState} from "react";
import {Button, Flex, GridItem, Text} from "@chakra-ui/react";
import Image from "next/image";
import Pokemon from "@/data/Pokemon";

export default function Grid({allPokemon} : {allPokemon: Pokemon[]}) {
    const [toggleFilter, setToggleFilter] = useState(false);

    const filterData2 = () => {
        const pokemon = allPokemon;
        if(!toggleFilter) return pokemon.map(n => {return {...n, visible: true}});
        return pokemon.map((n, index) => {
            return {...n, visible: index % 2 === 0};
        });
    }

    const filteredData2 = filterData2();

    const Render = () => (
        <>
            <Button onClick={() => setToggleFilter(!toggleFilter)}>{toggleFilter ? "Disable Filter" : "Enable Filter"}</Button>
            <Flex direction={"column"} rowGap={5} style={{paddingTop: "20px"}}>
                {filteredData2.map((n) => <Child key={n.pokedexNumber} id={n.pokedexNumber} name={n.name} visible={n.visible}/>)}
            </Flex>
        </>
    )

    return Render();
}

const Child = memo(function Child({id, name, visible} :{id: number, name: string, visible: boolean}) {

    console.log("Re-rendering pokemon with id: ", id);

    const Inner = useMemo(() => {
        console.log("Re-rendering Inner pokemon with id: ", id);
        return (<Flex id="front" flex={1} justifyContent={"center"} direction={"column"} alignItems={"center"} className='pokemon-grid--off'>
            <Image src={`/images/list/${id}.png`} width="96" height="96" alt={`i+1`}/>
            <Text fontSize='xs'>{name}</Text>
        </Flex>);
    }, [id, name]);

    return (
        <GridItem id="card" border='1px' borderColor='gray.200' backgroundColor={"white"} className='pokemon-grid' style={{display: visible ? "block" : "none"}}>
            {Inner}
        </GridItem>
    )
});