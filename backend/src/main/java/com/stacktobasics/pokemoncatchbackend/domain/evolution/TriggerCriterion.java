package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TriggerCriterion {
    private String type;
    private String value;

    public TriggerCriterion(String type, String value) {
        //TODO: validate these exist
        this.type = type;
        this.value = value;
    }
}
