package com.stacktobasics.pokemoncatchbackend.api;

import com.stacktobasics.pokemoncatchbackend.PopulateDbWithPokeData;
import com.stacktobasics.pokemoncatchbackend.domain.game.Game;
import com.stacktobasics.pokemoncatchbackend.domain.GameRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("games")
@Slf4j
public class GamesController {

    private final PopulateDbWithPokeData populateDbWithPokeData;
    private final GameRepository gameRepository;

    public GamesController(PopulateDbWithPokeData populateDbWithPokeData, GameRepository gameRepository) {
        this.populateDbWithPokeData = populateDbWithPokeData;
        this.gameRepository = gameRepository;
    }

    @PostMapping("/initialise")
    public void initialiseGames(){
        log.info("Populating games...");
        populateDbWithPokeData.populateGames();
        log.info("Populated games.");
    }

    @GetMapping
    public Iterable<Game> getGames() {
        return gameRepository.findAll();
    }

}
