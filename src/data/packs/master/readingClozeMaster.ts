import {
  BlankItem,
  CEFRLevel,
  CompleteWordsQuestion,
  DifficultyLevel,
} from '../../../types/toefl';

const PACK_ID = 'aipp-complete-2026';

type BlankSpec = [
  blankId: string,
  prefix: string,
  answer: string,
  contextHint: string,
];

type ClozeRow = [
  idNum: number,
  difficulty: DifficultyLevel,
  cefr: CEFRLevel,
  topic: string,
  title: string,
  passageTemplate: string,
  blanks: [BlankSpec, BlankSpec, BlankSpec, BlankSpec, BlankSpec],
  explanation: string,
];

const CLOZE_ROWS: ClozeRow[] = [
  [
    1, 'Beginner', 'B1', 'Urban Forestry', 'Shade Trees Along City Streets',
    'Planting mature shade trees along paved city avenues can noticeably {{b1}} summer sidewalk temperatures. Wide leaf canopies intercept direct sunlight before it warms dark asphalt, while natural leaf evaporation adds gentle moisture to dry urban air. City engineers also note that tree roots help {{b2}} heavy rainwater runoff during sudden storms, reducing pressure on neighborhood drains. When residents walk beneath leafy avenues, pedestrian activity typically {{b3}} near local shops and transit stops. Maintaining healthy urban trees therefore requires modest annual pruning and {{b4}} soil space around each trunk. Communities that protect street canopies enjoy lower cooling bills and cleaner {{b5}} throughout the year.',
    [
      ['b1', 'red', 'reduce', 'Base verb meaning "make lower or smaller".'],
      ['b2', 'abs', 'absorb', 'Base verb meaning "soak up water".'],
      ['b3', 'incr', 'increases', 'Singular verb meaning "grows or rises".'],
      ['b4', 'adeq', 'adequate', 'Adjective meaning "enough for a need".'],
      ['b5', 'envir', 'environments', 'Plural noun meaning "surroundings".'],
    ],
    'Each blank matches everyday academic collocations: reduce temperatures, absorb runoff, activity increases, adequate space, and cleaner environments.',
  ],
  [
    2, 'Beginner', 'B1', 'Library History', 'How Public Lending Libraries Grew',
    'Before free municipal libraries opened in the nineteenth century, printed books remained too {{b1}} for most working households to own. Early subscription societies pooled member dues to purchase reference volumes, yet access was still limited to paying subscribers. Civic reformers gradually argued that shared reading rooms would {{b2}} literacy and strengthen informed citizenship across entire towns. Once local taxes funded public buildings, librarians designed clear cataloging systems so visitors could {{b3}} specific subjects independently. Today, modern branches continue this open mission by providing quiet study desks, community workshops, and free {{b4}} to digital archives. Few civic institutions match the lasting educational {{b5}} of a neighborhood library.',
    [
      ['b1', 'expen', 'expensive', 'Adjective meaning "costing a great deal of money".'],
      ['b2', 'prom', 'promote', 'Base verb meaning "encourage or advance".'],
      ['b3', 'loc', 'locate', 'Base verb meaning "find the exact place of".'],
      ['b4', 'acc', 'access', 'Uncountable noun meaning "ability to enter or use".'],
      ['b5', 'imp', 'impact', 'Noun meaning "strong positive effect".'],
    ],
    'Check parts of speech carefully: expensive (adj), promote (verb), locate (verb), access (noun), and impact (noun).',
  ],
  [
    3, 'Beginner', 'B1', 'Astronomy', 'Why Mountain Peaks Host Telescopes',
    'Astronomers rarely construct major optical observatories near sea-level cities because bright streetlights {{b1}} faint starlight across the night sky. High desert mountaintops offer two crucial advantages: thinner air and remarkably low atmospheric {{b2}}. Fewer water vapor molecules above the dome mean infrared light from distant galaxies arrives with far less {{b3}}. In addition, smooth airflow over isolated peaks keeps stars from twinkling excessively in long-exposure photographs. Observatory staff carefully {{b4}} mirror temperatures each evening so warm domes do not blur images. Thanks to these careful site choices, ground telescopes remain highly {{b5}} tools alongside space instruments.',
    [
      ['b1', 'obsc', 'obscure', 'Plural verb meaning "hide or make hard to see".'],
      ['b2', 'humid', 'humidity', 'Noun referring to moisture in the air.'],
      ['b3', 'distor', 'distortion', 'Noun meaning "warping or loss of clarity".'],
      ['b4', 'bal', 'balance', 'Plural verb meaning "equalize or keep steady".'],
      ['b5', 'effec', 'effective', 'Adjective meaning "producing strong results".'],
    ],
    'Astronomy contexts align cleanly with obscure starlight, low humidity, less distortion, balance temperatures, and effective tools.',
  ],
  [
    4, 'Beginner', 'B1', 'Food Science', 'The Chemistry of Bread Fermentation',
    'When bakers mix flour, warm water, and yeast, microscopic fungi begin to {{b1}} natural starches into simple sugars. As yeast cells consume those sugars, they release tiny carbon dioxide bubbles that get trapped inside stretchy gluten strands. Over several hours, this steady gas production causes the dough to {{b2}} smoothly and develop rich flavor. Controlling kitchen temperature is essential because excessive heat can {{b3}} active yeast before baking even begins. Inside a hot oven, trapped bubbles swell rapidly while the outer crust turns golden and {{b4}}. Understanding this simple biological process helps home cooks bake consistent loaves with lighter {{b5}}.',
    [
      ['b1', 'conv', 'convert', 'Base verb meaning "change from one substance to another".'],
      ['b2', 'exp', 'expand', 'Base verb meaning "grow larger in volume".'],
      ['b3', 'dam', 'damage', 'Base verb meaning "harm or weaken".'],
      ['b4', 'crisp', 'crispy', 'Adjective describing a firm, crunchy crust.'],
      ['b5', 'text', 'texture', 'Noun referring to physical feel or crumb structure.'],
    ],
    'Process verbs ("convert", "expand", "damage") pair with descriptive baking terms ("crispy", "texture").',
  ],
  [
    5, 'Beginner', 'B1', 'Wildlife Ecology', 'Pollinator Gardens on University Campuses',
    'Replacing unused decorative lawns with native flowering meadows offers an affordable way to {{b1}} declining bee and butterfly populations. Unlike trimmed turf grass, native perennials bloom in staggered waves from early spring through late autumn, supplying continuous {{b2}} for foraging insects. Because local wildflowers are already adapted to regional rainfall, grounds crews spend far less time mowing or {{b3}} these plots. Biology instructors also turn campus meadows into living classrooms where undergraduates {{b4}} insect diversity firsthand. Even narrow borders planted beside campus walkways can form connected corridors that {{b5}} wildlife moving across dense cities.',
    [
      ['b1', 'supp', 'support', 'Base verb meaning "help sustain or maintain".'],
      ['b2', 'nect', 'nectar', 'Sweet liquid collected by bees from flowers.'],
      ['b3', 'water', 'watering', 'Gerund parallel with "mowing".'],
      ['b4', 'obser', 'observe', 'Plural verb meaning "watch and record carefully".'],
      ['b5', 'guid', 'guide', 'Plural verb meaning "direct along a path".'],
    ],
    'Notice parallelism ("mowing or watering") and ecological collocations ("support populations", "continuous nectar", "observe diversity").',
  ],
  [
    6, 'Beginner', 'B1', 'Music Education', 'Acoustic Benefits of Ensemble Practice',
    'Learning an instrument alone builds finger coordination, yet playing inside a small ensemble develops a distinct set of {{b1}} skills. Musicians in a quartet must constantly adjust their tempo and volume so no single voice {{b2}} the shared melody. Listening carefully to neighboring players trains sharper pitch awareness and smoother breath {{b3}} during transitions. Instructors also observe that rehearsal partners motivate students to practice steadily between weekly {{b4}} so they do not let teammates down. Over a semester, collaborative rehearsals strengthen both technical precision and mutual {{b5}} among performers.',
    [
      ['b1', 'listen', 'listening', 'Participle/gerund adjective modifying "skills".'],
      ['b2', 'overp', 'overpowers', 'Singular verb meaning "becomes too loud for".'],
      ['b3', 'tim', 'timing', 'Noun meaning "synchronization in rhythm".'],
      ['b4', 'sessi', 'sessions', 'Plural noun meaning "scheduled meetings or practices".'],
      ['b5', 'confid', 'confidence', 'Uncountable noun meaning "trust and self-assurance".'],
    ],
    'Ensemble terms match naturally: listening skills, voice overpowers, breath timing, weekly sessions, and mutual confidence.',
  ],
  [
    7, 'Beginner', 'B1', 'Transportation', 'Bicycle Commuting and Protected Lanes',
    'Many commuters hesitate to ride bicycles to work or campus when they must share narrow streets with fast-moving {{b1}}. Urban planners have discovered that painting a thin line on asphalt rarely reassures nervous riders. Installing physical planters or concrete curbs, however, {{b2}} a dedicated corridor that separates cyclists safely from turning vehicles. Cities that connect protected lanes directly to train stations often record rapid {{b3}} in everyday cycling trips across all age groups. Safer streets also reduce minor collisions and encourage residents to replace short car errands with {{b4}} zero-emission rides. Clear signage at intersections further improves mutual {{b5}} between drivers and cyclists.',
    [
      ['b1', 'traff', 'traffic', 'Uncountable noun referring to moving vehicles.'],
      ['b2', 'crea', 'creates', 'Singular verb agreeing with gerund subject "Installing".'],
      ['b3', 'grow', 'growth', 'Noun meaning "steady increase".'],
      ['b4', 'heal', 'healthy', 'Adjective describing physical wellness benefits.'],
      ['b5', 'visib', 'visibility', 'Noun meaning "ability to see one another clearly".'],
    ],
    'Gerund subject "Installing..." requires singular verb "creates", paired with transport nouns traffic, growth, and visibility.',
  ],
  [
    8, 'Beginner', 'B1', 'Educational Psychology', 'Why Short Breaks Improve Study Focus',
    'Students often assume that sitting at a desk for four uninterrupted hours will {{b1}} the largest amount of material. Memory research consistently shows, however, that mental fatigue builds quickly after forty-five minutes of intense {{b2}}. Taking a brief ten-minute walk or stretching away from screens allows the brain to consolidate fresh {{b3}} before tackling new chapters. When learners return refreshed, they read faster and make noticeably fewer careless {{b4}} on practice exercises. Scheduling regular pauses also keeps motivation steady during long exam weeks, preventing last-minute {{b5}}.',
    [
      ['b1', 'cov', 'cover', 'Base verb meaning "study or get through material".'],
      ['b2', 'concen', 'concentration', 'Noun meaning "sustained focused attention".'],
      ['b3', 'infor', 'information', 'Uncountable noun meaning "facts or concepts learned".'],
      ['b4', 'mist', 'mistakes', 'Plural noun meaning "errors".'],
      ['b5', 'burn', 'burnout', 'Noun meaning "exhaustion from prolonged overwork".'],
    ],
    'Study-habit terms fit cleanly: cover material, intense concentration, fresh information, careless mistakes, and burnout.',
  ],
  [
    9, 'Intermediate', 'B2', 'Materials Engineering', 'Self-Healing Concrete Using Dormant Bacteria',
    'Microscopic hairline cracks inevitably form inside steel-reinforced concrete bridges as traffic loads and winter frost {{b1}} stress over decades. Once rainwater seeps through those fissures, internal steel rods begin to corrode, shortening structural {{b2}} considerably. To slow this decay, civil engineers have embedded dormant calcium-producing bacteria and starch capsules directly within fresh concrete {{b3}}. Whenever moisture enters a newly opened crack, the microbes awaken and secrete solid limestone minerals that automatically {{b4}} the gap within weeks. Although bio-concrete carries a higher initial price, reduced repair closures can deliver substantial lifecycle {{b5}} on major highways.',
    [
      ['b1', 'exer', 'exert', 'Plural verb meaning "apply pressure or force".'],
      ['b2', 'lifes', 'lifespan', 'Noun meaning "usable duration of a structure".'],
      ['b3', 'mixt', 'mixtures', 'Plural noun referring to blended building materials.'],
      ['b4', 'sea', 'seal', 'Plural verb meaning "close tightly against water".'],
      ['b5', 'savi', 'savings', 'Plural noun meaning "reductions in financial cost".'],
    ],
    'Materials-science collocations include exert stress, structural lifespan, concrete mixtures, seal the gap, and lifecycle savings.',
  ],
  [
    10, 'Intermediate', 'B2', 'Marine Biology', 'How Mangrove Forests Protect Tropical Coasts',
    'Growing in salty intertidal mudflats where few terrestrial trees survive, mangrove forests form dense tangles of arched prop roots along tropical {{b1}}. During severe coastal cyclones, these submerged root networks dramatically dissipate incoming wave {{b2}}, shielding inland villages from destructive storm surges. Equally important, calm water trapped beneath mangrove branches acts as a sheltered nursery where juvenile crabs and reef fish {{b3}} safely away from open-ocean predators. Below the waterline, oxygen-poor sediments lock away organic carbon for centuries, making mangroves extraordinarily efficient natural carbon {{b4}}. Restoring degraded tidal creeks therefore safeguards both coastal livelihoods and regional marine {{b5}}.',
    [
      ['b1', 'shorel', 'shorelines', 'Plural noun meaning "edges where land meets sea".'],
      ['b2', 'ener', 'energy', 'Uncountable noun meaning "physical force of waves".'],
      ['b3', 'matu', 'mature', 'Plural verb meaning "grow into adulthood".'],
      ['b4', 'sin', 'sinks', 'Plural noun for ecosystems that absorb and store carbon.'],
      ['b5', 'biodiv', 'biodiversity', 'Noun meaning "variety of living species".'],
    ],
    'Coastal ecology vocabulary pairs naturally: shorelines, wave energy, juvenile fish mature, carbon sinks, and marine biodiversity.',
  ],
  [
    11, 'Intermediate', 'B2', 'Cognitive Science', 'The Testing Effect in Long-Term Recall',
    'When undergraduates prepare for cumulative finals, many rely primarily on highlighting textbook paragraphs and rereading lecture slides repeatedly. While repeated reading creates a comforting sense of familiarity, cognitive experiments reveal it often produces shallow {{b1}} once the book is closed. Actively retrieving explanations from memory—through flashcards or brief practice quizzes—forces neural pathways to {{b2}} target concepts more durably. Even unsuccessful retrieval attempts prove beneficial because they pinpoint exact conceptual gaps and sharpen attention during subsequent {{b3}}. Instructors who weave brief ungraded quizzes into weekly lectures routinely observe stronger midterm performance and lower exam {{b4}}. Embracing active recall transforms study time from passive review into lasting intellectual {{b5}}.',
    [
      ['b1', 'reten', 'retention', 'Noun meaning "ability to keep information in memory".'],
      ['b2', 'streng', 'strengthen', 'Base verb meaning "make stronger or more durable".'],
      ['b3', 'feedb', 'feedback', 'Uncountable noun meaning "corrective review or answers".'],
      ['b4', 'anxi', 'anxiety', 'Noun meaning "nervous stress during testing".'],
      ['b5', 'mast', 'mastery', 'Noun meaning "deep, reliable command of a subject".'],
    ],
    'Educational psychology terms fit seamlessly: shallow retention, strengthen pathways, subsequent feedback, exam anxiety, and mastery.',
  ],
  [
    12, 'Intermediate', 'B2', 'Economic History', 'Standardized Shipping Containers and Global Trade',
    'Prior to the mid-twentieth century, loading a merchant freighter required dozens of dockworkers to hoist individual wooden crates and burlap sacks by hand. Ports suffered chronic delays, frequent cargo breakage, and widespread theft whenever vessels remained {{b1}} at anchor for over a week. The introduction of uniform intermodal steel containers revolutionized logistics because sealed boxes could transfer seamlessly between ships, freight trains, and highway {{b2}}. Mechanized gantry cranes cut port turnaround times from days to hours, slashing maritime transport {{b3}} by more than eighty percent. As shipping grew predictable, manufacturers began sourcing specialized components across multiple continents rather than clustering solely beside raw {{b4}}. Few seemingly ordinary inventions reshaped modern commercial {{b5}} so thoroughly.',
    [
      ['b1', 'dock', 'docked', 'Past participle adjective meaning "moored at a port".'],
      ['b2', 'truc', 'trucks', 'Plural noun completing the three transport modes.'],
      ['b3', 'cos', 'costs', 'Plural noun meaning "expenses".'],
      ['b4', 'mater', 'materials', 'Plural noun paired with "raw".'],
      ['b5', 'geogr', 'geography', 'Noun meaning "spatial distribution of economic activity".'],
    ],
    'Logistics context guides each blank: remained docked, highway trucks, transport costs, raw materials, and commercial geography.',
  ],
  [
    13, 'Intermediate', 'B2', 'Architecture', 'Daylighting Strategies in Contemporary Museums',
    'Designing illumination for an art museum presents an enduring engineering paradox: natural daylight renders pigment colors far more faithfully than artificial bulbs, yet ultraviolet radiation steadily {{b1}} delicate watercolors and historic textiles. Rather than sealing galleries inside windowless concrete boxes, modern architects employ sawtooth roof skylights angled away from harsh direct {{b2}}. Automated louvered baffles track the sun’s seasonal path, diffusing gentle indirect brightness uniformly across gallery {{b3}} while filtering harmful wavelengths. Visitors experience subtle shifts in sky tone throughout the afternoon, reducing visual fatigue during extended {{b4}}. Thoughtful daylight engineering therefore balances rigorous artwork preservation with an inviting human {{b5}}.',
    [
      ['b1', 'fad', 'fades', 'Singular verb meaning "causes colors to lose brightness".'],
      ['b2', 'sunli', 'sunlight', 'Uncountable noun referring to direct solar rays.'],
      ['b3', 'wall', 'walls', 'Plural noun naming where paintings hang.'],
      ['b4', 'visi', 'visits', 'Plural noun meaning "tours or stays in the museum".'],
      ['b5', 'atmos', 'atmosphere', 'Noun meaning "overall spatial mood or feel".'],
    ],
    'Singular subject "ultraviolet radiation" requires "fades", paired with direct sunlight, gallery walls, extended visits, and atmosphere.',
  ],
  [
    14, 'Intermediate', 'B2', 'Meteorology', 'Urban Heat Islands and Nighttime Cooling',
    'Thermometers positioned inside dense metropolitan cores routinely register three to five degrees warmer after sunset than surrounding rural {{b1}}. Concrete plazas, dark rooftops, and tightly packed masonry absorb intense solar radiation all afternoon and release that stored thermal energy slowly after {{b2}}. Because tall buildings also obstruct gentle evening breezes, stagnant warm air lingers inside street canyons well past midnight. Elevated overnight temperatures strain electrical grids as air conditioners run continuously and heighten health risks for elderly {{b3}} during summer heatwaves. Planting reflective cool roofs, porous parks, and shaded transit corridors can significantly {{b4}} peak nighttime temperatures. Integrating climate-responsive materials into city codes now stands as a vital public-health {{b5}}.',
    [
      ['b1', 'farml', 'farmland', 'Uncountable noun contrasting rural area with urban cores.'],
      ['b2', 'du', 'dusk', 'Noun meaning "twilight right after sunset".'],
      ['b3', 'resid', 'residents', 'Plural noun meaning "people living in the city".'],
      ['b4', 'mod', 'moderate', 'Base verb meaning "make less extreme".'],
      ['b5', 'prior', 'priority', 'Noun meaning "urgent top goal".'],
    ],
    'Urban climatology phrasing links rural farmland, after dusk, elderly residents, moderate temperatures, and public-health priority.',
  ],
  [
    15, 'Intermediate', 'B2', 'Archaeology', 'Aerial Lidar Mapping Under Forest Canopies',
    'For decades, mapping ancient settlements buried beneath dense Central American rainforests required exhausting ground expeditions armed with machetes and compasses. Today, aircraft equipped with pulsed laser radar—known as lidar—fire hundreds of thousands of light beams downward every {{b1}}. Although most pulses bounce off upper tree branches, a small fraction slips through microscopic gaps in the foliage and strikes the forest {{b2}}. By measuring exact return times, software strips away digital vegetation to reveal hidden terraces, irrigation canals, and stone {{b3}} across vast landscapes. Recent surveys have doubled population estimates for classical lowland cities, overturning older assumptions about ancient tropical {{b4}}. Archaeologists still verify every anomaly on foot, yet lidar has compressed decades of exploratory mapping into single {{b5}}.',
    [
      ['b1', 'seco', 'second', 'Singular time unit measuring pulse frequency.'],
      ['b2', 'floo', 'floor', 'Noun completing the collocation "forest floor".'],
      ['b3', 'plaz', 'plazas', 'Plural noun for open ceremonial stone squares.'],
      ['b4', 'agric', 'agriculture', 'Uncountable noun meaning "farming systems".'],
      ['b5', 'seas', 'seasons', 'Plural noun for annual fieldwork intervals.'],
    ],
    'Archaeological remote-sensing terms fit smoothly: every second, forest floor, stone plazas, tropical agriculture, and single seasons.',
  ],
  [
    16, 'Intermediate', 'B2', 'Renewable Energy', 'Pumped Hydro as Mechanical Grid Storage',
    'Long before modern lithium batteries existed, electrical utilities perfected a remarkably simple method for storing surplus power using gravity and {{b1}}. A pumped-hydroelectric station links two mountain reservoirs separated by hundreds of meters in vertical elevation. Whenever wind turbines or solar farms generate extra electricity during off-peak hours, reversible pumps lift water uphill into the upper {{b2}}. Later, when evening household demand spikes, operators open sluice gates so falling water spins downstream turbines and restores power to the grid within {{b3}}. Modern facilities recover roughly eighty percent of the input energy and operate reliably for half a {{b4}}. Upgrading existing dams with closed-loop pumped storage remains one of the most economical ways to stabilize clean power {{b5}}.',
    [
      ['b1', 'wat', 'water', 'Uncountable noun essential to hydroelectric plants.'],
      ['b2', 'bas', 'basin', 'Noun meaning "water-holding reservoir".'],
      ['b3', 'minu', 'minutes', 'Plural time noun showing rapid dispatch response.'],
      ['b4', 'cent', 'century', 'Noun completing "half a century" (50 years).'],
      ['b5', 'netw', 'networks', 'Plural noun meaning "interconnected electrical grids".'],
    ],
    'Mechanical storage context drives exact collocations: gravity and water, upper basin, within minutes, half a century, and power networks.',
  ],
  [
    17, 'Intermediate', 'B2', 'Botany', 'Fire-Adapted Cones in Boreal Pine Forests',
    'Although severe forest fires appear purely destructive at first glance, several North American pine species evolved an extraordinary reproductive strategy that actually {{b1}} periodic flames. Lodgepole and jack pines produce tight, resin-sealed cones that can hang unopened on branches for decades without releasing a single {{b2}}. Only when passing heat melts the waxy resin bond do the wooden scales flare outward, showering thousands of viable seeds onto freshly cleared mineral {{b3}}. Because flames temporarily remove competing shrubs and thick leaf litter, newly sprouted pine seedlings receive abundant sunlight and rich ash {{b4}}. Ecologists warn, however, that fires returning too frequently before young trees reach maturity can overwhelm this ancient {{b5}}.',
    [
      ['b1', 'requ', 'requires', 'Singular verb agreeing with "strategy".'],
      ['b2', 'see', 'seed', 'Singular noun after "a single".'],
      ['b3', 'soi', 'soil', 'Uncountable noun for ground earth.'],
      ['b4', 'nutr', 'nutrients', 'Plural noun referring to minerals feeding seedlings.'],
      ['b5', 'adap', 'adaptation', 'Noun meaning "evolutionary survival trait".'],
    ],
    'Singular antecedent "strategy" requires "requires"; biological vocabulary completes seed, mineral soil, ash nutrients, and adaptation.',
  ],
  [
    18, 'Intermediate', 'B2', 'Behavioral Economics', 'Choice Overload in Everyday Decisions',
    'Classical economic theory assumed that expanding consumer options always raises satisfaction because shoppers can locate their exact preferred product. In a famous supermarket experiment, however, psychologists offered passersby tasting tables displaying either six or twenty-four varieties of specialty {{b1}}. While the larger display attracted more curious browsers, customers facing the modest six-jar table were far more likely to complete an actual {{b2}}. Analysts explain that excessive choices force buyers to weigh too many tiny trade-offs, triggering mental exhaustion and fear of post-purchase {{b3}}. Online retailers and retirement-plan administrators now streamline menus into clear curated tiers to reduce decision {{b4}}. Thoughtful simplification often boosts both customer confidence and long-term {{b5}}.',
    [
      ['b1', 'jam', 'jams', 'Plural noun referring to fruit spreads in the classic study.'],
      ['b2', 'purc', 'purchase', 'Singular noun meaning "buying transaction".'],
      ['b3', 'regr', 'regret', 'Uncountable noun meaning "disappointment over a choice".'],
      ['b4', 'fati', 'fatigue', 'Uncountable noun meaning "mental weariness".'],
      ['b5', 'sati', 'satisfaction', 'Noun meaning "contentment with a chosen outcome".'],
    ],
    'Behavioral economics collocations align closely: specialty jams, actual purchase, post-purchase regret, decision fatigue, and satisfaction.',
  ],
  [
    19, 'Advanced', 'C1', 'Paleoclimatology', 'Reading Ancient Rainfall in Cave Stalagmites',
    'Deep inside limestone caverns, rainwater trickling downward through overlying soil gradually precipitates thin crystalline layers of calcite onto upward-growing {{b1}}. Because each annual mineral ring traps oxygen isotopes reflecting surface precipitation intensity, stalagmites act as remarkably precise paleoclimate {{b2}}. Unlike ice cores, which are largely restricted to polar latitudes and high alpine glaciers, cave formations occur across monsoon belts and temperate {{b3}}. Uranium-thorium radiometric dating allows geochemists to pinpoint abrupt ancient megadroughts with uncertainties of barely a few decades across tens of thousands of {{b4}}. Correlating cave records with historical settlement abandonment has revealed how prolonged hydrological shifts periodically strained early agrarian {{b5}}.',
    [
      ['b1', 'stalag', 'stalagmites', 'Plural geological noun matching the passage title.'],
      ['b2', 'arch', 'archives', 'Plural noun meaning "preserved historical records".'],
      ['b3', 'regi', 'regions', 'Plural noun meaning "geographic zones".'],
      ['b4', 'yea', 'years', 'Plural time unit after "tens of thousands of".'],
      ['b5', 'empi', 'empires', 'Plural noun meaning "ancient ruling states".'],
    ],
    'Cave paleoclimate terminology pairs stalagmites, climate archives, temperate regions, thousands of years, and agrarian empires.',
  ],
  [
    20, 'Advanced', 'C1', 'Neuroscience', 'Sleep Spindles and Procedural Skill Consolidation',
    'Musicians and surgeons alike have long noticed that a tricky motor sequence often feels noticeably smoother after a full night of uninterrupted {{b1}}. Electroencephalogram recordings show that during non-REM sleep, brief rapid bursts of brainwave activity—termed sleep spindles—coordinate communication between the hippocampus and motor {{b2}}. These synchronized oscillations appear to replay newly practiced movement patterns at accelerated speed, stabilizing synaptic pathways without conscious {{b3}}. Participants deprived of late-night spindle-rich sleep stages retain significantly less speed and accuracy on finger-tapping benchmarks the next {{b4}}. Far from being an idle shutdown, restful sleep functions as an active biochemical editor that refines fragile daytime {{b5}}.',
    [
      ['b1', 'slee', 'sleep', 'Uncountable noun meaning "nocturnal rest".'],
      ['b2', 'cort', 'cortex', 'Anatomical noun for the outer brain layer.'],
      ['b3', 'effo', 'effort', 'Uncountable noun meaning "deliberate mental work".'],
      ['b4', 'morn', 'morning', 'Noun marking the period immediately after sleep.'],
      ['b5', 'memo', 'memories', 'Plural noun referring to stored learned experiences.'],
    ],
    'Neuroscience prose pairs motor cortex, conscious effort, next morning, and daytime memories cleanly.',
  ],
  [
    21, 'Advanced', 'C1', 'Acoustic Ecology', 'How Birds Adapt Songs to Urban Traffic Noise',
    'Songbirds living beside busy metropolitan highways confront a relentless acoustic barrier: low-frequency engine rumble masks the very pitch bands they rely on to defend {{b1}} and attract mates. Field bioacousticians comparing city and rural populations of European great tits found that urban males systematically shift their minimum song frequencies {{b2}}. Singing at higher pitches helps vocal signals cut above traffic drone, though higher notes attenuate slightly faster across dense foliage and masonry {{b3}}. During quiet pandemic traffic lockdowns, researchers observed birds promptly reverting toward richer, lower-pitched repertoires within mere weeks, demonstrating remarkable behavioral {{b4}}. Such rapid vocal adjustments illustrate how wildlife actively negotiates sensory pressures inside human-dominated {{b5}}.',
    [
      ['b1', 'terr', 'territories', 'Plural noun meaning "defended nesting areas".'],
      ['b2', 'upwa', 'upward', 'Adverb meaning "toward higher frequencies".'],
      ['b3', 'barr', 'barriers', 'Plural noun meaning "physical obstacles".'],
      ['b4', 'plas', 'plasticity', 'Noun meaning "flexibility to adapt behavior".'],
      ['b5', 'land', 'landscapes', 'Plural noun meaning "environmental terrains".'],
    ],
    'Bioacoustic terms include defend territories, shift upward, masonry barriers, behavioral plasticity, and landscapes.',
  ],
  [
    22, 'Advanced', 'C1', 'History of Science', 'How Chronometers Solved Ocean Longitude',
    'For centuries, mariners could calculate north-south latitude reasonably well using noon sun altitude, yet determining east-west longitude across open oceans remained notoriously {{b1}}. Inaccurate dead reckoning caused catastrophic shipwrecks and forced merchant convoys to sail cautious, fuel-wasting zigzags along familiar coastal {{b2}}. Because Earth rotates fifteen degrees every hour, comparing local solar noon against a reference clock set to Greenwich time directly reveals longitudinal {{b3}}. Ordinary pendulum clocks failed completely aboard pitching vessels, and temperature swings warped brass springs across tropical latitudes. Eighteenth-century clockmaker John Harrison spent three decades inventing temperature-compensated balance wheels that kept time within seconds over transatlantic {{b4}}. Reliable marine chronometers transformed oceanic cartography and dramatically lowered maritime {{b5}}.',
    [
      ['b1', 'impr', 'imprecise', 'Adjective meaning "lacking exact accuracy".'],
      ['b2', 'rout', 'routes', 'Plural noun meaning "established sailing paths".'],
      ['b3', 'posi', 'position', 'Singular noun meaning "geographic location".'],
      ['b4', 'voya', 'voyages', 'Plural noun meaning "long ocean journeys".'],
      ['b5', 'haza', 'hazards', 'Plural noun meaning "dangers or risks".'],
    ],
    'Maritime history phrasing aligns imprecise reckoning, coastal routes, longitudinal position, transatlantic voyages, and maritime hazards.',
  ],
  [
    23, 'Advanced', 'C1', 'Immunology', 'Trained Immunity Beyond Adaptive Memory',
    'Textbook immunology long drew a sharp boundary between two defense tiers: a fast, generic innate system and a slower adaptive system capable of lifelong pathogen {{b1}}. Recent clinical observations, however, indicate that certain innate immune cells—including monocytes and natural killer cells—undergo durable epigenetic remodeling after initial microbial {{b2}}. Rather than producing targeted antibodies, these reprogrammed cells alter their chromatin accessibility so inflammatory defense genes activate far more {{b3}} upon encountering unrelated threats months later. Researchers term this phenomenon "trained immunity" because it confers broad cross-protection without classical T-cell {{b4}}. Harnessing safe innate training could eventually strengthen vaccine efficacy among elderly patients whose adaptive responses naturally {{b5}}.',
    [
      ['b1', 'memo', 'memory', 'Noun referring to adaptive immune recognition.'],
      ['b2', 'expo', 'exposure', 'Noun meaning "contact with a pathogen".'],
      ['b3', 'rapi', 'rapidly', 'Adverb modifying the verb "activate".'],
      ['b4', 'spec', 'specificity', 'Noun meaning "exact targeting of one antigen".'],
      ['b5', 'decl', 'decline', 'Plural verb meaning "weaken gradually over age".'],
    ],
    'Biomedical syntax pairs pathogen memory, microbial exposure, activate rapidly, T-cell specificity, and responses decline.',
  ],
  [
    24, 'Advanced', 'C1', 'Environmental Economics', 'Rebound Effects in Energy Efficiency',
    'When engineers design home furnaces or passenger vehicles that consume thirty percent less fuel per mile, policymakers naturally expect total energy demand to drop proportionally. Economists have long documented, however, a countervailing behavioral response known as the rebound {{b1}}: lower operating costs subtly encourage consumers to drive farther or set winter thermostats warmer. In mature markets like residential refrigeration, direct rebound remains small because households rarely buy extra refrigerators simply because electricity bills {{b2}}. In emerging aviation or cloud-computing sectors, by contrast, cheaper unit energy can spur explosive expansion in overall service {{b3}}. Recognizing rebound dynamics does not invalidate engineering efficiency; rather, it demonstrates why technical standards work best when paired with economy-wide carbon {{b4}}. Combining cleaner hardware with transparent price signals ensures efficiency gains yield verifiable net emissions {{b5}}.',
    [
      ['b1', 'effe', 'effect', 'Noun completing the term "rebound effect".'],
      ['b2', 'shri', 'shrink', 'Plural verb meaning "become smaller".'],
      ['b3', 'volu', 'volume', 'Noun meaning "total quantity or scale".'],
      ['b4', 'pric', 'pricing', 'Noun completing "carbon pricing".'],
      ['b5', 'redu', 'reductions', 'Plural noun meaning "measurable decreases".'],
    ],
    'Energy-economics terminology connects rebound effect, bills shrink, service volume, carbon pricing, and net emissions reductions.',
  ],
  [
    25, 'Advanced', 'C1', 'Glaciology', 'Subglacial Lakes Beneath Antarctic Ice',
    'Buried beneath nearly four kilometers of solid Antarctic ice, Lake Vostok has remained sealed from surface sunlight and atmospheric gas exchange for millions of {{b1}}. Liquid water persists at such frigid depths because immense overburden pressure lowers the freezing point while faint geothermal heat radiates upward from bedrock {{b2}}. To sample these pristine waters without introducing surface microbes, polar engineers developed hot-water sterile drills that melt narrow shafts and immediately sterilize instruments with ultraviolet {{b3}}. Preliminary ice-accretion analyses hinted at hardy extremophile bacteria metabolizing sulfur and iron compounds entirely independent of {{b4}}. Studying isolated subglacial ecosystems not only expands terrestrial biology but also guides astrobiologists planning future robotic probes to Jupiter’s ice-crusted moon {{b5}}.',
    [
      ['b1', 'year', 'years', 'Plural time noun after "millions of".'],
      ['b2', 'bene', 'beneath', 'Adverb/preposition meaning "underneath".'],
      ['b3', 'ligh', 'light', 'Noun completing "ultraviolet light".'],
      ['b4', 'phot', 'photosynthesis', 'Biological process converting sunlight into chemical energy.'],
      ['b5', 'Euro', 'Europa', 'Proper noun naming Jupiter’s ocean-bearing icy moon.'],
    ],
    'Polar science context points precisely to millions of years, bedrock beneath, ultraviolet light, photosynthesis, and Europa.',
  ],
  [
    26, 'Advanced', 'C1', 'Sociolinguistics', 'Why Emerging Slang Spreads Through Weak Ties',
    'Intuition might suggest that novel slang expressions spread fastest within tightly knit circles of lifelong friends who speak daily. Network sociolinguists tracing lexical diffusion across urban neighborhoods, however, discovered that tightly clustered groups tend to reinforce conservative, inward-facing speech {{b1}}. Linguistic innovations instead jump rapidly across districts via "weak ties"—casual acquaintances such as commuters, baristas, and university peers who bridge otherwise separate social {{b2}}. Because weak-tie speakers belong peripherally to multiple communities, they carry catchy metaphors from one subculture into another before older norms can {{b3}} them. Digital messaging platforms have accelerated this bridging mechanism dramatically, compressing multi-decade regional vocabulary shifts into single {{b4}}. Yet even viral terms rarely survive unless speakers adopt them to signal genuine social identity and group {{b5}}.',
    [
      ['b1', 'norm', 'norms', 'Plural noun meaning "established conventions".'],
      ['b2', 'circ', 'circles', 'Plural noun meaning "social groups or networks".'],
      ['b3', 'filt', 'filter', 'Base verb meaning "screen out or block".'],
      ['b4', 'year', 'years', 'Plural time noun contrasting with "multi-decade".'],
      ['b5', 'affi', 'affiliation', 'Noun meaning "belonging or solidarity with a group".'],
    ],
    'Sociolinguistic collocations fit cleanly: speech norms, social circles, filter them, single years, and group affiliation.',
  ],
  [
    27, 'Expert', 'C2', 'Biophysics', 'Structural Color Without Chemical Pigments',
    'Most vivid hues in nature arise from organic pigments that selectively absorb certain wavelengths of sunlight while reflecting others. Peacock feathers and Morpho butterfly wings, however, achieve dazzling iridescent blues that never fade with age because their color is purely {{b1}}. Under an electron microscope, wing scales reveal intricate nanoscale ridges spaced precisely half a wavelength of blue light apart, causing reflected rays to constructively {{b2}}. When the viewing angle tilts, path-length differences shift subtly, producing shimmering metallic transitions no chemical dye can {{b3}}. Materials physicists now mimic these photonic lattices to craft solvent-free automotive coatings and anti-counterfeit security threads that resist ultraviolet {{b4}}. Bio-inspired structural optics thus offers a durable, non-toxic alternative to heavy-metal industrial {{b5}}.',
    [
      ['b1', 'stru', 'structural', 'Adjective contrasting with chemical pigment color.'],
      ['b2', 'inte', 'interfere', 'Physics verb completing "constructively interfere".'],
      ['b3', 'repl', 'replicate', 'Base verb meaning "reproduce faithfully".'],
      ['b4', 'degr', 'degradation', 'Noun meaning "chemical breakdown over time".'],
      ['b5', 'pigm', 'pigments', 'Plural noun meaning "coloring substances".'],
    ],
    'Optical-physics precision governs structural color, constructively interfere, replicate transitions, ultraviolet degradation, and industrial pigments.',
  ],
  [
    28, 'Expert', 'C2', 'Macroeconomics', 'The Paradox of Thrift During Recessions',
    'At the household level, trimming discretionary spending during uncertain economic times represents prudent financial stewardship that builds protective {{b1}}. Yet macroeconomist John Maynard Keynes highlighted an unsettling collective paradox: if millions of households and firms simultaneously slash expenditure during a downturn, aggregate demand contracts {{b2}}. Shrinking retail revenues compel businesses to freeze hiring and cancel capital orders, which depresses wage incomes across the wider {{b3}}. Consequently, society as a whole can end up saving less in total even though every individual tried harder to economize. Countercyclical fiscal stabilizers—such as unemployment insurance and public infrastructure outlays—are specifically designed to interrupt this self-reinforcing {{b4}}. Recognizing the divergence between individual prudence and systemic outcomes remains foundational to modern macroeconomic {{b5}}.',
    [
      ['b1', 'rese', 'reserves', 'Plural noun meaning "saved funds or buffers".'],
      ['b2', 'shar', 'sharply', 'Adverb modifying the verb "contracts".'],
      ['b3', 'econ', 'economy', 'Singular noun referring to the national market system.'],
      ['b4', 'spir', 'spiral', 'Noun meaning "downward self-amplifying cycle".'],
      ['b5', 'theo', 'theory', 'Noun completing "macroeconomic theory".'],
    ],
    'Macroeconomic terms align crisply: protective reserves, contracts sharply, wider economy, self-reinforcing spiral, and theory.',
  ],
  [
    29, 'Expert', 'C2', 'Astrophysics', 'Gravitational Lensing as a Cosmic Magnifier',
    'According to general relativity, massive galaxy clusters warp surrounding spacetime so profoundly that passing light rays bend around them like beams traversing an optical {{b1}}. When a distant faint galaxy lies directly behind a foreground cluster, this gravitational lensing stretches and amplifies its image into luminous curved {{b2}}. Astronomers exploit these natural cosmic telescopes to inspect star-forming nurseries from the universe’s first billion years—objects otherwise far too dim for even orbital observatories to {{b3}}. Equally valuable, measuring exact arc distortions allows cosmologists to map the spatial distribution of invisible dark matter, which outweighs luminous stars roughly five to one. Gravitational lensing therefore serves simultaneously as an observational magnifier and a precision gravitational {{b4}} probing cosmic {{b5}}.',
    [
      ['b1', 'len', 'lens', 'Singular noun matching "optical lens".'],
      ['b2', 'arc', 'arcs', 'Plural geometric noun for curved light streaks.'],
      ['b3', 'reso', 'resolve', 'Astronomy verb meaning "distinguish fine optical detail".'],
      ['b4', 'prob', 'probe', 'Noun meaning "scientific diagnostic instrument".'],
      ['b5', 'arch', 'architecture', 'Noun meaning "large-scale cosmic structure".'],
    ],
    'Relativistic optics context links optical lens, curved arcs, resolve faint objects, gravitational probe, and cosmic architecture.',
  ],
  [
    30, 'Expert', 'C2', 'Molecular Biology', 'Ribozymes and the RNA World Hypothesis',
    'In modern cells, DNA archives genetic blueprints while protein enzymes catalyze nearly every metabolic reaction, posing an enduring evolutionary chicken-and-egg {{b1}}: neither system appears capable of originating without the other. The discovery in the 1980s of ribozymes—RNA strands able to fold into catalytic shapes and cleave chemical bonds independently—offered a compelling {{b2}}. Because RNA can simultaneously store sequence information and accelerate biochemical reactions, early prebiotic chemistry may have relied on a streamlined "RNA world" long before protein synthesis {{b3}}. Tellingly, the catalytic core of the modern ribosome that links amino acids together is still composed of RNA rather than protein, preserving an ancient molecular {{b4}}. Laboratory evolution experiments continue to test how self-replicating RNA assemblies could have emerged inside porous mineral {{b5}}.',
    [
      ['b1', 'dile', 'dilemma', 'Noun meaning "difficult logical paradox".'],
      ['b2', 'reso', 'resolution', 'Noun meaning "solution to a puzzle".'],
      ['b3', 'evol', 'evolved', 'Past-tense verb meaning "developed through selection".'],
      ['b4', 'foss', 'fossil', 'Noun completing the metaphor "molecular fossil".'],
      ['b5', 'cavi', 'cavities', 'Plural noun meaning "tiny enclosed rock pores".'],
    ],
    'Origin-of-life biology aligns dilemma, compelling resolution, evolved, molecular fossil, and mineral cavities.',
  ],
  [
    31, 'Expert', 'C2', 'Jurisprudence', 'Algorithmic Opacity and Administrative Due Process',
    'Public agencies increasingly adopt predictive scoring software to triage tax audits, allocate housing assistance, and flag suspected benefit fraud at unprecedented {{b1}}. While automation promises administrative speed, legal scholars warn that proprietary black-box models collide with a core pillar of constitutional due process: the right to understand and contest adverse state {{b2}}. When a citizen is denied public support based on an undisclosed weighting formula, meaningful appellate review becomes virtually {{b3}}. Courts in several jurisdictions have begun requiring public-sector vendors to submit algorithmic impact assessments and plain-language decision explanations prior to {{b4}}. Upholding procedural fairness in automated governance thus demands institutional transparency rather than blind deference to mathematical {{b5}}.',
    [
      ['b1', 'scal', 'scale', 'Uncountable noun completing "at unprecedented scale".'],
      ['b2', 'deci', 'decisions', 'Plural noun meaning "official administrative rulings".'],
      ['b3', 'impo', 'impossible', 'Adjective meaning "unable to be carried out".'],
      ['b4', 'depl', 'deployment', 'Noun meaning "operational launch of a system".'],
      ['b5', 'comp', 'complexity', 'Noun meaning "intricate technical sophistication".'],
    ],
    'Administrative law diction pairs unprecedented scale, adverse decisions, virtually impossible, prior to deployment, and mathematical complexity.',
  ],
  [
    32, 'Expert', 'C2', 'Geochemistry', 'Enhanced Rock Weathering for Carbon Removal',
    'Over geological epochs, rain dissolving atmospheric carbon dioxide into weak carbonic acid slowly reacts with volcanic silicate rocks, converting greenhouse gas into stable ocean {{b1}}. Because natural weathering operates across millennia, geochemists are trialing "enhanced rock weathering" by spreading finely crushed basalt quarry dust across humid agricultural {{b2}}. Pulverizing basalt multiplies reactive mineral surface area thousandfold, accelerating carbon drawdown from geological timescales to mere {{b3}}. Early field plots indicate two promising co-benefits: alkaline basalt neutralizes acidic cropland soils and releases trace phosphorus and magnesium that modestly boost crop {{b4}}. Rigorous pore-water monitoring remains essential, however, to verify exact carbon sequestration rates and ensure heavy metals never accumulate above safe agronomic {{b5}}.',
    [
      ['b1', 'bica', 'bicarbonates', 'Plural chemical noun for dissolved carbon ions in seawater.'],
      ['b2', 'soil', 'soils', 'Plural noun meaning "cultivated earth layers".'],
      ['b3', 'deca', 'decades', 'Plural time noun contrasting with millennia.'],
      ['b4', 'yiel', 'yields', 'Plural noun completing "crop yields".'],
      ['b5', 'thre', 'thresholds', 'Plural noun meaning "maximum permissible limits".'],
    ],
    'Geochemical collocations connect ocean bicarbonates, agricultural soils, mere decades, crop yields, and safe thresholds.',
  ],
];

// Ensure every prefix strictly matches the beginning of its answer (fix rows 14 and 19 cleanly)
const NORMALIZED_CLOZE_ROWS: ClozeRow[] = CLOZE_ROWS.map((row) => {
  const fixedBlanks = row[6].map(([blankId, prefix, answer, hint]) => {
    const cleanPrefix = answer.toLowerCase().startsWith(prefix.toLowerCase())
      ? prefix
      : answer.slice(0, Math.max(3, Math.floor(answer.length * 0.45)));
    return [blankId, cleanPrefix, answer, hint] as BlankSpec;
  }) as [BlankSpec, BlankSpec, BlankSpec, BlankSpec, BlankSpec];
  return [row[0], row[1], row[2], row[3], row[4], row[5], fixedBlanks, row[7]];
});

export const READING_CLOZE_MASTER: CompleteWordsQuestion[] = NORMALIZED_CLOZE_ROWS.map(
  ([idNum, difficulty, cefr, topic, title, passageTemplate, blankSpecs, explanation]) => {
    const blanks: BlankItem[] = blankSpecs.map(([blankId, prefix, answer, contextHint]) => ({
      blankId,
      prefix,
      answer,
      acceptedVariants: [answer],
      contextHint,
    }));
    return {
      id: `rd-m-cw-${String(idNum).padStart(3, '0')}`,
      section: 'reading',
      taskType: 'complete-the-words',
      difficulty,
      topic,
      learningObjective: `Restore contextual academic vocabulary accurately within a ${topic.toLowerCase()} passage.`,
      skillFocus: 'Lexical & Morphological Precision',
      estimatedTimeSec: difficulty === 'Beginner' ? 100 : difficulty === 'Intermediate' ? 115 : 130,
      keywords: [topic.toLowerCase(), 'complete-the-words', 'academic vocabulary'],
      cefr,
      sourceType: 'curated',
      reviewStatus: 'verified',
      scoreWeight: 1.25,
      title,
      passageTemplate,
      blanks,
      explanation,
      hint: 'Verify part of speech, singular/plural verb agreement, and semantic collocation around each prefix.',
      packId: PACK_ID,
    };
  }
);
