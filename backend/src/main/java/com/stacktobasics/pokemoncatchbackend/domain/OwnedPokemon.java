package com.stacktobasics.pokemoncatchbackend.domain;

import java.time.Instant;

public record OwnedPokemon(int pokedexNumber, Instant collectedDate) {
}
