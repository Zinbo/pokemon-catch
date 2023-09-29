package com.stacktobasics.pokemoncatchbackend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolutionChainV2Repository;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.Comparator;
import java.util.stream.Collectors;

@Component
public class AdminTools {

    private final PokemonRepository pokemonRepository;
    private final ObjectMapper objectMapper;

    private final EvolutionChainV2Repository evolutionChainV2Repository;

    public AdminTools(PokemonRepository pokemonRepository, ObjectMapper objectMapper, EvolutionChainV2Repository evolutionChainV2Repository) {
        this.pokemonRepository = pokemonRepository;
        this.objectMapper = objectMapper;
        this.evolutionChainV2Repository = evolutionChainV2Repository;
    }

    public void savePokemonFiles() throws IOException {
        var allPokemon = pokemonRepository.findAll();
        allPokemon.sort(Comparator.comparingInt(Pokemon::getPokedexNumber));
        objectMapper.writeValue(new File("files/allPokemon.json"), allPokemon);
    }

    public void saveIndividualPokemonFiles() throws IOException {
        var allPokemon = pokemonRepository.findAll();
        for (Pokemon p : allPokemon) {
            objectMapper.writeValue(new File("files/pokemon/" + p.getPokedexNumber() + ".json"), p);
        }
    }

    public void saveNameToIdMap() throws IOException {
        var allPokemon = pokemonRepository.findAll();
        var nameToId = allPokemon.stream().collect(Collectors.toMap(Pokemon::getName, Pokemon::getPokedexNumber));
        objectMapper.writeValue(new File("files/pokemonNameToId.json"), nameToId);
    }

    public void saveEvolutionChains() throws IOException {
        var chains = evolutionChainV2Repository.findAll();
        objectMapper.writeValue(new File("files/evolutionChains.json"), chains);
    }
}
