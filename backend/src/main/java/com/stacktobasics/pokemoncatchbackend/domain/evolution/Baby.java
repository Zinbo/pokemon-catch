package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class Baby {
    private int pokedexNumber;
    private String item;

    protected Baby(int pokedexNumber, String item) {
        this.pokedexNumber = pokedexNumber;
        this.item = item;
    }
}
