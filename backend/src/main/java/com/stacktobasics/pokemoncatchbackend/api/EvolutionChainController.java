package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChain;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChainRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("evolution-chains")
@Slf4j
public class EvolutionChainController {

    private final EvolutionChainRepository evolutionChainRepository;

    public EvolutionChainController(EvolutionChainRepository evolutionChainRepository) {
        this.evolutionChainRepository = evolutionChainRepository;
    }

    @GetMapping
    public Iterable<EvolutionChain> getChains() {
        return evolutionChainRepository.findAll();
    }
}
