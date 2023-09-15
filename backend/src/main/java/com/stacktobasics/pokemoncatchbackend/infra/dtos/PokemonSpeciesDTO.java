package com.stacktobasics.pokemoncatchbackend.infra.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PokemonSpeciesDTO {
    public String name;
    public List<NameDTO> names;
    public SpeciesGenerationDTO generation;
    @JsonProperty("evolution_chain")
    public EvolutionChainDTO evolutionChain;
    @JsonProperty("egg_groups")
    public List<EggGroupDTO> eggGroups;
}
