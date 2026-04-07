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

    public EvolutionChainController(EvolutionChainV2Repository evolutionChainRepository) {
        this.evolutionChainRepository = evolutionChainRepository;
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
}
