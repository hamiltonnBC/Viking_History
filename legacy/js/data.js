const START_YEAR = 750;
const END_YEAR = 1100;

const ERAS = [
  { min: 750, max: 792,  label: 'Pre-Viking Age', summary: 'The Age of Migrations and early sea-faring development.' },
  { min: 793, max: 829,  label: 'The Dawn of Raids', summary: 'England and Ireland become the first targets of Norse warriors.' },
  { min: 830, max: 869,  label: 'The Age of Settlement', summary: 'Viking longphorts and towns emerge across the British Isles.' },
  { min: 870, max: 909,  label: 'The Golden Age', summary: 'Consolidation of Norse kingdoms and expansion of eastern trade routes.' },
  { min: 910, max: 979,  label: 'The Northmen Kingdoms', summary: 'From the Duchy of Normandy to the Rus Principalities.' },
  { min: 980, max: 1030, label: 'The Furthest Reach', summary: 'Norse exploration reaches its peak in Greenland and North America.' },
  { min: 1031, max: 1100, label: 'The Twilight Age', summary: 'The Viking Age ends, leaving a lasting legacy in European culture.' },
];

const EVENTS = [
  {
    id: 'spot-norway',
    year: 750,
    coords: [10.2863, 59.3326], // Vestfold
    title: 'Norway — Land of Fjords',
    date: 'c. 750–800 AD',
    tag: 'Origins',
    body: 'Norway\'s rugged fjord landscape makes agriculture difficult, pushing its people to the sea. Norwegian Vikings primarily raid westward — targeting the British Isles, Ireland, and ultimately Iceland and the North Atlantic.<br><br>The Vestfold region near the Oslofjord becomes a major center of early Viking power. The famous Oseberg ship burial (c. 834) — discovered in 1904 — reveals the extraordinary craftsmanship and wealth of Viking Age Norway.',
    type: 'origin'
  },
  {
    id: 'spot-denmark',
    year: 750,
    coords: [9.5018, 56.2639],
    title: 'The Viking Homelands',
    date: 'c. 750–800 AD',
    tag: 'Origins',
    body: 'The Norse peoples — Danes, Norwegians, and Swedes — inhabit the coasts and fjords of Scandinavia. Population pressure, limited farmland, the tradition of inheritance by eldest sons, and a warrior culture drive younger men to seek fortune abroad.<br><br>Their technological advantage: the longship, a shallow-drafted, clinker-built vessel capable of both ocean crossings and navigating shallow rivers. They can beach directly on shore, enabling surprise raids with no harbor needed.',
    type: 'origin'
  },
  {
    id: 'spot-lindisfarne',
    year: 793,
    coords: [-1.8016, 55.6796],
    title: 'Raid on Lindisfarne',
    date: 'June 8, 793 AD',
    tag: 'Raid',
    body: 'The most famous raid of the Viking Age begins at the Holy Island of Lindisfarne off northeast England. Norse warriors strike the undefended monastery, killing monks and carrying off gold, silver, and captives. The scholar Alcuin of York writes in horror to King Æthelred, marking this as a sign of divine punishment.<br><br>This attack shocked Christian Europe and is traditionally considered the beginning of the Viking Age. The monastery had been one of the most sacred sites in Christendom, home to the Lindisfarne Gospels and the relics of St. Cuthbert.',
    type: 'raid',
    routes: ['route-england']
  },
  {
    id: 'spot-iona',
    year: 795,
    coords: [-6.4111, 56.3347],
    title: 'Raids on Iona & Irish Coast',
    date: '795–820 AD',
    tag: 'Raid',
    body: 'Viking raiders strike Iona, the sacred island monastery founded by St. Columba in 563 AD. The island is raided repeatedly in 795, 802, and 806 AD, when 68 monks are killed in what becomes known as the \'Martyrdom of the Community of Iona.\'<br><br>Irish coastal monasteries are targeted systematically. Their stone round towers — still standing today — were built as refuges from these raids, the monks climbing inside and pulling the ladders up behind them.',
    type: 'raid'
  },
  {
    id: 'spot-dublin',
    year: 841,
    coords: [-6.2603, 53.3498],
    title: 'Longphort at Dublin',
    date: '841 AD',
    tag: 'Settlement',
    body: 'Norse Vikings establish a longphort (a fortified ship camp) at the mouth of the River Liffey in Ireland. This settlement grows into Dyflinn — modern Dublin — one of the most important Viking trading towns in the North Atlantic.<br><br>The Vikings transform Ireland\'s economy, establishing the first true towns in a land of scattered rural settlements. Dublin becomes a major slave market and trading hub, connecting Ireland to the wider Viking world from Scandinavia to the Mediterranean.',
    type: 'settlement'
  },
  {
    id: 'spot-rus',
    year: 860,
    coords: [31.2742, 58.5256],
    title: 'The Varangian Route — Rus Vikings',
    date: 'c. 840–900 AD',
    tag: 'Trade',
    body: 'Swedish Vikings — called Varangians or Rus — navigate the great river systems of Eastern Europe, establishing trade routes from the Baltic to the Black Sea and Caspian Sea. They found fortified trading posts at Novgorod and Kiev, creating the nucleus of what would become Russia and Ukraine.<br><br>The name \'Rus\' itself may derive from a Finnish or Old Norse word. These warriors-traders bring furs, slaves, and amber south, returning with silver, silk, and spices from Byzantium and the Islamic world.',
    type: 'trade',
    routes: ['route-rus']
  },
  {
    id: 'spot-england',
    year: 865,
    coords: [-1.0815, 53.9591], // Danelaw/York
    title: 'The Great Heathen Army',
    date: '865–878 AD',
    tag: 'Conquest',
    body: 'A massive Danish force — the \'Great Heathen Army\' led by the sons of Ragnar Lothbrok including Ivar the Boneless and Halfdan — invades England with the aim of conquest rather than raiding.<br><br>The army systematically conquers Northumbria (867), East Anglia (869), and Mercia. Only Wessex under King Alfred holds out. The resulting Treaty of Wedmore (878) divides England, giving the Danes control of the \'Danelaw\' — the eastern and northern half of England where Danish law and settlement predominates.',
    type: 'conquest'
  },
  {
    id: 'spot-iceland',
    year: 874,
    coords: [-21.8174, 64.1265],
    title: 'Settlement of Iceland',
    date: 'c. 874 AD',
    tag: 'Settlement',
    body: 'Ingólfr Arnarson, a Norwegian chieftain, becomes the first permanent Norse settler in Iceland, establishing his homestead at a place he names Reykjavík — \'Smoky Bay\' — for its geothermal steam vents.<br><br>Over the following decades, Iceland fills with settlers — many fleeing the centralizing rule of Harald Fairhair who united Norway as its first king. By 930, Iceland\'s population is around 20,000, and they establish the Althing, one of the world\'s oldest parliaments.',
    type: 'settlement',
    routes: ['route-iceland']
  },
  {
    id: 'spot-byzantium',
    year: 907,
    coords: [28.9784, 41.0082],
    title: 'Miklagarðr — Constantinople',
    date: '860–1000 AD',
    tag: 'Trade / War',
    body: 'The Vikings call Constantinople \'Miklagarðr\' — the Great City. Rus Viking fleets attack the city in 860 and 907 AD, and though they cannot breach its walls, they negotiate highly favorable trade treaties with the Byzantine Empire.<br><br>The Varangian Guard, an elite unit of Norse warriors serving the Byzantine Emperor, becomes one of the most prestigious military forces in the medieval world. Harald Hardrada — the last great Viking king — served in this guard before attempting to conquer England in 1066.',
    type: 'trade',
    routes: ['route-byz']
  },
  {
    id: 'spot-normandy',
    year: 911,
    coords: [1.0999, 49.4432],
    title: 'Foundation of Normandy',
    date: '911 AD',
    tag: 'Settlement',
    body: 'After decades of Viking raids on the Frankish kingdom, including a famous siege of Paris in 885–886 AD, the Frankish King Charles the Simple grants lands at the mouth of the Seine River to the Norse chieftain Rollo.<br><br>Rollo is baptized, swears fealty to the Frankish king, and his followers settle the region that becomes Normandy — \'Land of the Northmen.\' His descendants would conquer England in 1066, creating a lasting legacy that shaped the modern English language and culture.',
    type: 'settlement',
    routes: ['route-france', 'route-med']
  },
  {
    id: 'spot-greenland',
    year: 985,
    coords: [-45.5167, 61.15],
    title: 'Erik the Red Settles Greenland',
    date: '985 AD',
    tag: 'Settlement',
    body: 'Erik the Red, exiled from Iceland for manslaughter, explores a land to the west and names it \'Greenland\' — a marketing ploy to attract settlers to its ice-covered shores. Despite the harsh climate, Norse settlers establish two colonies on the southwestern coast.<br><br>The Eastern Settlement survives until the 15th century. The Norse Greenlanders trade walrus ivory, polar bear furs, and live arctic animals to Europe. Their disappearance remains one of history\'s intriguing mysteries, possibly due to climate change, the Black Death, and Inuit competition.',
    type: 'settlement',
    routes: ['route-greenland']
  },
  {
    id: 'spot-vinland',
    year: 1000,
    coords: [-55.5342, 51.595],
    title: 'Vinland — The New World',
    date: 'c. 1000 AD',
    tag: 'Exploration',
    body: 'Leif Erikson, son of Erik the Red, leads an expedition westward from Greenland and reaches North America — nearly 500 years before Columbus. He names the land \'Vinland\' for the wild grapes found there.<br><br>Archaeological proof was found at L\'Anse aux Meadows in Newfoundland, Canada — the only confirmed Norse site in North America. The Norse made at least three voyages, encountering the indigenous people they called \'Skraelings.\' Persistent conflicts ended the settlement attempts, and the Norse never permanently colonized the Americas.',
    type: 'exploration',
    routes: ['route-newfoundland']
  },
  {
    id: 'spot-sicily',
    year: 1060,
    coords: [13.3615, 38.1157],
    title: 'Normans Conquer Sicily',
    date: '1060–1091 AD',
    tag: 'Conquest',
    body: 'The Normans — descendants of the Viking Rollo who settled in Normandy — extend their reach to southern Italy and Sicily. Robert Guiscard and his brother Roger I conquer Sicily from Arab rule over three decades of fighting.<br><br>The Norman Kingdom of Sicily becomes one of the most sophisticated states in medieval Europe, blending Norman, Arab, Byzantine, and Italian cultures. Its multilingual royal court issues documents in Latin, Arabic, and Greek — a remarkable testament to the cultural synthesis the Norse descendants achieved.',
    type: 'conquest'
  },
  {
    id: 'spot-hastings',
    year: 1066,
    coords: [0.5735, 50.8543],
    title: 'The End of the Viking Age',
    date: '1066 AD',
    tag: 'Battle',
    body: 'The Viking Age ends not with a whimper but a bang — two great battles in 1066 AD. At Stamford Bridge in September, King Harald Hardrada of Norway (the last great Viking king) invades England but is defeated and killed by the English King Harold Godwinson.<br><br>Just weeks later, Harold is himself killed at the Battle of Hastings by William the Conqueror — Duke of Normandy, a descendant of the Viking Rollo. The Norman conquest reshapes England permanently. The Viking Age is over, but its legacy lives on in language, law, and culture across Europe and the North Atlantic.',
    type: 'battle'
  },
];

const ROUTES = [
  { id: 'route-england', type: 'raid', points: [[9.5, 56.2], [-1.8, 55.6]] },
  { id: 'route-france', type: 'raid', points: [[9.5, 56.2], [1.1, 49.4]] },
  { id: 'route-iceland', type: 'exploration', points: [[10.2, 59.3], [-6.4, 56.3], [-21.8, 64.1]] },
  { id: 'route-greenland', type: 'exploration', points: [[-21.8, 64.1], [-45.5, 61.1]] },
  { id: 'route-newfoundland', type: 'exploration', points: [[-45.5, 61.1], [-55.5, 51.5]] },
  { id: 'route-rus', type: 'trade', points: [[10.2, 59.3], [31.2, 58.5]] },
  { id: 'route-byz', type: 'trade', points: [[31.2, 58.5], [28.9, 41.0]] },
  { id: 'route-med', type: 'raid', points: [[1.1, 49.4], [-5.6, 36.0], [13.3, 38.1]] },
];

if (typeof module !== 'undefined') {
  module.exports = { START_YEAR, END_YEAR, ERAS, EVENTS, ROUTES };
}
