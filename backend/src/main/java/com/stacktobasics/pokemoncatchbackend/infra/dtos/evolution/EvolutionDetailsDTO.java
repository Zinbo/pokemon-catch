package com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EvolutionDetailsDTO {
    public Integer gender;
    @JsonProperty("held_item")
    public NamedResourceDTO heldItem;
    public NamedResourceDTO item;
    @JsonProperty("known_move")
    public NamedResourceDTO knownMove;
    @JsonProperty("known_move_type")
    public NamedResourceDTO knownMoveType;
    public NamedResourceDTO location;
    @JsonProperty("min_affection")
    public Integer minAffection;
    @JsonProperty("min_beauty")
    public Integer minBeauty;
    @JsonProperty("min_happiness")
    public Integer minHappiness;
    @JsonProperty("min_level")
    public Integer minLevel;
    @JsonProperty("need_overworld_rain")
    public Boolean needsOverworldRain;
    @JsonProperty("party_species")
    public NamedResourceDTO partySpecies;
    @JsonProperty("party_type")
    public NamedResourceDTO partyType;
    @JsonProperty("relative_physical_stats")
    public Integer relativePhysicalStats;
    @JsonProperty("time_of_day")
    public String timeOfDay;
    @JsonProperty("trade_species")
    public NamedResourceDTO tradeSpecies;
    public TriggerDTO trigger;
    @JsonProperty("turn_upside_down")
    public Boolean turnUpsideDown;
}

// https://pokeapi.co/api/v2/evolution-chain/67/
// https://pokeapi.co/api/v2/evolution-chain/213/
// https://pokeapi.co/api/v2/evolution-chain/1/

