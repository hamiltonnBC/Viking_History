import { useEffect, useRef } from 'react';

export interface Figure {
  id: string;
  name: string;
  who: string;
  what: string;
  where: string;
  pages: string;
  aliases: string[]; // Names to match in text
}

export const FIGURES_DATA: Record<string, Figure[]> = {
  "Major Emigrants, Settlers, and Explorers": [
    {
      id: 'roric',
      name: "Roric (Rörik)",
      aliases: ["Roric", "Rörik"],
      who: "A Viking chieftain belonging to an important Danish family.",
      what: "He was a powerful Viking who initially plundered coastal areas, later occupied the wealthy trade town of Dorestad, and successfully forced Frankish emperors (Lothar and Louis the German) to accept him as a ruling vassal. He eventually converted to Christianity.",
      where: "He sailed from Denmark to Frisia (roughly modern-day Belgium and the Netherlands).",
      pages: "47, 48, 49"
    },
    {
      id: 'rurik',
      name: "Rurik (Riurik)",
      aliases: ["Rurik", "Riurik"],
      who: "A Scandinavian/Varangian chieftain.",
      what: "According to local chronicles, he was invited by indigenous tribes to rule over them and establish law, successfully founding the Rurikid dynasty which would rule Russia as grand princes and czars until the sixteenth century.",
      where: "He crossed the Baltic Sea and took up residence in Novgorod, Russia.",
      pages: "49, 50"
    },
    {
      id: 'erik-the-red',
      name: "Erik the Red",
      aliases: ["Erik the Red"],
      who: "A Scandinavian chieftain who originally lived in Iceland.",
      what: "After being exiled for committing murder, he led an expedition to establish the Eastern Settlement in Greenland, building his farm and chieftain's hall at Brattahlid.",
      where: "From Iceland to Greenland.",
      pages: "60, 61"
    },
    {
      id: 'leif-eriksson',
      name: "Leif Eriksson",
      aliases: ["Leif Eriksson"],
      who: "A Greenland Norse explorer, the son of Erik the Red.",
      what: "Around the year 1000, he sailed west from Greenland, passing Markland (the forested Labrador peninsula) to explore and temporarily settle Vinland (Newfoundland, North America), becoming the first known European to visit North America.",
      where: "From Greenland to Vinland (Newfoundland, North America).",
      pages: "61, 68"
    },
    {
      id: 'ottar',
      name: "Ottar",
      aliases: ["Ottar"],
      who: "A Scandinavian chieftain and merchant from the far north of Norway.",
      what: "He regularly navigated the long, protected coastal routes down the Norwegian coast, hunted walrus for their ivory and durable hides, and traveled to the court of King Alfred in England to share his knowledge.",
      where: "Down the coast of Norway to the Oslo Fjord, and onward to Wessex, England.",
      pages: "79, 84"
    },
    {
      id: 'ingvar',
      name: "Ingvar",
      aliases: ["Ingvar", "Ingvar the Far-Traveled"],
      who: "A Swedish Viking chieftain.",
      what: "In the early 11th century, he gathered a loyal following of warriors and led a rare, massive Viking expedition east and south down the rivers of Russia to the shores of the Caspian Sea (bordering Asia and Europe). The raid met strong resistance and mostly ended in disaster, resulting in 26 Swedish runestones memorializing the fallen.",
      where: "East and south down the rivers of Russia to the shores of the Caspian Sea.",
      pages: "82"
    }
  ],
  "Conquerors, Kings, and Warriors": [
    {
      id: 'cnut',
      name: "Cnut the Great",
      aliases: ["Cnut the Great", "Cnut"],
      who: "A Danish King.",
      what: "Following in the footsteps of his father Svein Forkbeard, he successfully conquered England in its entirety and demanded massive tribute (Danegeld) payments, becoming one of the most powerful rulers in northern Europe.",
      where: "From Denmark to England.",
      pages: "34, 41, 56, 57"
    },
    {
      id: 'guthrum',
      name: "Guthrum (Ethelstan)",
      aliases: ["Guthrum", "Ethelstan"],
      who: "A prominent Viking leader of the 'Great Heathen Army'.",
      what: "He conquered territory, assimilated into the local culture, and accepted Christian baptism with King Alfred the Great as his godfather (taking the Anglo-Saxon name Ethelstan).",
      where: "He invaded England and ruled East Anglia.",
      pages: "34, 52, 53"
    },
    {
      id: 'sitric',
      name: "Sitric and Sitric Silkenbeard",
      aliases: ["Sitric", "Sitric Silkenbeard"],
      who: "Sitric was a Viking descendant of the Norse Kings of Northumbria; Sitric Silkenbeard was his great-grandson.",
      what: "Sitric arrived in Ireland with a fleet in 917 and established a fortress on the Liffey River, founding the city of Dublin. Decades later, his descendant Sitric Silkenbeard ruled Dublin and fought the massive Battle of Clontarf in 1014 against the Irish high king Brian Boru, retaining power over Dublin until 1036.",
      where: "Ireland (Dublin).",
      pages: "54, 55, 56"
    },
    {
      id: 'ragnar',
      name: "Ragnar Hairy-Breeches (Loðbrók) & Ivar Boneless",
      aliases: ["Ragnar", "Loðbrók", "Ragnar Lothbrok", "Ragnar Hairy-Breeches", "Ivar Boneless"],
      who: "Legendary Viking warriors from Scandinavia.",
      what: "Ragnar is famed for attacking Paris in 845 and was written about extensively in later Icelandic sagas, which claim he was executed in Northumbria by King Ella in a pit of poisonous snakes. His son, Ivar Boneless, fought in York, England, where he defeated and killed King Ella in battle (which later storytellers wildly exaggerated into the 'blood eagle' torture myth).",
      where: "From Scandinavia to Paris and England.",
      pages: "34, 35, 37"
    }
  ],
  "Key Opponents and Observers": [
    {
      id: 'charlemagne',
      name: "Emperor Charlemagne",
      aliases: ["Charlemagne", "Emperor Charlemagne"],
      who: "The great King of the Franks and Emperor of the Carolingian Empire.",
      what: "He was a deeply violent ruler who engaged in almost constant warfare to extract tribute and booty from his neighbors to reward his followers. He committed mass atrocities, including ordering the decapitation of 4,500 Saxons in a single day, and once marched an army (with a pet elephant) to confront Vikings in Frisia.",
      where: "Campaigned from his palace in Aachen across Germany, Italy, Spain, and Hungary, and Frisia.",
      pages: "9, 41, 42, 43, 44, 71"
    },
    {
      id: 'byrhtnoth',
      name: "Ealdorman Byrhtnoth",
      aliases: ["Byrhtnoth", "Ealdorman Byrhtnoth"],
      who: "An Anglo-Saxon nobleman and warlord from England.",
      what: "He boldly refused to pay a tribute of gold rings to an invading Viking army and led the English defense at the Battle of Maldon in Essex (991), where he fought bravely with spear and sword before being wounded and hacked down by the Vikings.",
      where: "Essex, England.",
      pages: "27, 28, 29, 30, 40"
    },
    {
      id: 'ibn-fadlan',
      name: "Ahmad ibn Fadlan",
      aliases: ["Ahmad ibn Fadlan", "Ibn Fadlan"],
      who: "An Arab traveler and civil servant from Baghdad in the Arab Caliphate.",
      what: "In 921, he traveled to the town of Bulghar on the Volga River in modern-day Russia, where he closely observed the Rus merchants and wrote a detailed, famous account of a lavish, gruesome ship-cremation funeral for a Rus chieftain.",
      where: "From Baghdad to the town of Bulghar on the Volga River.",
      pages: "94, 95, 96"
    }
  ]
};

// Flat list of all alias mappings for the linkifier
export const FIGURE_LINKS = Object.values(FIGURES_DATA).flat().reduce((acc, fig) => {
  fig.aliases.forEach(alias => {
    acc[alias] = fig.id;
  });
  return acc;
}, {} as Record<string, string>);

interface ImportantFiguresProps {
  highlightId?: string | null;
}

export function ImportantFigures({ highlightId }: ImportantFiguresProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`figure-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightId]);

  return (
    <div className="important-figures" ref={scrollContainerRef}>
      <p className="figures-source-citation">
        Source: <em>The Age of the Vikings</em> by Anders Winroth
      </p>
      {Object.entries(FIGURES_DATA).map(([category, figures]) => (
        <section key={category} className="figures-category">
          <h2 className="figures-category-title">{category}</h2>
          <div className="figures-list">
            {figures.map(figure => (
              <div 
                key={figure.id} 
                id={`figure-${figure.id}`}
                className={`figure-card ${highlightId === figure.id ? 'highlighted' : ''}`}
              >
                <div className="figure-header">
                  <h3 className="figure-name">{figure.name}</h3>
                  <span className="figure-pages">pp. {figure.pages}</span>
                </div>
                <div className="figure-content">
                  <p className="figure-who"><strong>Who:</strong> {figure.who}</p>
                  <p className="figure-where"><strong>Where:</strong> {figure.where}</p>
                  <p className="figure-what"><strong>What:</strong> {figure.what}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
