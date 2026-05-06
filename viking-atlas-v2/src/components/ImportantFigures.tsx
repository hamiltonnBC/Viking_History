interface Figure {
  name: string;
  description: string;
  role: string;
  location: string;
  impact: string;
}

const FIGURES: Record<string, Figure[]> = {
  "Major Emigrants, Settlers, and Explorers": [
    {
      name: "Roric (Rörik)",
      role: "Viking chieftain from an important Danish family",
      location: "Denmark to Frisia (modern-day Belgium and Netherlands)",
      description: "A powerful Viking who initially plundered coastal areas, later occupied the wealthy trade town of Dorestad.",
      impact: "Successfully forced Frankish emperors to accept him as a ruling vassal. He eventually converted to Christianity."
    },
    {
      name: "Rurik (Riurik)",
      role: "Scandinavian/Varangian chieftain",
      location: "Baltic Sea to Novgorod, Russia",
      description: "Invited by indigenous tribes to rule over them and establish law.",
      impact: "Successfully founded the Rurikid dynasty which ruled Russia as grand princes and czars until the sixteenth century."
    },
    {
      name: "Erik the Red",
      role: "Scandinavian chieftain",
      location: "Iceland to Greenland",
      description: "Exiled from Iceland for committing murder, he led an expedition to establish the Eastern Settlement in Greenland.",
      impact: "Built his farm and chieftain's hall at Brattahlid and established the Norse presence in Greenland."
    },
    {
      name: "Leif Eriksson",
      role: "Greenland Norse explorer, son of Erik the Red",
      location: "Greenland to Vinland (Newfoundland, North America)",
      description: "Around the year 1000, he sailed west from Greenland, passing Markland (Labrador).",
      impact: "Became the first known European to visit North America, establishing a temporary settlement in Vinland."
    },
    {
      name: "Ottar",
      role: "Scandinavian chieftain and merchant",
      location: "North Norway to Wessex, England",
      description: "Regularly navigated long coastal routes, hunted walrus for ivory and hides.",
      impact: "Traveled to the court of King Alfred in England to share his knowledge of the north."
    },
    {
      name: "Ingvar",
      role: "Swedish Viking chieftain",
      location: "Sweden to the Caspian Sea",
      description: "Led a massive Viking expedition east and south down the rivers of Russia.",
      impact: "The raid mostly ended in disaster, resulting in 26 Swedish runestones memorializing the fallen."
    }
  ],
  "Conquerors, Kings, and Warriors": [
    {
      name: "Cnut the Great",
      role: "Danish King",
      location: "Denmark to England",
      description: "Following in the footsteps of his father Svein Forkbeard, he successfully conquered England in its entirety.",
      impact: "Demanded massive tribute (Danegeld) payments and became one of the most powerful rulers in northern Europe."
    },
    {
      name: "Guthrum (Ethelstan)",
      role: "Prominent Viking leader of the 'Great Heathen Army'",
      location: "England (East Anglia)",
      description: "Conquered territory and fought against King Alfred the Great.",
      impact: "Assimilated into local culture, accepted Christian baptism with Alfred as his godfather, taking the name Ethelstan."
    },
    {
      name: "Sitric and Sitric Silkenbeard",
      role: "Viking Kings of Dublin",
      location: "Ireland",
      description: "Sitric established a fortress on the Liffey River in 917, founding the city of Dublin.",
      impact: "His descendant Sitric Silkenbeard fought the Battle of Clontarf in 1014, retaining power over Dublin until 1036."
    },
    {
      name: "Ragnar Hairy-Breeches (Loðbrók) & Ivar Boneless",
      role: "Legendary Viking warriors",
      location: "Scandinavia to France and England",
      description: "Ragnar attacked Paris in 845; Ivar Boneless fought in York, England.",
      impact: "Their legendary exploits, often exaggerated in sagas, became central to Viking folklore and identity."
    }
  ],
  "Key Opponents and Observers": [
    {
      name: "Emperor Charlemagne",
      role: "King of the Franks and Emperor of the Carolingian Empire",
      location: "Aachen (Germany) across Europe",
      description: "A deeply violent ruler who engaged in almost constant warfare to extract tribute.",
      impact: "Committed mass atrocities against Saxons and once marched an army to confront Vikings in Frisia."
    },
    {
      name: "Ealdorman Byrhtnoth",
      role: "Anglo-Saxon nobleman and warlord",
      location: "Essex, England",
      description: "Boldly refused to pay tribute to an invading Viking army.",
      impact: "Led the English defense at the Battle of Maldon (991), where he fought bravely before being killed."
    },
    {
      name: "Ahmad ibn Fadlan",
      role: "Arab traveler and civil servant from Baghdad",
      location: "Baghdad to Bulghar (Volga River, Russia)",
      description: "Observed Rus merchants in 921 and wrote detailed accounts of their customs.",
      impact: "Recorded a famous, gruesome account of a ship-cremation funeral, providing invaluable insight into Viking rituals."
    }
  ]
};

export function ImportantFigures() {
  return (
    <div className="important-figures">
      {Object.entries(FIGURES).map(([category, figures]) => (
        <section key={category} className="figures-category">
          <h2 className="figures-category-title">{category}</h2>
          <div className="figures-list">
            {figures.map(figure => (
              <div key={figure.name} className="figure-card">
                <div className="figure-header">
                  <h3 className="figure-name">{figure.name}</h3>
                  <span className="figure-role">{figure.role}</span>
                </div>
                <div className="figure-meta">
                  <span className="figure-location">📍 {figure.location}</span>
                </div>
                <p className="figure-desc">{figure.description}</p>
                <p className="figure-impact"><strong>Impact:</strong> {figure.impact}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
