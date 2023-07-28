package com.stacktobasics.pokemoncatchbackend.domain.pokemon;


import lombok.Getter;

@Getter
public class Game {
    private final int id;
    private final String name;

    public Game(int id, String name) {
        this.id = id;
        this.name = name;
    }
}
