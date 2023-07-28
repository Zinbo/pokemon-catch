package com.stacktobasics.pokemoncatchbackend;

import com.stacktobasics.pokemoncatchbackend.domain.game.Game;
import com.stacktobasics.pokemoncatchbackend.domain.GameRepository;
import com.stacktobasics.pokemoncatchbackend.domain.pokemon.Pokemon;
import com.stacktobasics.pokemoncatchbackend.domain.PokemonRepository;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChain;
import com.stacktobasics.pokemoncatchbackend.domain.evolution.EvolutionChainRepository;
import com.stacktobasics.pokemoncatchbackend.infra.PokeApiClient;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.EvolutionNode;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.GameDTO;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.GenerationDTO;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.NamesDTO;
import com.stacktobasics.pokemoncatchbackend.infra.dtos.evolution.*;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

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
import java.util.stream.Collectors;

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
    private final Pattern pokedexNumberFromUrl = Pattern.compile("[^v](\\d+)");

    public PopulateDbWithPokeData(PokeApiClient client, GameRepository gameRepository,
                                  PokemonRepository pokemonRepository, EvolutionChainRepository evolutionChainRepository) {
        this.client = client;
        this.gameRepository = gameRepository;
        this.pokemonRepository = pokemonRepository;
        this.evolutionChainRepository = evolutionChainRepository;
    }


    public void populateGames() {
        List<GameDTO> games = client.getGames();
        games.stream()
            .filter(game -> !(UNUSED_GAMES.contains(game.id)))
            .forEach(game -> {
                String englishName = game.names.stream().filter(n -> n.language.name.equals("en")).findFirst()
                        .map(n -> n.name).orElseGet(() -> {
                            if(game.name.equals("lets-go-eevee")) return "Let's Go, Eevee!";
                            if(game.name.equals("lets-go-pikachu")) return "Let's Go, Pikachu!";
                            return StringUtils.capitalize(game.name);
                        });
                gameRepository.save(new Game(game.id, englishName));
            });
    }

    private void downloadAndSaveImage(int id, String descriptionImage, String folder) {
        String path = String.format("images/%s/%d.png", folder, id);
        if(Files.exists(Path.of(path))) return;
        try (InputStream in = new URL(descriptionImage).openStream()) {
            Files.copy(in, Paths.get(path));
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void populatePokemon() {
        List<Pokemon> pokemon = getPokemon();
        Map<Integer, Pokemon> pokemonById = pokemon.stream().collect(Collectors.toMap(Pokemon::getPokedexNumber, p -> p));
        List<EvolutionChain> evolutionChains = getEvolutionChains();
        evolutionChains.forEach(e -> e.getAllPokemonInChain().forEach(
                id -> pokemonById.computeIfPresent(id,
                        (integer, found) -> {
                            found.setEvolutionChainId(e.getId());
                            return found;
                        })
        ));
        pokemonRepository.saveAll(pokemon);
        evolutionChainRepository.saveAll(evolutionChains);
    }

    private List<Pokemon> getPokemon() {
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

        log.info("Getting pokemon...");
        List<Pokemon> pokemon = client.getPokemon().stream()
                .map(dto -> {
                    String listImage = dto.sprites.frontDefault;
                    String descriptionImage = dto.sprites.other.officialArtwork.frontDefault;
                    downloadAndSaveImage(dto.id, listImage, "list");
                    downloadAndSaveImage(dto.id, descriptionImage, "description");
                    return new Pokemon(dto.id, client.getEnglishName(dto.species.url), generations.get(dto.id));
                })
                .collect(Collectors.toList());
        log.info("Got pokemon.");

        log.info("building pokemon...");
        pokemon.forEach(p ->
        {
            log.info("Building pokemon: {}...", p.getPokedexNumber());
            client.getEncountersForPokemon(p.getPokedexNumber())
                    .forEach(dto ->
                            dto.versionDetails.forEach(v ->
                                    v.encounterDetails.forEach(ed -> {
                                        String locationArea = client.getLocationName(dto.locationArea.url);
                                        NamesDTO names = client.getNames(v.version.url);
                                        if(names == null) {
                                            System.out.println(names);
                                        }
                                        int gameId = names.id;

                                        String method = client.getEnglishName(ed.method.url);
                                        if(CollectionUtils.isEmpty(ed.conditionalValues)) {
                                            p.addEncounter(ed.chance, locationArea,
                                                    gameId, method, "none");
                                        }
                                        else ed.conditionalValues.forEach(cv ->
                                                p.addEncounter(ed.chance, locationArea,
                                                        gameId, method, client.getEnglishName(cv.url)));

                                    })));
            log.info("Built pokemon: {}.", p.getPokedexNumber());
        });
        log.info("built pokemon.");
        return pokemon;
    }

    private List<EvolutionChain> getEvolutionChains() {
        List<PokemonEvolutionDTO> evolutionChains = client.getEvolutionChains();

        return evolutionChains.stream().map(dto -> {
            EvolutionChain ec = new EvolutionChain(dto.id);

            // set baby if exists
            ChainDTO chainDTO = dto.chain;
            NamedResourceDTO speciesNavigationDTO = chainDTO.species;
            int pokedexNumber = getPokedexNumberFromUrl(speciesNavigationDTO);
            if (chainDTO.isBaby) {
                ec.setBaby(pokedexNumber, Optional.ofNullable(dto.babyTriggerItemDTO)
                        .map(babyTriggerItemDTO -> client.getEnglishName(babyTriggerItemDTO.url))
                        .orElse(null));
            }

            if (!CollectionUtils.isEmpty(chainDTO.evolutionDetails)) {
                // It looks like all evolution details on the top level chain are empty
                // throw an exception if not so I can change the logic
                throw new InternalException("evolution details were not empty for pokemon " + pokedexNumber);
            }

            List<EvolvesToDTO> evolvesTo = chainDTO.evolvesTo;
            Stack<EvolutionNode> stack = new Stack<>();
            evolvesTo.stream().map(e -> new EvolutionNode(e, pokedexNumber)).forEach(stack::add);
            while (!stack.isEmpty()) {
                EvolutionNode pop = stack.pop();
                EvolvesToDTO evolvesToDTO = pop.getEvolvesToDTO();
                int to = getPokedexNumberFromUrl(evolvesToDTO.species);
                evolvesToDTO.evolutionDetails.forEach(ed -> {
                    List<Pair<String, String>> criteria = getCriteria(ed);
                    String trigger = client.getEnglishName(ed.trigger.url);
                    ec.addEvolution(pop.getFrom(), to, criteria, trigger);
                });
                evolvesToDTO.evolvesTo.stream().map(e -> new EvolutionNode(e, to)).forEach(stack::add);
            }
            return ec;
        }).collect(Collectors.toList());
    }

    private List<Pair<String, String>> getCriteria(@NonNull EvolutionDetailsDTO ed) {
        List<Pair<String, String>> criteria = new ArrayList<>();
        Integer gender = ed.gender;
        if(gender != null) {
            if(gender == FEMALE) criteria.add(Pair.of("Gender", "Female"));
            else if(gender == MALE) criteria.add(Pair.of("Gender", "Male"));
            else throw new InternalException("Gender value not expected, got: " + gender);
        }
        if(ed.heldItem != null) criteria.add(Pair.of("Held item", client.getEnglishName(ed.heldItem.url)));
        if(ed.item != null) criteria.add(Pair.of("Item to use", client.getEnglishName(ed.item.url)));
        if(ed.knownMove != null) criteria.add(Pair.of("Known move", client.getEnglishName(ed.knownMove.url)));
        if(ed.knownMoveType != null) criteria.add(Pair.of("Known move type", client.getEnglishName(ed.knownMoveType.url)));
        if(ed.location != null) criteria.add(Pair.of("Location", client.getEnglishName(ed.location.url)));
        if(ed.minAffection != null) criteria.add(Pair.of("Min affection", String.valueOf(ed.minAffection)));
        if(ed.minBeauty != null) criteria.add(Pair.of("Min beauty", String.valueOf(ed.minBeauty)));
        if(ed.minHappiness != null) criteria.add(Pair.of("Min happiness", String.valueOf(ed.minHappiness)));
        if(ed.minLevel != null) criteria.add(Pair.of("Min level", String.valueOf(ed.minLevel)));
        if(BooleanUtils.isTrue(ed.needsOverworldRain)) criteria.add(Pair.of("Needs overworld rain", "true"));
        if(ed.partySpecies != null) criteria.add(Pair.of("Party species", client.getEnglishName(ed.partySpecies.url)));
        if(ed.partyType != null) criteria.add(Pair.of("Party type", client.getEnglishName(ed.partyType.url)));
        Integer relativePhysicalStats = ed.relativePhysicalStats;
        if(relativePhysicalStats != null) {
           if(relativePhysicalStats == GREATER_ATTACK) criteria.add(Pair.of("Relative physical stats", "greater attack"));
           if(relativePhysicalStats == SAME_ATTACK_AND_DEFENSE) criteria.add(Pair.of("Relative physical stats", "same attack and defense"));
            if(relativePhysicalStats == GREATER_DEFENSE) criteria.add(Pair.of("Relative physical stats", "greater defense"));
        }
        if(!StringUtils.isEmpty(ed.timeOfDay)) criteria.add(Pair.of("Time of day", ed.timeOfDay));
        if(ed.tradeSpecies != null) criteria.add(Pair.of("Trade species", client.getEnglishName(ed.tradeSpecies.url)));
        if(BooleanUtils.isTrue(ed.turnUpsideDown)) criteria.add(Pair.of("Turn console upside down", "true"));
        return criteria;
    }

    private int getPokedexNumberFromUrl(NamedResourceDTO dto) {
        if(dto == null) throw new InternalException("Species cannot be null");
        String url = dto.url;
        if(url == null) throw new InternalException("Species URL cannot be null");
        Matcher matcher = pokedexNumberFromUrl.matcher(url);
        // return last number
        if(!matcher.find()) throw new InternalException("Could not find matching pattern for number in url: " + url);
        String pokedexNumberAsString = matcher.group(1);
        try {
            return Integer.parseInt(pokedexNumberAsString);
        } catch(NumberFormatException e) {
            throw new InternalException("Could not parse " + pokedexNumberAsString + " as int");
        }
    }

}
