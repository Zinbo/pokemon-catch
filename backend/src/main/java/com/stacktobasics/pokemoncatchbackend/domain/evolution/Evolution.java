package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.data.util.Pair;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class Evolution {
    private int from;
    private int to;
    private List<EvolutionCriteria> waysToEvolve = new ArrayList<>();

    public Evolution(int from, int to, @NonNull List<Pair<String, String>> criteria, @NonNull String trigger) {
        this.from = from;
        this.to = to;
        EvolutionCriteria ec = new EvolutionCriteria(criteria, trigger);
        waysToEvolve.add(ec);
    }

    protected boolean matches(int from, int to) {
        return from == this.from && to == this.to;
    }

    protected void addNewWayToEvolve(@NonNull List<Pair<String, String>> criteria, @NonNull String trigger) {
        EvolutionCriteria ec = new EvolutionCriteria(criteria, trigger);
        waysToEvolve.add(ec);
    }
}
