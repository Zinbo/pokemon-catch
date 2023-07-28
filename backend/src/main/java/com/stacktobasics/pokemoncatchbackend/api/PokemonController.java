package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.PopulateDbWithPokeData;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("pokemon")
@Slf4j
public class PokemonController {
    private final PopulateDbWithPokeData populateDbWithPokeData;
    private final PokemonRepository pokemonRepository;

    public PokemonController(PopulateDbWithPokeData populateDbWithPokeData, PokemonRepository pokemonRepository) {
        this.populateDbWithPokeData = populateDbWithPokeData;
        this.pokemonRepository = pokemonRepository;
    }

    @PostMapping("/initialise")
    public void initialisePokemon(){
        log.info("Populating pokemon and evolution chains...");
        populateDbWithPokeData.populatePokemon();
        log.info("Populated pokemon and evolution chains.");
    }


    @GetMapping()
    public Iterable<Pokemon> getPokemon() {
        return pokemonRepository.findAll();
    }
}
