package com.stacktobasics.pokemoncatchbackend.domain.pokemon;

import com.stacktobasics.pokemoncatchbackend.domain.AggregateRoot;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;

import java.util.List;

import static com.stacktobasics.pokemoncatchbackend.domain.game.Game.UNUSED_GAMES;

@Slf4j
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "pokedexNumber")
public class Pokemon implements AggregateRoot {
    @Id
    private Integer pokedexNumber;
    private String name;
    private int generation;
    private EncounterDetails encounterDetails = new EncounterDetails();
    private int evolutionChainId;
    private boolean canBreed;
    private List<Integer> types;

    public Pokemon(@NonNull Integer pokedexNumber, @NonNull String name, int generation, boolean canBreed, @NonNull List<Integer> types) {
        this.pokedexNumber = pokedexNumber;
        this.name = name;
        this.generation = generation;
        this.canBreed = canBreed;
        this.types = types;
    }

    public void addEncounter(int catchRate, @NonNull String location, int gameId,
                             @NonNull String method, @NonNull List<String> conditions) {
         if(UNUSED_GAMES.contains(gameId)) return;
         encounterDetails.addEncounter(catchRate, location, gameId, method, conditions);
    }
}
