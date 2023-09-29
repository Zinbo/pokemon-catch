package com.stacktobasics.pokemoncatchbackend.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.stacktobasics.pokemoncatchbackend.PopulateDbWithPokeData;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolutionChainV2;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolutionChainV2Repository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("evolution-chains")
@Slf4j
public class EvolutionChainController {

    private final EvolutionChainV2Repository evolutionChainRepository;
    private final PopulateDbWithPokeData populateDbWithPokeData;

    public EvolutionChainController(EvolutionChainV2Repository evolutionChainRepository, PopulateDbWithPokeData populateDbWithPokeData) {
        this.evolutionChainRepository = evolutionChainRepository;
        this.populateDbWithPokeData = populateDbWithPokeData;
    }

    @GetMapping
    public Iterable<EvolutionChainV2> getChains() {
        return evolutionChainRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvolutionChainV2> getEvolutionChainById(@PathVariable int id) {
        return evolutionChainRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/reinitialise-evolutionsv2", params = {"start", "end"})
    public void reinitialiseEvolutionsV2(@RequestParam int start, @RequestParam int end) {
        populateDbWithPokeData.initialiseEvolutionChainsV2(start, end);
    }

    @PostMapping(value = "/reinitialise-pokemon-names", params = {"start", "end"})
    public void reinitialisePokemonNames(@RequestParam int start, @RequestParam int end) {
        populateDbWithPokeData.initialisePokemonNamesInEvoChains(start, end);
    }

    @PostMapping(value = "/add-alolan-chains")
    public void addAlolanChains() throws JsonProcessingException {
        populateDbWithPokeData.addAlolanChains();
    }
}
