package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.util.Pair;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
public class EvolutionCriteria {
    private List<TriggerCriterion> triggerCriteria;
    private String trigger;

    protected EvolutionCriteria(@NonNull List<Pair<String, String>> criteria, @NonNull String trigger) {
        this.triggerCriteria = criteria.stream().map(stringStringPair -> new TriggerCriterion(stringStringPair.getFirst(), stringStringPair.getSecond())).collect(Collectors.toList());
        this.trigger = trigger;
    }
}
