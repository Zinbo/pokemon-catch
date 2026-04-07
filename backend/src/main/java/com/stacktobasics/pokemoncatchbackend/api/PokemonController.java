package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.ImportCaughtPokemon;
import com.stacktobasics.pokemoncatchbackend.PopulateDbWithPokeData;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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


    @PostMapping(value = "/initialise-all-data", params = {"start", "end"})
    public void initialisePokemonV2(@RequestParam int start, @RequestParam int end){
        log.info("Populating pokemon and evolution chains...");
        populateDbWithPokeData.populateAllData(start, end);
        log.info("Populated pokemon and evolution chains.");
    }

    @PostMapping("/import-caught-pokemon")
    public void importCaughtPokemon(@RequestBody List<String> caughtPokemon) {
        log.info("Importing {} caught pokemon...", caughtPokemon.size());
        importCaughtPokemon.importPokemon(caughtPokemon);
    }

    @GetMapping()
    public Iterable<Pokemon> getPokemon() {
        log.info("Getting pokemon...");
        List<Pokemon> pokemon = pokemonRepository.findAll();
        log.info("Found {} pokemon", pokemon.size());
        return pokemon;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pokemon> getPokemonById(@PathVariable int id) {
        log.info("Getting pokemon {}...", id);
        return pokemonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(params = {"name"})
    public ResponseEntity<Pokemon> getPokemonByName(@RequestParam String name) {
        log.info("Getting pokemon {}...", name);
        return pokemonRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
