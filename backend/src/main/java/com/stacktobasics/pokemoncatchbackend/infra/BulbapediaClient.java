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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

    private static final Map<Integer, List<String>> GenerationsToGames = Map.of(
            1, List.of("Red", "Blue", "Yellow"),
            2, List.of("Gold", "Silver", "Crystal"),
            3, List.of("Ruby", "Sapphire", "Emerald", "FireRed", "LeafGreen"),
            4, List.of("Diamond", "Pearl", "Platinum", "HeartGold", "SoulSilver"),
            5, List.of("Black", "White", "Black 2", "White 2"),
            6, List.of("X", "Y", "Omega Ruby", "Alpha Sapphire"),
            7, List.of("Sun", "Moon", "Ultra Sun", "Ultra Moon", "Let's Go Pikachu", "Let's Go Eevee"),
            8, List.of("Sword", "Shield", "Expansion Pass", "Brilliant Diamond", "Shining Pearl", "Legends: Arceus"),
            9, List.of("Scarlet", "Violet", "Legends: Z-A", "Mega Dimension")
    );

    private static final List<String> IGNORED_ENCOUNTERS = List.of("Trade", "Time Capsule", "Pokémon HOME", "Wild Area News", "Global Link", "Poké Transfer", "Event", "Global Link Event", "Pokémon HOME Event", "Unobtainable");
    private static final List<String> IGNORED_ENCOUNTERS_STARTS_WITH = List.of("TradeVersion", "Evolve", "Friend Safari");

    private static final Map<String, String> DAY_ABBREVIATIONS = Map.of(
            "Mo", "Monday", "Tu", "Tuesday", "We", "Wednesday",
            "Th", "Thursday", "Fr", "Friday", "Sa", "Saturday", "Su", "Sunday"
    );

    private static final Set<String> GROUP_LEVEL_METHODS = Set.of(
            "Max Raid Battle", "Tera Raid Battle", "Dynamax Adventure"
    );

    private static final Pattern GIFT_FIRST_PARTNER = Pattern.compile(
            "^First partner Pokémon from .+? in (.+?)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern GIFT_RECEIVED_IF = Pattern.compile(
            "^Received from .+? in (.+?)\\s+if (.+)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern GIFT_RECEIVED_FROM = Pattern.compile(
            "^Received from .+? in (.+?)(?:\\s+after (.+))?$", Pattern.CASE_INSENSITIVE);

    private static final Pattern ISLAND_SCAN = Pattern.compile(
            "^(.+?)\\s*\\(Island Scan\\)(Mo|Tu|We|Th|Fr|Sa|Su)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern TRADE_PATTERN = Pattern.compile(
            "^Trade (.+?) on (.+?)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern PAREN_METHOD_SUFFIX = Pattern.compile(
            "^(.*?)\\s*\\(([^)]+)\\)\\s*$");

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

        List<Encounter> allEncounters = new ArrayList<>();
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
                    allEncounters.addAll(encounters);
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

        log.info("All encounter text found:");
        allEncounters.forEach(e -> log.info("[{}] {}: {}", e.getGame(), e.getPokemonName(), e.getCleanedUpEncounterText()));
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
                    .filter(a -> a.attr("title").endsWith("(Pokémon)"))
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

            // Split by <br> first, then by comma within each br-group.
            // This preserves group context so a trailing method like "(Max Raid Battle)"
            // on the last comma-part can be propagated to all parts in the same br-group.
            List<List<String[]>> brGroups = splitByBrThenComma(contentCell);

            for (String game : matchedGames) {
                for (List<String[]> group : brGroups) {
                    String groupMethod = extractGroupMethod(group);
                    List<String[]> strippedGroup = stripGroupMethod(group, groupMethod);

                    // Context-propagating clean texts scoped to this br-group
                    String[] cleanedTexts = calculateCleanEncounterTexts(strippedGroup);

                    for (int i = 0; i < strippedGroup.size(); i++) {
                        String encounterHtml = strippedGroup.get(i)[0].trim();
                        String encounterText = strippedGroup.get(i)[1].trim();
                        if (encounterText.isBlank()) continue;
                        if (IGNORED_ENCOUNTERS.contains(encounterText) || IGNORED_ENCOUNTERS_STARTS_WITH.stream().anyMatch(encounterText::startsWith)) continue;

                        ParsedDetails details = parseEncounterDetails(cleanedTexts[i]);
                        String finalMethod = details.method() != null ? details.method() : groupMethod;

                        Encounter encounter = new Encounter();
                        encounter.setId(UUID.randomUUID());
                        encounter.setPokedexNumber(entry.dexNumber());
                        encounter.setPokemonName(entry.name());
                        encounter.setGame(game);
                        encounter.setEncounterHtml(encounterHtml);
                        encounter.setEncounterText(encounterText);
                        encounter.setCleanedUpEncounterText(cleanedTexts[i]);
                        encounter.setLocation(details.location());
                        encounter.setConditions(details.conditions());
                        encounter.setMethod(finalMethod);
                        encounter.setCatchRate(details.catchRate());
                        encounters.add(encounter);
                    }
                }
            }
        }

        return encounters;
    }

    private static String[] calculateCleanEncounterTexts(List<String[]> parts) {
        String[] cleanedTexts = new String[parts.size()];
        String previousLocationType = null;
        for (int i = 0; i < parts.size(); i++) {
            cleanedTexts[i] = computeCleanedEncounterText(parts.get(i)[1].trim(), previousLocationType);
            String newType = extractLocationType(cleanedTexts[i]);
            if (newType != null) previousLocationType = newType;
        }
        return cleanedTexts;
    }

    private List<String> findMatchingGames(List<String> gameNames) {
        return gameNames.stream()
                .filter(GAMES::contains)
                .collect(Collectors.toList());
    }

    // Splits child nodes into br-separated groups, each group then comma-split into [html, text] pairs.
    private List<List<String[]>> splitByBrThenComma(Element element) {
        return splitNodesByBr(element).stream()
                .map(this::commaSplitNodes)
                .filter(group -> !group.isEmpty())
                .collect(Collectors.toList());
    }

    // Groups the child nodes of an element by <br> boundaries.
    private List<List<Node>> splitNodesByBr(Element element) {
        List<List<Node>> groups = new ArrayList<>();
        List<Node> current = new ArrayList<>();
        for (Node node : element.childNodes()) {
            if (node instanceof Element el && "br".equals(el.tagName())) {
                groups.add(current);
                current = new ArrayList<>();
            } else {
                current.add(node);
            }
        }
        groups.add(current);
        return groups;
    }

    // Comma-splits a list of nodes into [html, text] pairs.
    private List<String[]> commaSplitNodes(List<Node> nodes) {
        List<String[]> parts = new ArrayList<>();
        StringBuilder currentHtml = new StringBuilder();
        StringBuilder currentText = new StringBuilder();

        for (Node node : nodes) {
            if (node instanceof Element el) {
                currentHtml.append(el.outerHtml());
                currentText.append(el.text());
            } else if (node instanceof TextNode tn) {
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

    // If the last comma-part ends with a known parenthetical method like "(Max Raid Battle)",
    // returns that method name so it can be applied to all parts in the group.
    private static String extractGroupMethod(List<String[]> group) {
        if (group.isEmpty()) return null;
        String lastText = group.get(group.size() - 1)[1];
        Matcher m = PAREN_METHOD_SUFFIX.matcher(lastText.trim());
        if (m.matches() && GROUP_LEVEL_METHODS.contains(m.group(2))) {
            return m.group(2);
        }
        return null;
    }

    // Returns a copy of the group with the trailing parenthetical stripped from the last part.
    private static List<String[]> stripGroupMethod(List<String[]> group, String method) {
        if (method == null) return group;
        List<String[]> result = new ArrayList<>(group);
        String[] last = result.get(result.size() - 1);
        Matcher m = PAREN_METHOD_SUFFIX.matcher(last[1].trim());
        if (m.matches()) {
            String strippedText = m.group(1).trim();
            String strippedHtml = last[0].replace("(" + method + ")", "").trim();
            result.set(result.size() - 1, new String[]{strippedHtml, strippedText});
        }
        return result;
    }

    // Extracts structured encounter details from cleaned encounter text using pattern matching.
    // Returns unknown() for bare location text that requires a location-page visit to classify.
    private static ParsedDetails parseEncounterDetails(String cleanedText) {
        String text = cleanedText.trim();

        Matcher islandScan = ISLAND_SCAN.matcher(text);
        if (islandScan.matches()) {
            String day = DAY_ABBREVIATIONS.getOrDefault(islandScan.group(2), islandScan.group(2));
            return new ParsedDetails("Island Scan", islandScan.group(1).trim(), List.of(day), 100);
        }

        Matcher trade = TRADE_PATTERN.matcher(text);
        if (trade.matches()) {
            return new ParsedDetails("Trade", trade.group(2).trim(), List.of("Trade " + trade.group(1).trim()), 0);
        }

        Matcher giftIf = GIFT_RECEIVED_IF.matcher(text);
        if (giftIf.matches()) {
            return new ParsedDetails("Received as gift", giftIf.group(1).trim(), List.of(giftIf.group(2).trim()), 100);
        }

        Matcher giftAfter = GIFT_RECEIVED_FROM.matcher(text);
        if (giftAfter.matches()) {
            List<String> conditions = giftAfter.group(2) != null
                    ? List.of(giftAfter.group(2).trim())
                    : Collections.emptyList();
            return new ParsedDetails("Received as gift", giftAfter.group(1).trim(), conditions, 100);
        }

        Matcher firstPartner = GIFT_FIRST_PARTNER.matcher(text);
        if (firstPartner.matches()) {
            return new ParsedDetails("Received as gift", firstPartner.group(1).trim(), Collections.emptyList(), 100);
        }

        return ParsedDetails.unknown();
    }

    // Produces a clean single location name from raw encounter text.
    // previousLocationType carries the location prefix (e.g. "Route") forward so that bare
    // numbers like "26" following "Routes 22" resolve to "Route 26".
    private static String computeCleanedEncounterText(String rawText, String previousLocationType) {
        String cleaned = rawText.trim();

        // Strip leading "and " (e.g. " and 3" → "3")
        if (cleaned.toLowerCase().startsWith("and ")) {
            cleaned = cleaned.substring(4).trim();
        }

        // Singularize common location plurals
        cleaned = cleaned.replaceAll("\\bRoutes\\b", "Route");
        cleaned = cleaned.replaceAll("\\bCaves\\b", "Cave");
        cleaned = cleaned.replaceAll("\\bTowns\\b", "Town");
        cleaned = cleaned.replaceAll("\\bCities\\b", "City");

        // If only a bare number remains, prefix with the previous location type
        // (e.g. "26" after "Route 22" → "Route 26")
        if (cleaned.matches("\\d+") && previousLocationType != null) {
            cleaned = previousLocationType + " " + cleaned;
        }

        return cleaned;
    }

    // Extracts the location type prefix from a cleaned name so it can be passed as context.
    // "Route 22" → "Route", "Kanto Route 22" → "Kanto Route", "Safari Zone" → null
    private static String extractLocationType(String cleanedText) {
        Matcher matcher = Pattern.compile("^(.+?)\\s+\\d+$").matcher(cleanedText.trim());
        return matcher.find() ? matcher.group(1) : null;
    }

    private record PokemonEntry(int dexNumber, String name, String pageTitle) {}

    private record ParsedDetails(String method, String location, List<String> conditions, int catchRate) {
        static ParsedDetails unknown() {
            return new ParsedDetails(null, null, null, 0);
        }
    }
}
