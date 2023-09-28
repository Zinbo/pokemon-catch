package com.stacktobasics.pokemoncatchbackend.domain;

import com.stacktobasics.pokemoncatchbackend.domain.game.Game;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@Slf4j
@EqualsAndHashCode(of = "id")
@ToString
public class User {
    @Id
    String id;
    Set<Game> ownedGames = new HashSet<>();
    Set<OwnedPokemon> ownedPokemon = new HashSet<>();

    public void replaceGames(@NonNull List<String> gameNames, @NonNull GameRepository gameRepository) {
        List<Game> savedGames = gameRepository.findAll();
        ownedGames = gameNames.stream().flatMap(gameName -> {
            Optional<Game> matchedGame = savedGames.stream().filter(savedGame -> savedGame.getName().equals(gameName)).findFirst();
            return matchedGame.stream();
        }).collect(Collectors.toSet());
    }

    public void addPokemon(@NonNull Integer pokedexNumber, @NonNull PokemonRepository pokemonRepository) {
        if(ownedPokemon.stream().anyMatch(p -> p.pokedexNumber() == pokedexNumber)) return;
        Optional<Pokemon> pokemon = pokemonRepository.findById(pokedexNumber);
        pokemon.ifPresent(p -> ownedPokemon.add(new OwnedPokemon(pokedexNumber, Instant.now())));
    }

    public void removePokemon(@NonNull Integer pokedexNumber) {
        ownedPokemon.removeIf(p -> p.pokedexNumber() == pokedexNumber);
    }
}
