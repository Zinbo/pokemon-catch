package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

public class PokemonDTO {
    public Integer id;
    public String name;
    public SpritesDTO sprites;
    public NamedResourceDTO species;
}
