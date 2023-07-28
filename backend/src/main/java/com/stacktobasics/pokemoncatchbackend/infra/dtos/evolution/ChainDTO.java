package com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ChainDTO {
    @JsonProperty("evolves_to")
    public List<EvolvesToDTO> evolvesTo;

    @JsonProperty("is_baby")
    public boolean isBaby;

    @JsonProperty("evolution_details")
    public List<EvolutionDetailsDTO> evolutionDetails;

    public NamedResourceDTO species;
}
