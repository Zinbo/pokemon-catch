package com.stacktobasics.pokemoncatchbackend.domain.game;

import com.stacktobasics.pokemoncatchbackend.domain.AggregateRoot;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Game implements AggregateRoot {

    public static final List<Integer> UNUSED_GAMES = List.of(19, 20);

    @Id
    private int id;
    private String name;

    public Game(int id, @NonNull String name) {
        this.id = id;
        this.name = name;
    }
}
