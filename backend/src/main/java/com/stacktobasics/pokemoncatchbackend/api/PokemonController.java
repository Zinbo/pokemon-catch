package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.ImportCaughtPokemon;
import com.stacktobasics.pokemoncatchbackend.PopulateDbWithPokeData;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("pokemon")
@Slf4j
public class PokemonController {
    private final PopulateDbWithPokeData populateDbWithPokeData;
    private final ImportCaughtPokemon importCaughtPokemon;
    private final PokemonRepository pokemonRepository;

    public PokemonController(PopulateDbWithPokeData populateDbWithPokeData, ImportCaughtPokemon importCaughtPokemon, PokemonRepository pokemonRepository) {
        this.populateDbWithPokeData = populateDbWithPokeData;
        this.importCaughtPokemon = importCaughtPokemon;
        this.pokemonRepository = pokemonRepository;
    }


    @PostMapping(value = "/initialise", params = {"start", "end"})
    public void initialisePokemonV2(@RequestParam int start, @RequestParam int end){
        log.info("Populating pokemon and evolution chains...");
        populateDbWithPokeData.populatePokemonV2Batch(start, end);
        log.info("Populated pokemon and evolution chains.");
    }

    @PostMapping(value = "/reinitialise-evolutions", params = {"start", "end"})
    public void reinitialiseEvolutions(@RequestParam int start, @RequestParam int end) {
        populateDbWithPokeData.initialiseEvolutionChains(start, end);
    }

    @PostMapping("/import-caught-pokemon")
    public void importCaughtPokemon(@RequestBody List<String> caughtPokemon) {
        importCaughtPokemon.importPokemon(caughtPokemon);
    }

    @GetMapping()
    public Iterable<Pokemon> getPokemon() {
        return pokemonRepository.findAll();
    }
}
