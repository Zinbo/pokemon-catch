package com.stacktobasics.pokemoncatchbackend;

import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.UserRepository;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
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
        var caughtPokemonById = caughtPokemon.stream().flatMap(pokemonName -> pokemonRepository.findByName(pokemonName).stream().map(Pokemon::getPokedexNumber)).toList();
        user.setOwnedPokemon(new HashSet<>(caughtPokemonById));
        userRepository.save(user);
    }
}
