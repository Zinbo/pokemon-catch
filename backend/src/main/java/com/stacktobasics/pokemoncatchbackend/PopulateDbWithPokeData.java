package com.stacktobasics.pokemoncatchbackend;

import com.stacktobasics.pokemoncatchbackend.domain.GameRepository;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.Baby;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChain;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChainRepository;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionCriteria;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolutionChainV2;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolutionChainV2Repository;
import com.stacktobasics.pokemoncatchbackend.domain.evolutionv2.EvolvesTo;
import com.stacktobasics.pokemoncatchbackend.domain.game.Game;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import com.stacktobasics.pokemoncatchbackend.infra.PokeApiClient;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.*;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.*;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.stacktobasics.pokemoncatchbackend.domain.game.Game.UNUSED_GAMES;

@Component
@Slf4j
public class PopulateDbWithPokeData {

    public static final int FEMALE = 1;
    public static final int MALE = 2;
    public static final int GREATER_ATTACK = 1;
    private static final int SAME_ATTACK_AND_DEFENSE = 0;
    private static final int GREATER_DEFENSE = -1;
    private final PokeApiClient client;
    private final GameRepository gameRepository;
    private final PokemonRepository pokemonRepository;
    private final EvolutionChainRepository evolutionChainRepository;
    private final EvolutionChainV2Repository evolutionChainV2Repository;
    private final Pattern idFromUrl = Pattern.compile("[^v](\\d+)");

    public PopulateDbWithPokeData(PokeApiClient client, GameRepository gameRepository,
                                  PokemonRepository pokemonRepository, EvolutionChainRepository evolutionChainRepository, EvolutionChainV2Repository evolutionChainV2Repository) {
        this.client = client;
        this.gameRepository = gameRepository;
        this.pokemonRepository = pokemonRepository;
        this.evolutionChainRepository = evolutionChainRepository;
        this.evolutionChainV2Repository = evolutionChainV2Repository;
    }


    public void populateGames() {
        List<GameDTO> games = client.getGames();
        games.stream()
                .filter(game -> !(UNUSED_GAMES.contains(game.id)))
                .forEach(game -> {
                    String englishName = game.names.stream().filter(n -> n.language.name.equals("en")).findFirst()
                            .map(n -> n.name).orElseGet(() -> {
                                if (game.name.equals("lets-go-eevee")) return "Let's Go, Eevee!";
                                if (game.name.equals("lets-go-pikachu")) return "Let's Go, Pikachu!";
                                return StringUtils.capitalize(game.name);
                            });
                    gameRepository.save(new Game(game.id, englishName));
                });
    }

    private void downloadAndSaveImage(int id, String descriptionImage, String folder) {
        String path = String.format("images/%s/%d.png", folder, id);
        if (Files.exists(Path.of(path))) return;
        try (InputStream in = new URL(descriptionImage).openStream()) {
            Files.copy(in, Paths.get(path));
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void populatePokemonV2Batch(int start, int end) {
        Map<Integer, Integer> generations = getGenerations();

        for (int i = start; i <= end; i++) {
            PokemonDTO dto = client.getPokemon(i);
            String listImage = dto.sprites.frontDefault;
            String descriptionImage = dto.sprites.other.officialArtwork.frontDefault;
            downloadAndSaveImage(dto.id, listImage, "list");
            downloadAndSaveImage(dto.id, descriptionImage, "description");

            var species = client.getPokemonSpecies(i);
            var name = species.names.stream().filter(n -> n.language.name.equals("en")).map(n -> n.name).findFirst().orElse(species.name);
            var matcher = idFromUrl.matcher(species.evolutionChain.url);
            if (!matcher.find())
                throw new InternalException("Could not find matching pattern for number in url: " + species.evolutionChain.url);
            var evolutionChainId = Integer.parseInt(matcher.group(1));

            var canBreed = Optional.ofNullable(species.eggGroups).filter(s -> !s.isEmpty()).map(s -> !"no-eggs".equals(s.get(0).name)).orElse(false);
            var pokemon = new Pokemon(dto.id, name, generations.get(dto.id), canBreed);
            pokemon.setEvolutionChainId(evolutionChainId);

            // add encounters
            client.getEncountersForPokemon(i)
                    .forEach(encounter ->
                            encounter.versionDetails.forEach(v ->
                                    v.encounterDetails.forEach(ed -> {
                                        String locationArea = client.getLocationName(encounter.locationArea.url);
                                        if (locationArea.toLowerCase().contains("unknown")) return;
                                        NamesDTO names = client.getNames(v.version.url);
                                        int gameId = names.id;

                                        String method = client.getEnglishName(ed.method.url);
                                        if (CollectionUtils.isEmpty(ed.conditionalValues)) {
                                            pokemon.addEncounter(ed.chance, locationArea,
                                                    gameId, method, List.of("none"));
                                        } else {
                                            var conditions = ed.conditionalValues.stream().map(c -> client.getEnglishName(c.url)).toList();
                                            pokemon.addEncounter(ed.chance, locationArea,
                                                    gameId, method, conditions);
                                        }

                                    })));

            log.info("Saving pokemon [{}]", i);
            pokemonRepository.save(pokemon);

            if (!evolutionChainRepository.existsById(evolutionChainId)) {
                log.info("Saving evolution chain [{}]", evolutionChainId);
                var evolutionDTO = client.getEvolutionChain(evolutionChainId);
                var evolutionChain = getEvolutionChain(evolutionDTO);
                evolutionChainRepository.save(evolutionChain);
            }
        }
    }

    public void initialiseEvolutionChains(int start, int end) {
        for (int i = start; i <= end; i++) {

            try {
                log.info("Saving evolution chain [{}]", i);
                var evolutionDTO = client.getEvolutionChain(i);
                var evolutionChain = getEvolutionChain(evolutionDTO);
                evolutionChainRepository.save(evolutionChain);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() != 404) throw e;
            }
        }
        log.info("Finished saving all evolution chains");
    }

    public void initialiseEvolutionChainsV2(int start, int end) {
        for (int i = start; i <= end; i++) {

            try {
                log.info("Saving evolution chain [{}]", i);
                var evolutionDTO = client.getEvolutionChain(i);
                var chain = getEvolutionChainV2(evolutionDTO);
                evolutionChainV2Repository.save(chain);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode().value() != 404) throw e;
            }
        }
        log.info("Finished saving all evolution chains");
    }

    private Map<Integer, Integer> getGenerations() {
        Map<Integer, Integer> generations = new HashMap<>();
        log.info("Getting generations...");
        List<GenerationDTO> generationDTOs = client.getGenerations();
        log.info("Got generations.");
        generationDTOs.forEach(generationDTO -> {
            int generationNo = generationDTO.id;
            generationDTO.species.stream()
                    .map(this::getPokedexNumberFromUrl)
                    .forEach(pokemonNo -> {
                        if (generations.containsKey(pokemonNo))
                            throw new InternalException("Generations map already contained pokemon no: " + pokemonNo);
                        generations.put(pokemonNo, generationNo);
                    });
        });
        return generations;
    }

    private EvolutionChain getEvolutionChain(PokemonEvolutionDTO dto) {
        EvolutionChain ec = new EvolutionChain(dto.id);

        // set baby if exists
        EvolvesToDTO EvolvesToDTO = dto.chain;
        NamedResourceDTO speciesNavigationDTO = EvolvesToDTO.species;
        int pokedexNumber = getPokedexNumberFromUrl(speciesNavigationDTO);
        if (EvolvesToDTO.isBaby) {
            ec.setBaby(pokedexNumber, Optional.ofNullable(dto.babyTriggerItemDTO)
                    .map(babyTriggerItemDTO -> client.getEnglishName(babyTriggerItemDTO.url))
                    .orElse(null));
        }

        if (!CollectionUtils.isEmpty(EvolvesToDTO.evolutionDetails)) {
            // It looks like all evolution details on the top level chain are empty
            // throw an exception if not so I can change the logic
            throw new InternalException("evolution details were not empty for pokemon " + pokedexNumber);
        }

        List<EvolvesToDTO> evolvesTo = EvolvesToDTO.evolvesTo;
        Queue<EvolutionNode> stack = new ArrayDeque<>();
        evolvesTo.stream().map(e -> new EvolutionNode(e, pokedexNumber)).forEach(stack::add);
        while (!stack.isEmpty()) {
            EvolutionNode curr = stack.remove();
            EvolvesToDTO evolvesToDTO = curr.getEvolvesToDTO();
            int to = getPokedexNumberFromUrl(evolvesToDTO.species);
            evolvesToDTO.evolutionDetails.forEach(ed -> {
                List<Pair<String, String>> criteria = getCriteria(ed);
                String trigger = client.getEnglishName(ed.trigger.url);
                ec.addEvolution(curr.getFrom(), to, criteria, trigger);
            });
            evolvesToDTO.evolvesTo.stream().map(e -> new EvolutionNode(e, to)).forEach(stack::add);
        }
        return ec;
    }

    private EvolutionChainV2 getEvolutionChainV2(PokemonEvolutionDTO dto) {
        var chain = new EvolutionChainV2();
        chain.setId(dto.id);

        // set baby if exists
        EvolvesToDTO evolvesToDTO = dto.chain;
        NamedResourceDTO speciesNavigationDTO = evolvesToDTO.species;
        int pokedexNumber = getPokedexNumberFromUrl(speciesNavigationDTO);
        if (evolvesToDTO.isBaby) {
            chain.setBaby(new Baby(pokedexNumber, Optional.ofNullable(dto.babyTriggerItemDTO)
                    .map(babyTriggerItemDTO -> client.getEnglishName(babyTriggerItemDTO.url))
                    .orElse(null)));
        }

        if (!CollectionUtils.isEmpty(evolvesToDTO.evolutionDetails)) {
            // It looks like all evolution details on the top level chain are empty
            // throw an exception if not so I can change the logic
            throw new InternalException("evolution details were not empty for pokemon " + pokedexNumber);
        }

        chain.setChain(toEvolvesTo(evolvesToDTO));
        return chain;
    }
    
    private EvolvesTo toEvolvesTo(EvolvesToDTO evolvesToDTO) {
        EvolvesTo evolvesTo = new EvolvesTo();
        evolvesTo.setWaysToEvolve(evolvesToDTO.evolutionDetails.stream().map(ed -> {
            List<Pair<String, String>> criteria = getCriteria(ed);
            String trigger = client.getEnglishName(ed.trigger.url);
            return new EvolutionCriteria(criteria, trigger);

        }).toList());
        evolvesTo.setPokedexNumber(getPokedexNumberFromUrl(evolvesToDTO.species));
        evolvesTo.setName(evolvesToDTO.species.name);

        evolvesTo.setEvolvesTo(evolvesToDTO.evolvesTo.stream().map(this::toEvolvesTo).toList());
        return evolvesTo;
    }

    private List<Pair<String, String>> getCriteria(@NonNull EvolutionDetailsDTO ed) {
        List<Pair<String, String>> criteria = new ArrayList<>();
        Integer gender = ed.gender;
        if (gender != null) {
            if (gender == FEMALE) criteria.add(Pair.of("Gender", "Female"));
            else if (gender == MALE) criteria.add(Pair.of("Gender", "Male"));
            else throw new InternalException("Gender value not expected, got: " + gender);
        }
        if (ed.heldItem != null) criteria.add(Pair.of("Held item", client.getEnglishName(ed.heldItem.url)));
        if (ed.item != null) criteria.add(Pair.of("Item to use", client.getEnglishName(ed.item.url)));
        if (ed.knownMove != null) criteria.add(Pair.of("Known move", client.getEnglishName(ed.knownMove.url)));
        if (ed.knownMoveType != null)
            criteria.add(Pair.of("Known move type", client.getEnglishName(ed.knownMoveType.url)));
        if (ed.location != null) criteria.add(Pair.of("Location", client.getEnglishName(ed.location.url)));
        if (ed.minAffection != null) criteria.add(Pair.of("Min affection", String.valueOf(ed.minAffection)));
        if (ed.minBeauty != null) criteria.add(Pair.of("Min beauty", String.valueOf(ed.minBeauty)));
        if (ed.minHappiness != null) criteria.add(Pair.of("Min happiness", String.valueOf(ed.minHappiness)));
        if (ed.minLevel != null) criteria.add(Pair.of("Min level", String.valueOf(ed.minLevel)));
        if (BooleanUtils.isTrue(ed.needsOverworldRain)) criteria.add(Pair.of("Needs overworld rain", "true"));
        if (ed.partySpecies != null) criteria.add(Pair.of("Party species", client.getEnglishName(ed.partySpecies.url)));
        if (ed.partyType != null) criteria.add(Pair.of("Party type", client.getEnglishName(ed.partyType.url)));
        Integer relativePhysicalStats = ed.relativePhysicalStats;
        if (relativePhysicalStats != null) {
            if (relativePhysicalStats == GREATER_ATTACK)
                criteria.add(Pair.of("Relative physical stats", "greater attack"));
            if (relativePhysicalStats == SAME_ATTACK_AND_DEFENSE)
                criteria.add(Pair.of("Relative physical stats", "same attack and defense"));
            if (relativePhysicalStats == GREATER_DEFENSE)
                criteria.add(Pair.of("Relative physical stats", "greater defense"));
        }
        if (!StringUtils.isEmpty(ed.timeOfDay)) criteria.add(Pair.of("Time of day", ed.timeOfDay));
        if (ed.tradeSpecies != null) criteria.add(Pair.of("Trade species", client.getEnglishName(ed.tradeSpecies.url)));
        if (BooleanUtils.isTrue(ed.turnUpsideDown)) criteria.add(Pair.of("Turn console upside down", "true"));
        return criteria;
    }

    private int getPokedexNumberFromUrl(NamedResourceDTO dto) {
        if (dto == null) throw new InternalException("Species cannot be null");
        String url = dto.url;
        if (url == null) throw new InternalException("Species URL cannot be null");
        Matcher matcher = idFromUrl.matcher(url);
        // return last number
        if (!matcher.find()) throw new InternalException("Could not find matching pattern for number in url: " + url);
        String pokedexNumberAsString = matcher.group(1);
        try {
            return Integer.parseInt(pokedexNumberAsString);
        } catch (NumberFormatException e) {
            throw new InternalException("Could not parse " + pokedexNumberAsString + " as int");
        }
    }

}
