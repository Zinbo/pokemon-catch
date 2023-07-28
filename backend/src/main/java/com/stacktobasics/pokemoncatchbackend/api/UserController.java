package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.domain.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("users")
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final PokemonRepository pokemonRepository;

    public UserController(UserRepository userRepository, GameRepository gameRepository, PokemonRepository pokemonRepository) {
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.pokemonRepository = pokemonRepository;
    }

    @PostMapping("/{id}/games")
    public ResponseEntity<User> saveGames(@PathVariable String id, @RequestBody List<String> games) {
        // TODO: Set up users properly
        log.info("Adding the games [{}] for user [{}]", games, id);
        if(userRepository.findAll().isEmpty()) userRepository.save(new User());

        User user = userRepository.findAll().get(0);
        user.replaceGames(games, gameRepository);
        log.info("User after replacing games: [{}]", user);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        log.info("Getting user {}", id);
        // TODO: Set up users properly
        if(userRepository.findAll().isEmpty()) userRepository.save(new User());
        List<User> users = userRepository.findAll();
        if(users.isEmpty()) return ResponseEntity.ok().build();
        return ResponseEntity.ok(users.get(0));
    }

    @PutMapping("/{userId}/pokemon/{pokedexNumber}")
    public ResponseEntity<User> savePokemon(@PathVariable String userId, @PathVariable Integer pokedexNumber) {
        // TODO: Set up users properly
        if(userRepository.findAll().isEmpty()) userRepository.save(new User());

        User user = userRepository.findAll().get(0);
        user.addPokemon(pokedexNumber, pokemonRepository);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{userId}/pokemon/{pokedexNumber}")
    public ResponseEntity<User> deletePokemon(@PathVariable String userId, @PathVariable Integer pokedexNumber) {
        // TODO: Set up users properly
        if(userRepository.findAll().isEmpty()) userRepository.save(new User());

        User user = userRepository.findAll().get(0);
        user.removePokemon(pokedexNumber, pokemonRepository);
        return ResponseEntity.ok(userRepository.save(user));
    }

}
