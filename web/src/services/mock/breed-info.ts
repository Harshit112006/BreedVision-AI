/**
 * Reference facts for the breed library, keyed by breed slug.
 *
 * WHERE THESE COME FROM. Every `region` is the home state(s) listed on the
 * ICAR-NBAGR "Cattle Breeds of India" registry page. Every description and trait
 * was written from the pages listed in that breed's `sources`, read in October
 * 2026, and states only what those pages say. Where sources disagree, the text
 * says so; where a page was silent, the trait is simply absent (nothing is
 * filled in from memory).
 *
 * WHAT THEY ARE NOT. They are breed-guide and journal summaries, not the ICAR
 * breed monographs or breed descriptors themselves, and several rest on a single
 * secondary page (Wikipedia, a dairy-knowledge portal). Treat them as a first
 * reference and confirm with your state animal husbandry department or the
 * NBAGR record before relying on a detail. Full list and notes:
 * docs/breed-descriptions.md.
 *
 * Dataset labels that differ from the registry spelling:
 *   Bhelai    -> registry "Belahi"   (Haryana and Chandigarh)
 *   Gangatari -> registry "Gangatiri"
 *   Ghumsari  -> registry "Ghumusari"
 *   Khillari  -> registry "Khillar"
 *   Thutho    -> "Tho Tho" in some sources
 */

export interface BreedSource {
  label: string;
  url: string;
}

export interface BreedInfo {
  /** Home tract, from the NBAGR registry. */
  region: string;
  /** Two or three plain sentences. */
  description: string;
  /** Short facts shown as rows on the breed page. Only what a source states. */
  traits: { label: string; value: string }[];
  sources: BreedSource[];
  related?: string[];
}

export const BREED_SOURCE = "ICAR-NBAGR cattle breed registry (home tract); descriptions summarised from the sources listed on each breed";
export const BREED_SOURCE_URL = "https://nbagr.res.in/cattle-breed";

const TNAU: BreedSource = {
  label: "TNAU Agritech Portal: Indigenous cattle breeds",
  url: "https://agritech.tnau.ac.in/animal_husbandry/animhus_cattle%20_breed_indigenous.html",
};
const wiki = (title: string, path: string): BreedSource => ({
  label: `Wikipedia: ${title}`,
  url: `https://en.wikipedia.org/wiki/${path}`,
});

export const BREED_INFO: Record<string, BreedInfo> = {
  amritmahal: {
    region: "Karnataka",
    description:
      "A draught breed from the Hassan, Chikmagalur and Chitradurga districts of Karnataka, grey in colour with long horns ending in sharp black points.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Grey, from almost white to near black; muzzle, feet and tail usually black" },
      { label: "Horns", value: "Long, ending in sharp black points" },
    ],
    sources: [TNAU],
    related: ["hallikar", "khillari"],
  },
  bargur: {
    region: "Tamil Nadu",
    description:
      "A draught breed of the Bargur hills in Erode district, developed for uneven hilly terrain and known for speed and endurance in trotting. Well built, compact and medium in size.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Brown with white markings; some white or dark brown animals" },
      { label: "Build", value: "Well built, compact, medium size" },
    ],
    sources: [TNAU],
  },
  dangi: {
    region: "Maharashtra and Gujarat",
    description:
      "A draught breed from the hilly tracts of the Dangs (Nashik and Ahmednagar districts, Maharashtra), adapted to heavy rainfall: its skin secretes an oil that helps it tolerate heavy rain.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Build", value: "Medium to large" },
    ],
    sources: [wiki("Dangi cattle", "Dangi_cattle")],
    related: ["deoni"],
  },
  deoni: {
    region: "Maharashtra and Karnataka",
    description:
      "A dual-purpose breed whose bullocks are suited to heavy cultivation, usually spotted black and white. One guide places it in the Marathwada region of Maharashtra, western Andhra Pradesh and adjoining Karnataka.",
    traits: [
      { label: "Primary use", value: "Dual purpose" },
      { label: "Coat", value: "Usually spotted black and white" },
      { label: "Milk per lactation", value: "636-1,230 kg" },
    ],
    sources: [TNAU],
    related: ["dangi"],
  },
  gir: {
    region: "Gujarat",
    description:
      "A milch breed from the Gir forests of South Kathiawar, Gujarat. The coat is white with dark red or chocolate-brown patches, sometimes black or pure red, and the horns are peculiarly curved, giving a half-moon appearance.",
    traits: [
      { label: "Primary use", value: "Milch" },
      { label: "Coat", value: "White with dark red or chocolate-brown patches; sometimes black or pure red" },
      { label: "Horns", value: "Peculiarly curved, half-moon appearance" },
      { label: "Milk per lactation", value: "1,200-1,800 kg" },
    ],
    sources: [TNAU],
    related: ["kankrej", "sahiwal"],
  },
  hallikar: {
    region: "Karnataka",
    description:
      "A draught breed from the former princely state of Vijayanagar, now Karnataka, known for its trotting ability. Grey or dark grey, compact and muscular with long horns, a prominent forehead and strong legs.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Grey or dark grey" },
      { label: "Horns", value: "Long" },
      { label: "Build", value: "Compact, muscular, medium size; strong legs" },
    ],
    sources: [TNAU],
    related: ["amritmahal", "khillari"],
  },
  hariana: {
    region: "Haryana, Uttar Pradesh and Rajasthan",
    description:
      "A dual-purpose breed from the Rohtak, Hisar, Jind and Gurgaon districts of Haryana, also popular in Punjab, Uttar Pradesh and parts of Madhya Pradesh. It has small horns and its bullocks are powerful work animals.",
    traits: [
      { label: "Primary use", value: "Dual purpose" },
      { label: "Horns", value: "Small" },
      { label: "Milk per lactation", value: "600-800 kg" },
    ],
    sources: [TNAU],
    related: ["mewati", "rathi"],
  },
  "himachali-pahari": {
    region: "Himachal Pradesh",
    description:
      "A small to medium hill breed, mostly black or blackish brown, kept in the mountain districts of Himachal Pradesh for milk, draught work and manure. It suits mountain farming with cold climates and scarce fodder.",
    traits: [
      { label: "Primary use", value: "Milk, draught and manure" },
      { label: "Coat", value: "Black or blackish brown" },
      { label: "Horns", value: "Medium size, curving sideways and upward" },
      { label: "Build", value: "Compact cylindrical body, short legs, medium hump; adults 90-120 cm tall" },
      { label: "Milk per lactation", value: "350-650 kg (NBAGR); another summary gives an average of 538 kg" },
    ],
    sources: [
      { label: "ICAR-NBAGR: Himachali Pahari cattle", url: "https://nbagr.icar.gov.in/?p=4065" },
      { label: "Dairy Knowledge Portal (NDDB): Himachali Pahari", url: "https://dairyknowledge.in/dkp/node/3254" },
    ],
  },
  kangayam: {
    region: "Tamil Nadu",
    description:
      "A draught breed from Kangayam, Dharapuram, Perundurai, Erode and Bhavani in Erode and Coimbatore districts. Calves are red at birth and turn grey by about six months; bulls are grey with a dark hump and quarters.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Red at birth, grey by about 6 months; cows grey or white; bulls grey with dark hump, fore and hind quarters" },
      { label: "Horns", value: "Spread apart, nearly straight with a slight backward curve" },
      { label: "Build", value: "Moderate size, compact body" },
    ],
    sources: [TNAU],
    related: ["pulikulam", "umblachery"],
  },
  kankrej: {
    region: "Gujarat and Rajasthan",
    description:
      "A dual-purpose breed from the south-east Rann of Kutch in Gujarat and adjoining Rajasthan (Barmer and Jodhpur). Silver-grey to iron-grey or steel black with lyre-shaped horns; the bullocks are fast, powerful draught animals.",
    traits: [
      { label: "Primary use", value: "Dual purpose (ploughing and carting)" },
      { label: "Coat", value: "Silver-grey to iron-grey or steel black" },
      { label: "Horns", value: "Lyre-shaped" },
      { label: "Milk per lactation", value: "About 1,400 kg" },
    ],
    sources: [TNAU],
    related: ["gir", "tharparkar"],
  },
  kenkatha: {
    region: "Uttar Pradesh and Madhya Pradesh",
    description:
      "A small, compact draught breed from Bundelkhand in Uttar Pradesh, along the Ken river and the Vindhyas hills of Madhya Pradesh. It survives harsh conditions and poor-quality forage.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Shades of grey and black; white is rare" },
      { label: "Build", value: "Small and compact" },
    ],
    sources: [wiki("Kenkatha cattle", "Kenkatha_cattle")],
  },
  khariar: {
    region: "Odisha",
    description:
      "A small, strongly built draught breed of the hilly Nuapada, Kalahandi and Balangir districts of Odisha, described as docile. It is the main source of draught power for resource-poor tribal farmers there.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Light brown to grey; hump, neck and parts of face and back dark" },
      { label: "Horns", value: "Small; sources differ on their direction (horizontal then upward and inward, or straight)" },
      { label: "Build", value: "Short, compact body; concave forehead, short head, long tail" },
    ],
    sources: [
      { label: "Odisha Livestock Resources Development Society: Khariar", url: "https://olrds.odisha.gov.in/en/khariar/" },
      { label: "Dairy Knowledge Portal (NDDB): Khariar", url: "https://dairyknowledge.in/dkp/node/1980" },
    ],
  },
  khillari: {
    region: "Maharashtra and Karnataka",
    description:
      "A draught breed from Maharashtra, grey-white in colour with long horns that turn forward; the bullocks are fast and powerful. Newborn calves are dusty red, fading within a couple of months.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Grey-white; newborns dusty red, fading in a couple of months" },
      { label: "Horns", value: "Long, turning forward; generally black, sometimes pinkish" },
    ],
    sources: [TNAU],
    related: ["hallikar", "amritmahal"],
  },
  "konkan-kapila": {
    region: "Maharashtra and Goa",
    description:
      "A small to medium, compact breed of the Konkan region, with a reddish-brown or black coat most often. Milk output is low, but the animals have good draught ability for hilly terrain and a hot, humid climate.",
    traits: [
      { label: "Coat", value: "Varies; reddish brown or black most common" },
      { label: "Horns", value: "Generally straight and small" },
      { label: "Build", value: "Small to medium, compact; straight face; small to medium hump" },
      { label: "Milk", value: "Low, about 2.25 kg a day" },
    ],
    sources: [{ label: "ICAR-NBAGR: Konkan Kapila cattle", url: "https://nbagr.icar.gov.in/?p=2379" }],
  },
  kosali: {
    region: "Chhattisgarh",
    description:
      "The first cattle breed registered from Chhattisgarh, found mainly in the central plain. The animals are small, usually red, with stumpy horns and low milk production.",
    traits: [
      { label: "Coat", value: "Mostly red, then white and black; muzzle, tail switch, eyelashes and hooves mostly black" },
      { label: "Horns", value: "Stumpy; ears horizontal" },
      { label: "Build", value: "Small body, hump, dewlap and udder" },
      { label: "Milk", value: "Poor production potential" },
    ],
    sources: [
      { label: "Indian Journal of Animal Sciences: Physical characteristics of Kosali cattle", url: "https://epubs.icar.org.in/index.php/IJAnS/article/view/85762" },
    ],
  },
  "krishna-valley": {
    region: "Karnataka",
    description:
      "A large, dual-purpose breed of the black-cotton-soil Krishna river watershed in Karnataka and bordering Maharashtra districts, used for slow ploughing. Grey-white, with males darker on the fore and hind quarters.",
    traits: [
      { label: "Primary use", value: "Dual purpose (slow ploughing)" },
      { label: "Coat", value: "Grey-white; darker fore and hind quarters in males; adult females more whitish" },
      { label: "Build", value: "Large, massive frame; deep, loosely built short body; tail almost reaches the ground" },
      { label: "Milk per lactation", value: "About 900 kg" },
    ],
    sources: [TNAU],
  },
  ladakhi: {
    region: "Jammu & Kashmir (Ladakh)",
    description:
      "A small, short-statured breed of Ladakh that tolerates extreme cold and low oxygen at altitude. Kept for milk (mainly made into butter and churpi), draught work and manure.",
    traits: [
      { label: "Primary use", value: "Milk, draught and manure" },
      { label: "Coat", value: "Black or brown" },
      { label: "Horns", value: "Short, curving upward" },
      { label: "Build", value: "Compact body, short legs; small bowl-shaped udder" },
      { label: "Milk", value: "About 2-5 kg a day, fat near 5%" },
    ],
    sources: [{ label: "ICAR-NBAGR: Ladakhi cattle", url: "https://nbagr.icar.gov.in/?p=2362" }],
  },
  lakhimi: {
    region: "Assam",
    description:
      "A small, docile dual-purpose breed found across Assam, brown and grey with relatively short legs. Milk yield is low but the milk is rich in fat.",
    traits: [
      { label: "Primary use", value: "Milk and draught" },
      { label: "Coat", value: "Brown and grey; muzzle and eyelids black" },
      { label: "Horns", value: "Straight" },
      { label: "Build", value: "Small, relatively short legs, medium hump, small bowl-shaped udder" },
      { label: "Milk per lactation", value: "About 359 kg, fat about 5.3% (one portal; not checked against the NBAGR descriptor)" },
    ],
    sources: [{ label: "Dairy Knowledge Portal (NDDB): Lakhimi", url: "https://dairyknowledge.in/dkp/node/3258" }],
  },
  "malnad-gidda": {
    region: "Karnataka",
    description:
      "A dwarf breed of the hilly, rainy, densely forested Malenadu region of the Western Ghats, about 90 cm at the withers, black to brown. It can be kept on forest and village grazing alone; its milk and urine are said to have medicinal value.",
    traits: [
      { label: "Coat", value: "Black to brown" },
      { label: "Build", value: "Short stature, about 90 cm at the withers" },
      { label: "Milk", value: "Up to 3-4 litres a day, averaging about 2 litres" },
    ],
    sources: [wiki("Malnad Gidda", "Malnad_Gidda")],
  },
  mewati: {
    region: "Rajasthan, Haryana and Uttar Pradesh",
    description:
      "A dual-purpose breed named after the Mewat region, almost always white with rare brown shades. It has good milking ability, and the bulls are valued for farm work and carting for their strength and endurance.",
    traits: [
      { label: "Primary use", value: "Dual purpose" },
      { label: "Coat", value: "Almost always white; brown shades are rare" },
    ],
    sources: [wiki("Mewati cattle", "Mewati_cattle")],
    related: ["hariana"],
  },
  nari: {
    region: "Rajasthan and Gujarat",
    description:
      "A dual-purpose breed kept in migratory herds in the Pali and Sirohi districts of Rajasthan (and Sabarkantha and Banaskantha in Gujarat). Compact, strong and active, with notably long horns, averaging 51.7 cm.",
    traits: [
      { label: "Primary use", value: "Dual purpose (milk and bullock power)" },
      { label: "Coat", value: "Cows generally white or grey; bulls white, dark grey or black" },
      { label: "Horns", value: "Long: average 51.68 cm, longer than Kankrej" },
      { label: "Milk", value: "Peak yield 3-8 kg a day" },
    ],
    sources: [
      { label: "NBAGR study: Physical features and management of migratory Nari cattle (Indian Journal of Animal Sciences)", url: "https://epubs.icar.org.in/index.php/IJAnS/article/download/115901/45113" },
      wiki("Indigenous cattle breeds of India", "Indigenous_cattle_breeds_of_India"),
    ],
  },
  nimari: {
    region: "Madhya Pradesh",
    description:
      "A draught breed of the Nimar region: the Narmada valley in Madhya Pradesh and the Jalgaon district of Maharashtra. Medium to large with long, straight, well-proportioned bodies and typically a red coat with white patches; the cows are only average milkers.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Typically red with white patches" },
      { label: "Build", value: "Medium to large, well proportioned" },
    ],
    sources: [wiki("Nimari cattle", "Nimari_cattle")],
  },
  ongole: {
    region: "Andhra Pradesh",
    description:
      "A large, muscular dual-purpose breed from the Ongole area of Guntur district, white or light grey with a well-developed hump. Used for heavy draught work and exported for developing beef cattle.",
    traits: [
      { label: "Primary use", value: "Dual purpose (heavy draught; exported for meat cattle development)" },
      { label: "Coat", value: "White or light grey" },
      { label: "Build", value: "Large and muscular; well-developed hump" },
      { label: "Milk per lactation", value: "Average about 1,000 kg" },
    ],
    sources: [TNAU],
    related: ["punganur"],
  },
  "poda-thirupu": {
    region: "Telangana",
    description:
      "A strong, compact draught breed of the hilly, forested Nallamala area of Nagarkurnool district, enduring in dry, hot conditions. It was recognised as Telangana's first indigenous cattle breed in 2021.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "White with brown patches, or red/brown with white patches" },
      { label: "Horns", value: "Straight; forehead convex with a central groove" },
    ],
    sources: [
      { label: "Journal of Livestock Biodiversity: Characterization of Poda Thurpu cattle", url: "https://epubs.icar.org.in/index.php/JLB/article/view/157763" },
      wiki("Poda Thurpu", "Poda_Thurpu"),
    ],
  },
  pulikulam: {
    region: "Tamil Nadu",
    description:
      "A small draught breed of the Cumbum valley in Madurai district, used for penning in the field and ploughing. Usually grey or dark grey with a well-developed hump and backward-curving horns.",
    traits: [
      { label: "Primary use", value: "Draught (penning, ploughing)" },
      { label: "Coat", value: "Usually grey or dark grey; reddish or brownish spots on muzzle, eyes, switch and back" },
      { label: "Horns", value: "Backward-curving, Mysore type" },
      { label: "Build", value: "Small; well-developed hump" },
    ],
    sources: [TNAU],
    related: ["kangayam", "umblachery"],
  },
  punganur: {
    region: "Andhra Pradesh",
    description:
      "A very small breed of the hilly areas of Chittoor district, reared up to about 1,500 m above sea level. Kept for draught power and milk; the milk averages about 5% fat.",
    traits: [
      { label: "Primary use", value: "Draught and milk" },
      { label: "Coat", value: "White, grey, brown or red; rarely black" },
      { label: "Horns", value: "Small and crescent-shaped" },
      { label: "Size", value: "Bulls about 107 cm and 240 kg; cows about 97 cm and 170 kg" },
      { label: "Milk", value: "Highly variable; average 546 kg over 263 days, fat about 5%" },
    ],
    sources: [wiki("Punganur cattle", "Punganur_cattle")],
    related: ["ongole"],
  },
  purnea: {
    region: "Bihar",
    description:
      "The smallest cattle of Bihar, from the Purnia, Araria, Katihar and Kishanganj districts. The bullocks are fast and used for light draught and farm work; the population is declining.",
    traits: [
      { label: "Primary use", value: "Draught (light carting and farm work)" },
      { label: "Coat", value: "Light to deep red, few greyish white; eyelid, muzzle and tail switch mostly black" },
      { label: "Horns", value: "Short, crescent-shaped, pointing forward" },
    ],
    sources: [
      { label: "Indian Journal of Animal Sciences: Molecular characterization, body parameters and management of Purnea cattle", url: "https://epubs.icar.org.in/index.php/IJAnS/article/view/29756" },
    ],
  },
  rathi: {
    region: "Rajasthan",
    description:
      "A dairy breed of the Thar Desert in Rajasthan (Bikaner, Ganganagar and Jaisalmer), usually brown with white patches. Females average about 327 kg and 115 cm tall.",
    traits: [
      { label: "Primary use", value: "Dairy" },
      { label: "Coat", value: "Usually brown with white patches" },
      { label: "Size", value: "Males about 386 kg, females about 327 kg; females 115 cm tall" },
      { label: "Milk", value: "About 1,530 kg over 309 days, fat 5.3%" },
    ],
    sources: [wiki("Rathi cattle", "Rathi_cattle")],
    related: ["hariana", "tharparkar", "sahiwal"],
  },
  "red-kandhari": {
    region: "Maharashtra",
    description:
      "A medium-sized, robust draught breed named for its deep red colour, from Latur, Kandhar (Nanded) and Parbhani in Marathwada, also found in North Karnataka. Widely used for heavy work.",
    traits: [
      { label: "Primary use", value: "Draught (heavy work)" },
      { label: "Coat", value: "Deep red" },
      { label: "Build", value: "Medium size, robust" },
    ],
    sources: [wiki("Red Kandhari cattle", "Red_Kandhari_cattle")],
  },
  "red-sindhi": {
    region: "Organized farms only (no home state in the registry)",
    description:
      "A milch breed that came from the Karachi and Hyderabad regions of undivided India and is now kept on organised farms in India. Red, from dark to light, sometimes with strips of white.",
    traits: [
      { label: "Primary use", value: "Milch" },
      { label: "Coat", value: "Red, dark to light, with strips of white" },
      { label: "Milk per lactation", value: "1,250-1,800 kg" },
    ],
    sources: [TNAU],
    related: ["sahiwal"],
  },
  sahiwal: {
    region: "Punjab and Rajasthan",
    description:
      "A milch breed from the Montgomery region of undivided India: reddish dun or pale red, sometimes flashed with white, with a heavy, symmetrical body and loose skin.",
    traits: [
      { label: "Primary use", value: "Milch" },
      { label: "Coat", value: "Reddish dun or pale red, sometimes flashed with white" },
      { label: "Build", value: "Heavy, symmetrical body with loose skin" },
      { label: "Milk per lactation", value: "1,400-2,500 kg" },
    ],
    sources: [TNAU],
    related: ["red-sindhi", "gir", "rathi"],
  },
  "shweta-kapila": {
    region: "Goa",
    description:
      "A short to medium, mostly fully white breed of North and South Goa, adapted to hot, humid conditions. Reared mainly for milk; farmers generally do not use it for ploughing.",
    traits: [
      { label: "Primary use", value: "Milk" },
      { label: "Coat", value: "Mostly fully white" },
      { label: "Horns", value: "Mostly straight, sometimes curving slightly up and out" },
      { label: "Milk per lactation", value: "About 510 kg, fat about 5.2%" },
    ],
    sources: [{ label: "Dairy Knowledge Portal (NDDB): Shweta Kapila", url: "https://dairyknowledge.in/dkp/node/3262" }],
  },
  tharparkar: {
    region: "Rajasthan",
    description:
      "A dual-purpose breed from the Tharparkar region and Rajasthan, white or light grey with lyre-shaped horns, medium in size and compact. The bullocks suit ploughing and cart work.",
    traits: [
      { label: "Primary use", value: "Dual purpose" },
      { label: "Coat", value: "White or light grey" },
      { label: "Horns", value: "Lyre-shaped" },
      { label: "Milk per lactation", value: "1,800-2,600 kg" },
    ],
    sources: [TNAU],
    related: ["kankrej", "rathi"],
  },
  umblachery: {
    region: "Tamil Nadu",
    description:
      "A sturdy draught breed of the Thanjavur, Thiruvarur and Nagapattinam districts, suited to wet ploughing. Calves are red or brown with white markings on face, limbs and tail, and white 'socks' below the hocks.",
    traits: [
      { label: "Primary use", value: "Draught (wet ploughing)" },
      { label: "Coat", value: "Calves red or brown with white markings; white socks below the hocks" },
      { label: "Horns", value: "Bullocks are dehorned" },
    ],
    sources: [TNAU],
    related: ["kangayam", "pulikulam"],
  },
  vechur: {
    region: "Kerala",
    description:
      "A very small breed named after the village of Vechoor in Kerala, about 124 cm long and 87 cm high, weighing around 130 kg. Valued for the milk it gives relative to the feed it needs.",
    traits: [
      { label: "Size", value: "Length about 124 cm, height about 87 cm, weight about 130 kg" },
      { label: "Milk", value: "Up to 3 litres a day; smaller fat globules, linked to easier digestion" },
    ],
    sources: [wiki("Vechur cattle", "Vechur_cattle")],
  },
  bachaur: {
    region: "Bihar",
    description:
      "A compact, small draught breed of the Mithila region of north Bihar (Madhubani, Darbhanga and Sitamarhi). Bulls are used for medium draught work; the cows give more milk than other Indian draught breeds.",
    traits: [
      { label: "Primary use", value: "Draught; cows noted for milk" },
      { label: "Build", value: "Compact and small, resembling Haryanvi cattle" },
    ],
    sources: [wiki("Bachaur cattle", "Bachaur_cattle")],
  },
  badri: {
    region: "Uttarakhand",
    description:
      "A hill breed of the Garhwal region, also called Pahadi, adapted to hilly terrain. It comes in several colours and is used mainly for milk and farm work.",
    traits: [
      { label: "Coat", value: "Black, brown, red, white or grey" },
      { label: "Horns", value: "Curve upward and inward" },
      { label: "Primary use", value: "Milk and farm work" },
    ],
    sources: [wiki("Badri (cattle)", "Badri_(cattle)")],
  },
  bhelai: {
    region: "Haryana and Chandigarh (registry name: Belahi)",
    description:
      "A medium-sized breed of the Haryana foothills, also used for draught work. Typically reddish-brown, grey or white with white on the face and legs, and sickle-shaped horns.",
    traits: [
      { label: "Coat", value: "Typically reddish-brown, grey or white; white on face and legs" },
      { label: "Horns", value: "Sickle-shaped" },
      { label: "Milk per lactation", value: "Average about 1,014 kg" },
    ],
    sources: [wiki("Belahi (cattle)", "Belahi_(cattle)")],
  },
  dagri: {
    region: "Gujarat",
    description:
      "A small hill breed reared by tribal communities in eastern Gujarat (mainly Dahod and Chhota Udaipur), used for draught work and adapted to hilly terrain. Predominantly white, with a black muzzle and small hump.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Predominantly white (males 95%, females 87%); muzzle mainly black" },
      { label: "Horns", value: "Curved, upward and outward; forehead straight" },
      { label: "Build", value: "Small hump and dewlap; adults about 102-107 cm at the withers" },
    ],
    sources: [
      { label: "Indian Journal of Animal Sciences 91(7), 2021: Phenotypic characterization of Dagri cattle of Gujarat", url: "https://epubs.icar.org.in/index.php/JLB/article/download/157839/56263/434183" },
    ],
  },
  gangatari: {
    region: "Uttar Pradesh and Bihar (registry name: Gangatiri)",
    description:
      "An important dual-purpose breed from the banks of the Ganga in eastern Uttar Pradesh and western Bihar, described as fairly good milk yielders.",
    traits: [{ label: "Primary use", value: "Dual purpose" }],
    sources: [wiki("Gangatiri cattle", "Gangatiri_cattle")],
  },
  gaolao: {
    region: "Maharashtra and Madhya Pradesh",
    description:
      "A dual-purpose zebu from the Wardha area of Maharashtra and adjoining Madhya Pradesh and Chhattisgarh, white or light grey and known for agility. Medium height, light build, narrow and long.",
    traits: [
      { label: "Primary use", value: "Dual purpose (draught and milk)" },
      { label: "Coat", value: "White or light grey" },
      { label: "Horns", value: "Short and stumpy; hump moderately developed" },
    ],
    sources: [wiki("Gaolao", "Gaolao")],
  },
  ghumsari: {
    region: "Odisha (registry name: Ghumusari)",
    description:
      "A small, heat-tolerant and disease-resistant breed of western Ganjam and adjoining Kandhamal in Odisha, uniformly white or grey. Milk productivity is low; the bullocks are very good draught animals. Its numbers are declining.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Uniformly white or grey" },
      { label: "Horns", value: "Curve upward and inward; flat, broad forehead with a dip between the eyes" },
      { label: "Size", value: "Bulls roughly 170-210 kg, cows 140-185 kg" },
      { label: "Milk", value: "Low; one state profile reports 450-650 kg per lactation, a study calls it low" },
    ],
    sources: [
      { label: "Odisha Livestock Resources Development Society: Ghumsari", url: "https://olrds.odisha.gov.in/en/ghumsari/" },
      { label: "Journal of Livestock Biodiversity: Characterization of Ghumusari cattle", url: "https://epubs.icar.org.in/index.php/JLB/article/view/157725" },
    ],
  },
  kherigarh: {
    region: "Uttar Pradesh",
    description:
      "A draught breed from the Lakhimpur Kheri district of Uttar Pradesh whose bulls are used for light draught work. Closely related to the Malwa (Malvi) breed.",
    traits: [{ label: "Primary use", value: "Draught (light)" }],
    sources: [wiki("Kherigarh cattle", "Kherigarh_cattle")],
  },
  malvi: {
    region: "Madhya Pradesh",
    description:
      "A draught breed of the Malwa tract, known for quick road transport. Short, deep and compact with a dished forehead; grey to almost black on neck, shoulders and hump, turning nearly white with age. Village cows are poor milkers.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Grey to almost black on neck, shoulders and hump; nearly white with age" },
      { label: "Build", value: "Short, deep, compact body; short broad head with a dished forehead" },
    ],
    sources: [{ label: "Oklahoma State University, Breeds of Livestock: Malvi cattle", url: "https://breeds.okstate.edu/cattle/malvi-cattle" }],
  },
  motu: {
    region: "Odisha, Chhattisgarh and Andhra Pradesh",
    description:
      "A small but strongly built draught breed of southern Malkangiri in Odisha and adjoining Chhattisgarh and Andhra Pradesh, reared by Koya tribals for ploughing and carting in hilly country. Most animals are polled.",
    traits: [
      { label: "Primary use", value: "Draught (ploughing, carting)" },
      { label: "Coat", value: "Mainly reddish brown, sometimes grey; a few white" },
      { label: "Horns", value: "Mostly polled (about 60%); when present, straight, black and broad at the base" },
      { label: "Milk", value: "Low: 100-140 kg per lactation, fat 4.8-5.3%" },
    ],
    sources: [{ label: "Odisha Livestock Resources Development Society: Motu", url: "https://olrds.odisha.gov.in/en/motu/" }],
  },
  nagori: {
    region: "Rajasthan",
    description:
      "A draught breed from Nagaur district and neighbouring Jodhpur and Bikaner, famous for fast trotting bullocks used in light carts. Usually white or light grey with a hump and a long, narrow face; cows are modest milk producers.",
    traits: [
      { label: "Primary use", value: "Draught (fast trotting)" },
      { label: "Coat", value: "White or light grey" },
      { label: "Horns", value: "Moderate, curving upward and inward at the tips" },
    ],
    sources: [
      wiki("Nagori", "Nagori"),
      { label: "Oklahoma State University, Breeds of Livestock: Nagori cattle", url: "https://breeds.okstate.edu/cattle/nagori-cattle" },
    ],
  },
  ponwar: {
    region: "Uttar Pradesh",
    description:
      "A small, compact draught breed of the Pilibhit district, brown or black with white patches and known for a fiery temperament. Bullocks can haul 800-1,000 kg loads up to 10 km. Cows give little milk.",
    traits: [
      { label: "Primary use", value: "Draught" },
      { label: "Coat", value: "Brown or black with white patches" },
      { label: "Horns", value: "Small to medium, curving inward" },
      { label: "Milk", value: "Low: about 0.5-2.5 kg a day" },
    ],
    sources: [wiki("Ponwar cattle", "Ponwar_cattle")],
  },
  siri: {
    region: "Sikkim and West Bengal",
    description:
      "A relatively large zebu-type hill breed of the eastern Himalaya (Sikkim, Darjeeling and Bhutan), often black or black-and-white with a long, thick coat. Strong legs suit it to mountain terrain and ploughing.",
    traits: [
      { label: "Coat", value: "Often black or black-and-white; long, thick coat" },
      { label: "Horns", value: "Long and sharp if left uncut" },
      { label: "Build", value: "Relatively large; hump set slightly forward; strong legs" },
    ],
    sources: [wiki("Siri cattle", "Siri_cattle")],
  },
  thutho: {
    region: "Nagaland",
    description:
      "A hardy, docile, medium-sized black breed of Kohima, Phek and Zunheboto districts in Nagaland, kept mainly for meat, draught work and manure. Milk yield is low.",
    traits: [
      { label: "Primary use", value: "Meat, draught and manure" },
      { label: "Coat", value: "Predominantly black; about 40% have white spots on the face" },
      { label: "Horns", value: "Short and stumpy (NBAGR); another profile says curved outward and upward" },
      { label: "Milk", value: "Low: 0.5-1.5 kg a day" },
    ],
    sources: [{ label: "ICAR-NBAGR: Thutho cattle", url: "https://nbagr.icar.gov.in/en/thutho-cattle/" }],
  },
};
