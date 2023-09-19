package com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PokemonEvolutionDTO {
    public EvolvesToDTO chain;
    @JsonProperty("baby_trigger_item")
    public NamedResourceDTO babyTriggerItemDTO;
    public Integer id;
}
