import {Box, Card, CardBody, CardHeader, Checkbox, Heading} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/table-core";
import Pokemon, {Encounter} from "@/data/Pokemon";
import Game from "@/data/Game";
import CustomTable from "@/components/CustomTable";
import User from "@/data/User";
import {encounterIsAvailable} from "@/lib/PokemonService";

type EncounterRow = {
    method: string;
    location: string;
    game: string;
    conditions: string;
    chance: number;
};

export default function Encounters({pokemon, games, user} : {pokemon: Pokemon, games : Game[], user: User}) {
    const columnHelper = createColumnHelper<EncounterRow>();
    const columns = [
        columnHelper.accessor("method", {
            cell: (info) => info.getValue(),
            header: "Method"
        }),
        columnHelper.accessor("location", {
            cell: (info) => info.getValue(),
            header: "Location"
        }),
        columnHelper.accessor("game", {
            cell: (info) => info.getValue(),
            header: "Game"
        }),
        columnHelper.accessor("conditions", {
            cell: (info) => info.getValue(),
            header: "Conditions"
        }),
        columnHelper.accessor("chance", {
            cell: (info) => info.getValue() + "%",
            header: "Chance",
            meta: {
                isNumeric: true
            }
        })
    ];

    const [encounters, setEncounters] = useState<EncounterRow[]>([]);

    useEffect(() => {
        calculateEncounters()
    }, [pokemon]);

    const calculateEncounters = () => {
        const rows = pokemon.encounterDetails.encounters.flatMap(encounter => {
            if(!encounterIsAvailable(encounter, user.ownedGames)) return [];
            return {
                method: encounter.method,
                location: encounter.location.name,
                game: games.find(g => g.id === encounter.location.gameId)?.name || "",
                conditions: encounter.conditions.length > 1 ? `[${encounter.conditions.join(", ")}]` : encounter.conditions[0],
                chance: encounter.catchRate
            };
        });
        rows.sort((a,b) => b.chance - a.chance);
        setEncounters(rows);
    }

    return (
        <Card>
            <CardHeader>
                <Heading size='md'>Encounters</Heading>
            </CardHeader>

            <CardBody>
                <Checkbox>Show all encounters</Checkbox>
                <Box style={{border: "1px solid #E2E8F0", borderRadius: "12px"}}>
                    <CustomTable columns={columns} data={encounters}/>
                </Box>
            </CardBody>
        </Card>
    )
}