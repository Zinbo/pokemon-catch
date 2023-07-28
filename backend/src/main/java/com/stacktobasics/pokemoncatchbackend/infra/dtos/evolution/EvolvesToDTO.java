package com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class EvolvesToDTO {
    @JsonProperty("evolution_details")
    public List<EvolutionDetailsDTO> evolutionDetails;
    @JsonProperty("is_baby")
    public boolean isBaby;
    public NamedResourceDTO species;
    @JsonProperty("evolves_to")
    public List<EvolvesToDTO> evolvesTo;
}
