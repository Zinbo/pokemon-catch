package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.NamedResourceDTO;

import java.util.List;

public class GenerationDTO {
    public int id;
    @JsonProperty("pokemon_species")
    public List<NamedResourceDTO> species;
}
