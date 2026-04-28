package com.stacktobasics.pokemoncatchbackend.domain.encounter;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;

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

    private int pokedexNumber;
    private String pokemonName;
    private String game;
}
