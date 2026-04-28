package com.stacktobasics.pokemoncatchbackend.infra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stacktobasics.pokemoncatchbackend.domain.encounter.Encounter;
import com.stacktobasics.pokemoncatchbackend.domain.encounter.EncounterRepository;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class BulbapediaClient {

    private static final String ALL_POKEMON_PAGE = "List_of_Pokémon_by_National_Pokédex_number";
    private static final String BASE_URL = "https://bulbapedia.bulbagarden.net/w/api.php";

    private static final List<String> GAMES = List.of(
            "Red", "Blue", "Yellow", "Gold", "Silver", "Crystal",
            "Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen",
            "Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver",
            "Black", "White", "Black 2", "White 2",
            "X", "Y", "Omega Ruby", "Alpha Sapphire",
            "Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee",
            "Sword", "Shield", "Expansion Pass", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus",
            "Scarlet", "Violet", "Legends: Z-A", "Mega Dimension");

    private static final List<String> IGNORED_ENCOUNTERS = List.of("Trade", "Time Capsule", "Pokémon HOME", "Wild Area News", "Global Link", "Poké Transfer", "Event", "Global Link Event", "Pokémon HOME Event");
    private static final List<String> IGNORED_ENCOUNTERS_STARTS_WITH = List.of("TradeVersion");

    private static final int LIMIT = 1;

    private final EncounterRepository encounterRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public BulbapediaClient(EncounterRepository encounterRepository) {
        this.encounterRepository = encounterRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public void populateEncounters() {
        List<PokemonEntry> pokemonEntries;
        try {
            pokemonEntries = getPokemonList();
        } catch (Exception e) {
            log.error("Failed to get Pokemon list from Bulbapedia", e);
            return;
        }
        log.info("Found {} unique Pokemon pages to process", pokemonEntries.size());

        for (int i = 0; i < pokemonEntries.size(); i++) {
            if(i == LIMIT) {
                log.info("Stopping at LIMIT {}.", LIMIT);
                break;
            }
            var entry = pokemonEntries.get(i);
            try {
                log.info("Processing {} (#{})", entry.name(), entry.dexNumber());
                List<Encounter> encounters = getEncountersForPokemon(entry);
                if (!encounters.isEmpty()) {
                    encounterRepository.saveAll(encounters);
                    log.info("Saved {} encounters for {}", encounters.size(), entry.name());
                }
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while populating encounters, stopping");
                return;
            } catch (Exception e) {
                log.error("Error processing {}: {}", entry.name(), e.getMessage());
            }
        }
    }

    // Fetches the national dex list HTML and extracts (dexNumber, pokemonName, pageTitle) for each unique Pokemon page.
    private List<PokemonEntry> getPokemonList() throws Exception {
        String url = BASE_URL + "?action=parse&format=json&prop=text&page=" + ALL_POKEMON_PAGE;
        String json = restTemplate.getForObject(url, String.class);
        JsonNode root = objectMapper.readTree(json);
        String html = root.path("parse").path("text").path("*").asText();

        Document doc = Jsoup.parse(html);
        List<PokemonEntry> entries = new ArrayList<>();
        Set<String> seenPageTitles = new HashSet<>();

        for (Element row : doc.select("tr")) {
            // Dex number is in the first <td> with a monospace font style
            Element dexCell = row.selectFirst("td[style*='monospace']");
            if (dexCell == null) continue;

            String dexText = dexCell.text().trim(); // e.g. "#0001"
            if (!dexText.startsWith("#") || dexText.contains("?")) continue;
            int dexNumber = Integer.parseInt(dexText.substring(1));

            // The Pokemon name link has a title attribute ending with "(Pokémon)" —
            // use a Java string match with Unicode escape to avoid CSS selector encoding issues
            Element nameLink = row.select("a[href]").stream()
                    .filter(a -> a.attr("title").endsWith("(Pok\u00e9mon)"))
                    .findFirst().orElse(null);
            if (nameLink == null) continue;

            String pageTitle = nameLink.attr("title"); // e.g. "Bulbasaur (Pokémon)"
            String pokemonName = nameLink.text().trim();

            // Deduplicate — alternate forms (Alolan, Hisuian, etc.) share the same page
            if (seenPageTitles.contains(pageTitle)) continue;
            seenPageTitles.add(pageTitle);

            entries.add(new PokemonEntry(dexNumber, pokemonName, pageTitle));
        }

        return entries;
    }

    private List<Encounter> getEncountersForPokemon(PokemonEntry entry) throws Exception {
        Optional<String> sectionIndex = getGameLocationsSectionIndex(entry.pageTitle());
        if (sectionIndex.isEmpty()) {
            log.warn("No 'Game locations' section found for {}", entry.name());
            return Collections.emptyList();
        }

        String json = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "text")
                        .queryParam("section", sectionIndex.get())
                        .queryParam("page", entry.pageTitle())
                        .build().encode().toUri(),
                String.class);

        JsonNode root = objectMapper.readTree(json);
        String html = root.path("parse").path("text").path("*").asText();

        return parseGameLocationsHtml(html, entry);
    }

    // Fetches the sections list for a Pokemon page and returns the index of "Game locations".
    private Optional<String> getGameLocationsSectionIndex(String pageTitle) throws Exception {
        String json = restTemplate.getForObject(
                UriComponentsBuilder.fromHttpUrl(BASE_URL)
                        .queryParam("action", "parse")
                        .queryParam("format", "json")
                        .queryParam("prop", "sections")
                        .queryParam("page", pageTitle)
                        .build().encode().toUri(),
                String.class);

        JsonNode root = objectMapper.readTree(json);
        for (JsonNode section : root.path("parse").path("sections")) {
            if ("Game locations".equals(section.path("line").asText())) {
                return Optional.of(section.path("index").asText());
            }
        }
        return Optional.empty();
    }

    // Parses the game locations section HTML, producing one Encounter per game per br-separated location entry.
    private List<Encounter> parseGameLocationsHtml(String html, PokemonEntry entry) {
        List<Encounter> encounters = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        for (Element row : doc.select("tr")) {
            // Only process rows that have direct <th> children (game header rows)
            Elements ths = row.select("> th");
            if (ths.isEmpty()) continue;

            // Collect game names from the <th> elements, skipping generation/unavailable headers
            List<String> gameNames = new ArrayList<>();
            boolean skip = false;
            for (Element th : ths) {
                String text = th.text().trim();
                if (text.toLowerCase().contains("generation") ||
                        text.toLowerCase().contains("unavailable")) {
                    skip = true;
                    break;
                }
                if (!text.isEmpty()) {
                    gameNames.add(text);
                }
            }
            if (skip || gameNames.isEmpty()) continue;

            // The location data is in the single <td> sibling of the <th> elements.
            // The actual content lives in a nested td.roundy inside it.
            Element locationTd = row.selectFirst("> td");
            if (locationTd == null) continue;

            Element contentCell = locationTd.selectFirst("td.roundy");
            if (contentCell == null) contentCell = locationTd;

            String cellText = contentCell.text().trim();
            if (cellText.isEmpty() || cellText.equals("—") ||
                    cellText.toLowerCase().contains("unavailable")) continue;

            List<String> matchedGames = findMatchingGames(gameNames);
            if (matchedGames.isEmpty()) continue;

            // Each <br> or comma in the cell separates a distinct encounter entry
            List<String[]> parts = splitByBrOrComma(contentCell);

            for (String game : matchedGames) {
                for (String[] part : parts) {
                    String encounterHtml = part[0].trim();
                    String encounterText = part[1].trim();
                    if (encounterText.isBlank()) continue;
                    if(IGNORED_ENCOUNTERS.contains(encounterText) || IGNORED_ENCOUNTERS_STARTS_WITH.stream().anyMatch(encounterText::startsWith)) continue;

                    Encounter encounter = new Encounter();
                    encounter.setId(UUID.randomUUID());
                    encounter.setPokedexNumber(entry.dexNumber());
                    encounter.setPokemonName(entry.name());
                    encounter.setGame(game);
                    encounter.setEncounterHtml(encounterHtml);
                    encounter.setEncounterText(encounterText);
                    encounters.add(encounter);
                }
            }
        }

        return encounters;
    }

    // Try to match the game headers from a table row against the GAMES list.
    // First try joining them all (e.g. "Red" + "Blue" → "Red, Blue") for paired entries,
    // then fall back to matching each name individually.
    private List<String> findMatchingGames(List<String> gameNames) {
        return gameNames.stream()
                .filter(GAMES::contains)
                .collect(Collectors.toList());
    }

    // Splits the child nodes of an element at each <br> tag or comma in a text node.
    // Returns a list of [innerHtml, plainText] pairs for each segment.
    private List<String[]> splitByBrOrComma(Element element) {
        List<String[]> parts = new ArrayList<>();
        StringBuilder currentHtml = new StringBuilder();
        StringBuilder currentText = new StringBuilder();

        for (Node node : element.childNodes()) {
            if (node instanceof Element el) {
                if ("br".equals(el.tagName())) {
                    flushSegment(parts, currentHtml, currentText);
                    currentHtml = new StringBuilder();
                    currentText = new StringBuilder();
                } else {
                    currentHtml.append(el.outerHtml());
                    currentText.append(el.text());
                }
            } else if (node instanceof TextNode tn) {
                // Commas in text nodes between elements act as encounter separators
                String[] htmlParts = tn.outerHtml().split(",", -1);
                String[] textParts = tn.text().split(",", -1);
                for (int i = 0; i < htmlParts.length; i++) {
                    if (i > 0) {
                        flushSegment(parts, currentHtml, currentText);
                        currentHtml = new StringBuilder();
                        currentText = new StringBuilder();
                    }
                    currentHtml.append(htmlParts[i]);
                    currentText.append(i < textParts.length ? textParts[i] : "");
                }
            }
        }
        flushSegment(parts, currentHtml, currentText);

        return parts;
    }

    private void flushSegment(List<String[]> parts, StringBuilder html, StringBuilder text) {
        String t = text.toString().trim();
        if (!t.isBlank()) {
            parts.add(new String[]{html.toString().trim(), t});
        }
    }

    private record PokemonEntry(int dexNumber, String name, String pageTitle) {}
}
