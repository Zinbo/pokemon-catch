package com.stacktobasics.pokemoncatchbackend;

import com.stacktobasics.pokemoncatchbackend.domain.OwnedPokemon;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.UserRepository;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ImportCaughtPokemon {

    private final UserRepository userRepository;
    private final PokemonRepository pokemonRepository;

    public ImportCaughtPokemon(UserRepository userRepository,
                               PokemonRepository pokemonRepository) {
        this.userRepository = userRepository;
        this.pokemonRepository = pokemonRepository;
    }

    public void importPokemon(List<String> caughtPokemon) {
        var user = userRepository.findAll().get(0);
        log.info("Found user with id {}", user.getId());
        var caughtPokemonById = caughtPokemon.stream().flatMap(pokemonName -> pokemonRepository.findByName(pokemonName).stream().map(Pokemon::getPokedexNumber)).toList();
        log.info("Found {} caught pokemon", caughtPokemonById);
        user.setOwnedPokemon(new HashSet<>(caughtPokemonById.stream().map(id -> new OwnedPokemon(id, Instant.now())).collect(Collectors.toSet())));
        userRepository.save(user);
    }
}
