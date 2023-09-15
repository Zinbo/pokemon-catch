import 'dotenv/config'
import {parse} from "node-html-parser";

const fs = require('fs');


function scrapePokemonNames() {
    const filePath = 'pokedex.html'; // Replace with the actual file path
    try {
        const html = fs.readFileSync(filePath, 'utf-8');

        const root = parse(html);

        const pokemonElements = root.querySelectorAll('.box-container .pokemon.captured .set-captured h4');
        console.log(`Found ${pokemonElements.length} pokemon`);

        return pokemonElements.map(p => p.text.trim());
    } catch (error) {
        console.error('An error occurred while scraping:', error);
        return [];
    }
}

async function scrape() {

    const pokemonNames = scrapePokemonNames();
    fs.writeFileSync("caught-pokemon.json", JSON.stringify(pokemonNames));
}

scrape();