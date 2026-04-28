package com.stacktobasics.pokemoncatchbackend.domain.encounter;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;

import java.util.List;
import java.util.UUID;

@Slf4j
@Getter
@Setter
@NoArgsConstructor
public class Encounter {
    @Id
    private UUID id;

    private String encounterHtml;
    private String encounterText;
    private String cleanedUpEncounterText;

    private int pokedexNumber;
    private String pokemonName;
    private String game;

    private String location;
    private List<String> conditions;
    private String method;
    private int catchRate;
}
