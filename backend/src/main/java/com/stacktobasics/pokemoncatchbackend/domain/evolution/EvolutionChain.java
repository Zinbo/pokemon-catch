package com.stacktobasics.pokemoncatchbackend.domain.evolution;

import com.stacktobasics.pokemoncatchbackend.InternalException;
import com.stacktobasics.pokemoncatchbackend.domain.AggregateRoot;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.util.Pair;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class EvolutionChain implements AggregateRoot {
    @Id
    private int id;
    private Baby baby;
    private List<Evolution> evolutions = new ArrayList<>();
    private Set<Integer> allPokemonInChain = new HashSet<>();

    public EvolutionChain(int id) {
        this.id = id;
    }

    public void setBaby(Integer pokedexNumber, String item) {
        //TODO: need to check item is valid
        if(baby != null) throw new InternalException("Baby pokemon has already been set");
        baby = new Baby(pokedexNumber, item);
        allPokemonInChain.add(pokedexNumber);
    }

    public void addEvolution(int from, int to, List<Pair<String, String>> criteria, String trigger) {
        // TODO: check fields exist
        Optional<Evolution> existingEvolution = getExistingEvolution(from, to);
        existingEvolution.ifPresentOrElse(
                evolution -> evolution.addNewWayToEvolve(criteria, trigger),
                () -> {
                    evolutions.add(new Evolution(from, to, criteria, trigger));
                    allPokemonInChain.add(from);
                    allPokemonInChain.add(to);
                });
    }

    private Optional<Evolution> getExistingEvolution(int from, int to) {
        return evolutions.stream().filter(e -> e.matches(from, to)).findFirst();
    }

    public Set<Integer> getAllPokemonInChain() {
        return Set.copyOf(allPokemonInChain);
    }

    public int getId() {
        return id;
    }
}
