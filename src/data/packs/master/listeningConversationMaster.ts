import {
  CEFRLevel,
  DialogueLine,
  DifficultyLevel,
  ListeningQuestion,
} from '../../../types/toefl';

const PACK_ID = 'aipp-complete-2026';

interface ConversationBundle {
  audioId: string;
  difficulty: DifficultyLevel;
  cefr: CEFRLevel;
  topic: string;
  title: string;
  contextLabel: string;
  script: DialogueLine[];
  questions: Array<{
    skillFocus: string;
    question: string;
    options: [string, string, string, string];
    correctAnswerIndex: number;
    explanation: string;
    hint: string;
  }>;
}

const CONVERSATION_BUNDLES: ConversationBundle[] = [
  {
    audioId: 'aud-m-cv-01',
    difficulty: 'Beginner',
    cefr: 'B1',
    topic: 'Library Services',
    title: 'Locating an Out-of-Print Regional Atlas',
    contextLabel: 'Campus Conversation · Library Reference Desk',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Hi, I’m looking for the 1968 Regional Watershed Atlas. The online catalog says it’s on Shelf C-14, but there’s only an empty gap there.' },
      { speaker: 'Librarian', voiceRole: 'male-academic', text: 'Let me check our circulation log. Ah—several oversized atlases were shifted upstairs to the flat map drawers in Room 310 last week so their spines wouldn’t bend.' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'Oh, that makes sense! Can I check it out for the weekend to trace two creek maps?' },
      { speaker: 'Librarian', voiceRole: 'male-academic', text: 'Because it’s out of print, it stays inside Room 310, though there’s a free overhead scanner up there that saves crisp PDFs directly onto a flash drive.' },
    ],
    questions: [
      { skillFocus: 'Main Purpose', question: 'Why does the student visit the reference desk?', options: ['To pay an overdue atlas fine', 'To find a 1968 atlas missing from Shelf C-14', 'To reserve a weekend study pod', 'To borrow a campus flash drive'], correctAnswerIndex: 1, explanation: 'She could not find the 1968 Regional Watershed Atlas where the catalog listed it.', hint: 'Listen to the student’s opening lines.' },
      { skillFocus: 'Cause Detail', question: 'Why were the oversized atlases moved to Room 310?', options: ['To prevent their heavy spines from bending on vertical shelves', 'Because Shelf C-14 suffered water damage', 'To prepare them for an auction', 'Because a professor reserved them for class'], correctAnswerIndex: 0, explanation: 'The librarian says oversized atlases moved to flat map drawers so their spines would not bend.', hint: 'Check the librarian’s first explanation.' },
      { skillFocus: 'Policy Detail', question: 'Why can the student NOT take the atlas home over the weekend?', options: ['Her student ID expired', 'It is out of print and restricted to in-room use', 'Another student already reserved it', 'Room 310 is closed for renovations'], correctAnswerIndex: 1, explanation: 'Out-of-print atlases must remain inside Room 310.', hint: 'Listen to the librarian’s closing reply.' },
      { skillFocus: 'Next Step', question: 'How can the student still capture the creek maps cleanly?', options: ['Photograph them from the hallway', 'Use the free overhead PDF scanner in Room 310', 'Order a new reprint at the bookstore', 'Borrow a librarian’s personal photocopy'], correctAnswerIndex: 1, explanation: 'Room 310 has a free overhead scanner that saves PDFs onto a flash drive.', hint: 'Catch the practical alternative at the end.' },
    ],
  },
  {
    audioId: 'aud-m-cv-02',
    difficulty: 'Beginner',
    cefr: 'B1',
    topic: 'Course Advising',
    title: 'Resolving a Lab Schedule Conflict',
    contextLabel: 'Campus Conversation · Advising Office',
    script: [
      { speaker: 'Student', voiceRole: 'student-male', text: 'Professor Lin, I want to add Environmental Chemistry this spring, but the Tuesday afternoon lab overlaps with my required Statistics seminar.' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Let’s pull up the section list. There’s a Thursday morning lab section at nine, though right now it shows two students on the waitlist.' },
      { speaker: 'Student', voiceRole: 'student-male', text: 'Is it worth joining the waitlist, or should I postpone Chemistry until autumn?' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Definitely join the Thursday waitlist and attend the first lecture Monday. Usually three or four students shuffle schedules during week one, and Dr. Patel prioritizes sophomore science majors.' },
    ],
    questions: [
      { skillFocus: 'Core Problem', question: 'What prevents the student from registering for the Tuesday chemistry lab?', options: ['He lacks the math prerequisite', 'It conflicts with his required Statistics seminar', 'The Tuesday lab was canceled', 'He works off campus on Tuesdays'], correctAnswerIndex: 1, explanation: 'The Tuesday lab overlaps directly with his required Statistics seminar.', hint: 'Check the opening turn.' },
      { skillFocus: 'Option Detail', question: 'What is the current status of the Thursday morning lab section?', options: ['Completely open with ten seats', 'Full with two students on the waitlist', 'Restricted exclusively to seniors', 'Scheduled to move online'], correctAnswerIndex: 1, explanation: 'The advisor reports two students currently on the Thursday waitlist.', hint: 'Listen to the advisor’s first reply.' },
      { skillFocus: 'Recommendation', question: 'What does the advisor recommend the student do next?', options: ['Wait until autumn automatically', 'Join the Thursday waitlist and attend Monday’s first lecture', 'Drop the required Statistics seminar', 'Switch majors before registration closes'], correctAnswerIndex: 1, explanation: 'She advises joining the waitlist and attending Monday’s lecture because students routinely shift sections in Week 1.', hint: 'Check the advisor’s closing guidance.' },
      { skillFocus: 'Detail', question: 'Why is the advisor optimistic about the student getting a Thursday seat?', options: ['Dr. Patel prioritizes sophomore science majors and several seats usually open in Week 1', 'The department plans to double lab bench capacity', 'Most waitlisted students forget to pay lab fees', 'Statistics will likely move to Wednesdays'], correctAnswerIndex: 0, explanation: 'Typical Week-1 drops plus Dr. Patel’s priority for sophomore science majors make admission very likely.', hint: 'Listen to the final sentence.' },
    ],
  },
  {
    audioId: 'aud-m-cv-03',
    difficulty: 'Beginner',
    cefr: 'B1',
    topic: 'Campus Housing',
    title: 'Swapping a Broken Dormitory Desk Chair',
    contextLabel: 'Campus Conversation · Residence Hall Front Desk',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Good afternoon. One of the casters snapped off my dorm desk chair in Room 218, and now it wobbles sharply whenever I lean forward.' },
      { speaker: 'Staff', voiceRole: 'student-male', text: 'Sorry about that! Did you submit a work order in the housing app yet? Maintenance needs a ticket number before they release replacement furniture.' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'Not yet—I thought I could just carry the broken chair down here right away.' },
      { speaker: 'Staff', voiceRole: 'student-male', text: 'No need to haul it downstairs. Submit the ticket from your phone right now, leave the chair inside your doorway tomorrow morning, and our crew will swap it for a sturdy oak chair by noon.' },
    ],
    questions: [
      { skillFocus: 'Problem Detail', question: 'What is wrong with the student’s desk chair?', options: ['The seat cushion tore completely', 'A wheel caster broke off, making it wobble sharply', 'It is too tall to fit beneath the desk', 'Someone removed it from Room 218'], correctAnswerIndex: 1, explanation: 'One caster snapped off, causing the chair to wobble whenever she leans forward.', hint: 'Listen to sentence 1.' },
      { skillFocus: 'Procedural Rule', question: 'Why does the front-desk staff ask about the housing app?', options: ['To charge a repair deposit', 'Because maintenance requires a ticket number before issuing replacement furniture', 'To check whether she lives in Room 218', 'To confirm her roommate agrees to the swap'], correctAnswerIndex: 1, explanation: 'Maintenance requires a work-order ticket number before releasing replacement furniture.', hint: 'Check the staff member’s first reply.' },
      { skillFocus: 'Action Detail', question: 'What does the staff member tell the student NOT to do?', options: ['Do not use the housing app', 'Do not haul the broken chair downstairs herself', 'Do not stay in the room tomorrow morning', 'Do not lean on oak chairs'], correctAnswerIndex: 1, explanation: 'He says there is no need to haul the chair downstairs.', hint: 'Listen to his closing instruction.' },
      { skillFocus: 'Timeline', question: 'When will the replacement chair be delivered?', options: ['Immediately this afternoon', 'By noon tomorrow', 'Next Monday evening', 'After winter break'], correctAnswerIndex: 1, explanation: 'The crew will swap the chair by noon tomorrow.', hint: 'Catch the final time reference.' },
    ],
  },
  {
    audioId: 'aud-m-cv-04',
    difficulty: 'Beginner',
    cefr: 'B1',
    topic: 'Student Clubs',
    title: 'Planning the Botany Club Seed Swap',
    contextLabel: 'Campus Conversation · Student Union Cafe',
    script: [
      { speaker: 'Student A', voiceRole: 'student-male', text: 'Elena, we have forty packets of heirloom tomato and basil seeds ready for Saturday’s swap, but the weather forecast just switched to steady morning rain.' },
      { speaker: 'Student B', voiceRole: 'student-female', text: 'Oh no—the outdoor courtyard tables would soak all the paper envelopes in ten minutes. Did Events Scheduling give us an indoor backup space?' },
      { speaker: 'Student A', voiceRole: 'student-male', text: 'Yes! They reserved the glass atrium inside the Science Commons as our rain venue, though we aren’t allowed to bring open bags of potting soil indoors.' },
      { speaker: 'Student B', voiceRole: 'student-female', text: 'That’s fine—let’s keep it strictly seeds and labeled herb cuttings indoors, and post a quick map story on our club page tonight so nobody wanders out to the wet courtyard.' },
    ],
    questions: [
      { skillFocus: 'Trigger Event', question: 'Why can the Botany Club no longer hold the seed swap on the outdoor courtyard?', options: ['The courtyard is closed for concrete repairs', 'Steady morning rain is forecast and would soak paper seed envelopes', 'Too few club members signed up', 'Events Scheduling double-booked the patio'], correctAnswerIndex: 1, explanation: 'Forecast morning rain would soak all the paper seed packets.', hint: 'Listen to the first two turns.' },
      { skillFocus: 'Constraint Detail', question: 'What restriction applies to using the indoor Science Commons glass atrium?', options: ['Only ten visitors may enter at once', 'Open bags of potting soil cannot be brought inside', 'Herb cuttings are prohibited indoors', 'The event must end before 10:00 a.m.'], correctAnswerIndex: 1, explanation: 'The atrium reservation prohibits bringing open bags of potting soil indoors.', hint: 'Check Student A’s second turn.' },
      { skillFocus: 'Adaptation', question: 'How does Elena adjust the event plan for the indoor space?', options: ['Cancel the event until next month', 'Limit offerings strictly to seeds and labeled herb cuttings', 'Distribute plastic umbrellas outside', 'Move potting tables into the parking garage'], correctAnswerIndex: 1, explanation: 'She decides to offer only seeds and labeled herb cuttings inside.', hint: 'Listen to Elena’s closing turn.' },
      { skillFocus: 'Communication Step', question: 'How will they prevent students from showing up at the wet courtyard?', options: ['By mailing postcards to biology majors', 'By posting a quick venue-map update on the club page tonight', 'By hiring campus security to redirect traffic', 'By moving the event to Sunday'], correctAnswerIndex: 1, explanation: 'Elena suggests posting a quick map story on their club page tonight.', hint: 'Catch the final clause.' },
    ],
  },
  {
    audioId: 'aud-m-cv-05',
    difficulty: 'Beginner',
    cefr: 'B1',
    topic: 'Campus Dining',
    title: 'Checking Allergen Labeling in the Cafeteria',
    contextLabel: 'Campus Conversation · Dining Hall Manager Office',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Hi, I have a severe sesame allergy, and I noticed the roasted vegetable station didn’t have its ingredient card up at lunch today.' },
      { speaker: 'Manager', voiceRole: 'male-academic', text: 'Thank you for flagging that right away—the card must have slipped behind the sneeze guard when trays were swapped. Our roasted carrots today actually used pure olive oil with zero sesame.' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'That’s a relief! Is there a quick way to check daily menus ahead of time when I’m rushing between classes?' },
      { speaker: 'Manager', voiceRole: 'male-academic', text: 'Yes, our campus dining web app has an allergen filter that highlights sesame-free dishes across all three halls every morning by seven, and you can always ask any line chef to check the kitchen binder.' },
    ],
    questions: [
      { skillFocus: 'Main Purpose', question: 'Why did the student speak with the dining hall manager?', options: ['To request extra vegan desserts', 'To report a missing ingredient card because she has a severe sesame allergy', 'To apply for a part-time kitchen shift', 'To ask why lunch closed early'], correctAnswerIndex: 1, explanation: 'She noticed the allergen/ingredient card was missing at the roasted vegetable station.', hint: 'Listen to the opening turn.' },
      { skillFocus: 'Fact Check', question: 'Did today’s roasted carrots contain sesame oil?', options: ['Yes, a small garnish of sesame seeds', 'No, they were cooked solely with olive oil', 'The manager could not verify the recipe', 'Only the morning batch was sesame-free'], correctAnswerIndex: 1, explanation: 'The manager confirms the carrots used pure olive oil with zero sesame.', hint: 'Check the manager’s first reply.' },
      { skillFocus: 'Digital Tool', question: 'How can the student verify allergen-safe dishes before rushing to lunch?', options: ['Call the kitchen phone at noon', 'Use the allergen filter in the campus dining web app updated by 7 a.m.', 'Check posted paper flyers in residence halls', 'Email the campus nurse weekly'], correctAnswerIndex: 1, explanation: 'The dining web app updates an allergen filter across all three halls by 7:00 a.m.', hint: 'Listen to the manager’s final reply.' },
      { skillFocus: 'In-Person Backup', question: 'What in-person option does the manager also mention?', options: ['Asking any line chef to verify the kitchen ingredient binder', 'Bringing raw vegetables from home to steam', 'Dining exclusively after 2:00 p.m.', 'Eating only pre-packaged granola bars'], correctAnswerIndex: 0, explanation: 'She can always ask any line chef to check the kitchen binder.', hint: 'Listen to the final phrase.' },
    ],
  },
  {
    audioId: 'aud-m-cv-06',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Research Mentorship',
    title: 'Narrowing a Senior History Thesis Scope',
    contextLabel: 'Campus Conversation · Professor Office Hours',
    script: [
      { speaker: 'Student', voiceRole: 'student-male', text: 'Dr. Holloway, I’m drafting my senior thesis proposal on twentieth-century European rail nationalization, but my outline already looks like a five-hundred-page book.' },
      { speaker: 'Professor', voiceRole: 'female-academic', text: 'Classic early-stage ambition! For a forty-page thesis, comparing six countries forces you into shallow summaries instead of real archival analysis.' },
      { speaker: 'Student', voiceRole: 'student-male', text: 'Should I focus solely on postwar Britain’s 1948 rail merger, or compare two regional freight lines in northern England?' },
      { speaker: 'Professor', voiceRole: 'female-academic', text: 'Comparing two northern freight lines—say one coal-heavy corridor and one port-export branch—gives you crisp analytical contrast while letting you read actual board minutes in our microform collection.' },
    ],
    questions: [
      { skillFocus: 'Core Problem', question: 'What issue is the student facing with his thesis proposal?', options: ['He cannot find any books on European railways', 'His initial topic covering all twentieth-century European rail is far too broad', 'His advisor rejected his archival funding request', 'He wants to switch from History to Engineering'], correctAnswerIndex: 1, explanation: 'His broad continent-wide outline already resembles a 500-page book instead of a 40-page thesis.', hint: 'Check the opening two turns.' },
      { skillFocus: 'Academic Principle', question: 'Why does Dr. Holloway advise against comparing six countries?', options: ['European rail records are sealed until 2050', 'Covering too many nations reduces a 40-page paper to shallow summaries rather than archival depth', 'She prefers studying maritime shipping instead', 'Six-country studies require fluency in Latin'], correctAnswerIndex: 1, explanation: 'Too many countries prevent genuine primary-source archival analysis.', hint: 'Listen to the professor’s first reply.' },
      { skillFocus: 'Specific Recommendation', question: 'Which narrowed focus does Dr. Holloway favor?', options: ['A brief summary of all British passenger trains', 'Comparing two contrasting northern England freight lines', 'Focusing strictly on nineteenth-century steam locomotives', 'Writing a biography of one rail minister'], correctAnswerIndex: 1, explanation: 'She recommends comparing a coal-heavy corridor against a port-export branch in northern England.', hint: 'Listen to her closing turn.' },
      { skillFocus: 'Resource Advantage', question: 'What practical archival advantage does the recommended focus offer?', options: ['The student can analyze original board minutes already held in the campus microform collection', 'No primary sources are needed for regional studies', 'British rail museums will mail original ledgers free', 'The comparison requires no bibliography'], correctAnswerIndex: 0, explanation: 'Original board minutes are already accessible in the university’s microform collection.', hint: 'Catch the closing resource detail.' },
    ],
  },
  {
    audioId: 'aud-m-cv-07',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Biology Lab',
    title: 'Troubleshooting Contradictory Water-Quality Readings',
    contextLabel: 'Campus Conversation · Ecology Laboratory',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Hey Marcus, our dissolved-oxygen probe logged twelve milligrams per liter in the shady creek pool, which seems way too high for warm August water.' },
      { speaker: 'Lab Partner', voiceRole: 'student-male', text: 'Whoa—warm stagnant water usually tops out around seven or eight. Did we recalibrate the membrane cap after last week’s salt-marsh trip?' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'Oops, I only rinsed the probe with deionized water—I didn’t run the zero-oxygen calibration solution.' },
      { speaker: 'Lab Partner', voiceRole: 'student-male', text: 'Good catch! Let’s flag today’s readings as uncalibrated in the notebook, recalibrate right now, and re-sample that exact shaded pool before Friday’s lab report.' },
    ],
    questions: [
      { skillFocus: 'Anomaly Detection', question: 'Why does the student suspect the dissolved-oxygen reading of 12 mg/L is erroneous?', options: ['The screen battery flashed low', 'Warm August water in a shady pool rarely holds that much dissolved oxygen', 'Salt-marsh fish consumed all oxygen', 'The lab manual expects readings above twenty'], correctAnswerIndex: 1, explanation: 'Both students note warm stagnant summer water typically tops out around 7–8 mg/L.', hint: 'Listen to the first two turns.' },
      { skillFocus: 'Root Cause', question: 'What procedural step did the student accidentally skip?', options: ['Rinsing the probe with deionized water', 'Running the zero-oxygen calibration solution after last week’s salt-marsh trip', 'Recording water temperature in Celsius', 'Turning on the probe power switch'], correctAnswerIndex: 1, explanation: 'She rinsed the probe but skipped running the zero-oxygen calibration solution.', hint: 'Check the student’s second turn.' },
      { skillFocus: 'Scientific Integrity', question: 'How does Marcus handle the suspect measurements in their lab notebook?', options: ['Erase them completely so the instructor never sees them', 'Flag them honestly as uncalibrated rather than deleting them', 'Subtract four milligrams manually from every row', 'Copy values from another lab bench'], correctAnswerIndex: 1, explanation: 'Good lab practice flags flawed readings transparently as uncalibrated rather than fabricating or erasing records.', hint: 'Listen to Marcus’s closing plan.' },
      { skillFocus: 'Action Plan', question: 'What will the partners do before Friday’s report is due?', options: ['Skip the shaded pool entirely', 'Recalibrate the probe and re-sample the exact same creek pool', 'Borrow a brand-new probe from Physics', 'Request a two-week extension automatically'], correctAnswerIndex: 1, explanation: 'They will recalibrate immediately and re-sample the exact shaded pool before Friday.', hint: 'Catch the final step.' },
    ],
  },
  {
    audioId: 'aud-m-cv-08',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Career Services',
    title: 'Tailoring a Cover Letter for a Nonprofit Fellowship',
    contextLabel: 'Campus Conversation · Career Counseling Office',
    script: [
      { speaker: 'Student', voiceRole: 'student-male', text: 'Ms. Morales, I’ve sent the same cover letter to eight urban-policy internships and haven’t landed a single interview yet.' },
      { speaker: 'Counselor', voiceRole: 'female-academic', text: 'Let’s look at your opening paragraph. You summarize your coursework clearly, but it reads so broadly that a reader wouldn’t know you’re applying to the Clean Transit Coalition specifically.' },
      { speaker: 'Student', voiceRole: 'student-male', text: 'So instead of listing four classes, I should open by connecting my GIS bus-stop map project directly to their neighborhood equity campaign?' },
      { speaker: 'Counselor', voiceRole: 'female-academic', text: 'Exactly! Mention one concrete campaign from their annual report, pair it with your measurable GIS project outcome, and keep the entire letter crisp at three short paragraphs.' },
    ],
    questions: [
      { skillFocus: 'Core Diagnosis', question: 'What main weakness does the counselor identify in the student’s current cover letter?', options: ['It contains severe spelling mistakes', 'It is overly generic and never connects specifically to the target organization', 'It is shorter than one paragraph', 'It fails to mention his college major'], correctAnswerIndex: 1, explanation: 'Sending the same broad letter everywhere failed to signal tailored interest in the Clean Transit Coalition.', hint: 'Listen to the counselor’s first critique.' },
      { skillFocus: 'Concrete Revision', question: 'What personal project does the student propose highlighting in the opening?', options: ['His part-time bookstore job', 'His GIS bus-stop mapping project', 'His freshman history essay', 'His intramural soccer captaincy'], correctAnswerIndex: 1, explanation: 'He suggests connecting his GIS bus-stop map project directly to their equity campaign.', hint: 'Check the student’s second turn.' },
      { skillFocus: 'Research Strategy', question: 'Where does Ms. Morales suggest finding a specific detail to reference?', options: ['From the organization’s annual report', 'From generic transit encyclopedias', 'From a classmate’s old resume', 'From local bus timetables'], correctAnswerIndex: 0, explanation: 'She advises referencing one concrete campaign from the coalition’s annual report.', hint: 'Listen to the counselor’s final turn.' },
      { skillFocus: 'Structure Advice', question: 'How long does the counselor advise keeping the revised cover letter?', options: ['Two full single-spaced pages', 'Three crisp, short paragraphs', 'One bulleted slide deck', 'Exactly one thousand words'], correctAnswerIndex: 1, explanation: 'She recommends keeping the letter crisp at three short paragraphs.', hint: 'Catch the closing formatting tip.' },
    ],
  },
  {
    audioId: 'aud-m-cv-09',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Campus Art Museum',
    title: 'Preparing an Exhibition Audio Description Script',
    contextLabel: 'Campus Conversation · Museum Education Wing',
    script: [
      { speaker: 'Curator', voiceRole: 'male-academic', text: 'Priya, thanks for drafting the audio descriptions for our ceramics exhibition—they’re vivid! One quick note on the stoneware vase description: you called it "elegant and serene."' },
      { speaker: 'Intern', voiceRole: 'student-female', text: 'Oh, right—audio description guidelines for blind and low-vision visitors prefer objective visual details over subjective adjectives, don’t they?' },
      { speaker: 'Curator', voiceRole: 'male-academic', text: 'Spot on. Describe the tall tapering neck, the pale celadon glaze, and the faint crackle pattern so listeners form their own emotional impression.' },
      { speaker: 'Intern', voiceRole: 'student-female', text: 'That makes total sense. I’ll revise all six scripts today to emphasize exact shapes, proportions, and surface textures before we record Thursday.' },
    ],
    questions: [
      { skillFocus: 'Feedback Focus', question: 'Why does the curator flag the phrase "elegant and serene"?', options: ['Those words are too difficult to pronounce aloud', 'Accessible audio descriptions should give objective visual facts rather than subjective judgments', 'The vase is actually brightly colored and chaotic', 'The script exceeded thirty seconds'], correctAnswerIndex: 1, explanation: 'Audio description best practices prioritize objective visual details so visitors form their own impressions.', hint: 'Listen to the intern’s and curator’s middle turns.' },
      { skillFocus: 'Specific Example', question: 'Which objective details does the curator recommend describing on the stoneware vase?', options: ['Its auction price and donor name', 'Its tapering neck, pale celadon glaze, and faint crackle pattern', 'The kiln fuel temperature in degrees', 'How visitors usually react to it'], correctAnswerIndex: 1, explanation: 'He specifies tapering neck, pale celadon glaze, and faint crackle pattern.', hint: 'Check the curator’s second turn.' },
      { skillFocus: 'Timeline', question: 'When is the studio recording scheduled?', options: ['This afternoon', 'Thursday', 'Next Monday', 'After exhibition opening'], correctAnswerIndex: 1, explanation: 'Priya will revise all six scripts today ahead of Thursday’s recording.', hint: 'Catch the day mentioned at the end.' },
      { skillFocus: 'Attitude', question: 'How does Priya respond to the curator’s critique?', options: ['Defensively, insisting her wording is poetic', 'Receptively, recognizing the principle immediately and planning concrete revisions', 'Confusedly, asking someone else to write the scripts', 'Indifferently, leaving the scripts unchanged'], correctAnswerIndex: 1, explanation: 'She immediately connects the critique to accessibility guidelines and commits to revising all six scripts.', hint: 'Notice her tone in turns 2 and 4.' },
    ],
  },
  {
    audioId: 'aud-m-cv-10',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Campus Facilities',
    title: 'Addressing Evening Lab Ventilation Noise',
    contextLabel: 'Campus Conversation · Engineering Annex',
    script: [
      { speaker: 'Grad Student', voiceRole: 'student-male', text: 'Excuse me—are you from Facilities? The rooftop exhaust fan above Acoustics Lab 202 started making a loud metallic rattle around noon.' },
      { speaker: 'Technician', voiceRole: 'female-academic', text: 'Yes, I’m checking the rooftop unit now. It sounds like a worn drive belt slipping on the pulley—nothing hazardous to air quality, just noisy.' },
      { speaker: 'Grad Student', voiceRole: 'student-male', text: 'Phew, glad it’s safe! We have sensitive speech-intelligibility recordings booked in Room 202 at four o’clock—any chance it’ll be quiet by then?' },
      { speaker: 'Technician', voiceRole: 'female-academic', text: 'I have a spare belt right on my cart, so I’ll shut the fan down for twenty minutes at two and swap it out well ahead of your four-o’clock session.' },
    ],
    questions: [
      { skillFocus: 'Cause Detail', question: 'What does the technician diagnose as the likely cause of the metallic rattle?', options: ['A blocked chemical filter', 'A worn drive belt slipping on the rooftop fan pulley', 'Loose ceiling tiles inside Room 202', 'A power transformer failure'], correctAnswerIndex: 1, explanation: 'She identifies a worn drive belt slipping on the pulley.', hint: 'Listen to the technician’s first turn.' },
      { skillFocus: 'Safety Clarification', question: 'Does the rattle indicate an indoor air-quality hazard?', options: ['Yes, the building must evacuate immediately', 'No, it is only a mechanical noise issue with no air-quality hazard', 'Only if the lab windows stay closed', 'The technician refuses to comment on safety'], correctAnswerIndex: 1, explanation: 'She reassures him it is nothing hazardous to air quality, just noisy.', hint: 'Check the middle of turn 2.' },
      { skillFocus: 'Student Need', question: 'Why is the graduate student especially concerned about the timing of the repair?', options: ['He wants to nap inside the lab', 'He has sensitive speech-intelligibility recordings scheduled at 4:00 p.m.', 'A visiting dean is inspecting the roof at noon', 'The building closes at 3:00 p.m.'], correctAnswerIndex: 1, explanation: 'Room 202 has sensitive speech-intelligibility recordings booked for 4:00 p.m.', hint: 'Listen to turn 3.' },
      { skillFocus: 'Resolution', question: 'How does the technician resolve the problem before 4:00 p.m.?', options: ['She orders a belt that arrives next week', 'She will swap in a spare belt from her cart during a 20-minute shutdown at 2:00 p.m.', 'She relocates the recording equipment to the basement', 'She leaves the fan turned off all evening'], correctAnswerIndex: 1, explanation: 'She already carries a spare belt and will swap it out at 2:00 p.m., well before 4:00 p.m.', hint: 'Read the closing turn carefully.' },
    ],
  },
  {
    audioId: 'aud-m-cv-11',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Academic Publishing',
    title: 'Selecting Visualizations for a Student Journal Submission',
    contextLabel: 'Campus Conversation · Economics Study Lounge',
    script: [
      { speaker: 'Co-Author A', voiceRole: 'student-female', text: 'Noah, the Undergraduate Economics Review asked us to trim our article from six figures down to three before final typesetting.' },
      { speaker: 'Co-Author B', voiceRole: 'student-male', text: 'Okay, let’s keep Figure 1 showing ridership trends and Figure 4 comparing peak versus off-peak elasticity—those carry our core argument.' },
      { speaker: 'Co-Author A', voiceRole: 'student-female', text: 'Agreed. What about Figures 2 and 3 showing county-by-county bus mileage? Could we merge them into one clean two-panel figure?' },
      { speaker: 'Co-Author B', voiceRole: 'student-male', text: 'Brilliant—merging them keeps every key county comparison visible while moving our raw regression scatterplots into the online supplementary appendix.' },
    ],
    questions: [
      { skillFocus: 'Editorial Requirement', question: 'What revision did the student journal request before final typesetting?', options: ['Double the length of the literature review', 'Reduce the number of figures from six down to three', 'Replace all charts with hand-drawn ink tables', 'Remove the online appendix completely'], correctAnswerIndex: 1, explanation: 'The journal asked them to trim from six figures to three.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Priority Choice', question: 'Why does Noah insist on keeping Figures 1 and 4?', options: ['They were the hardest to color', 'They convey the article’s core ridership and elasticity arguments', 'They require the smallest page space', 'The journal editor specifically drew them'], correctAnswerIndex: 1, explanation: 'Noah notes Figures 1 and 4 carry their core argument.', hint: 'Check turn 2.' },
      { skillFocus: 'Creative Solution', question: 'How do the co-authors preserve the county-by-county bus mileage comparisons?', options: ['By describing every number only in prose', 'By merging Figures 2 and 3 into a single two-panel figure', 'By deleting county data entirely', 'By printing them on the back cover'], correctAnswerIndex: 1, explanation: 'They combine Figures 2 and 3 into one clean two-panel figure.', hint: 'Listen to turn 3.' },
      { skillFocus: 'Disposition Detail', question: 'Where will the raw regression scatterplots go?', options: ['Deleted permanently', 'Into the online supplementary appendix', 'Inside Footnote 1', 'Published as a separate blog post'], correctAnswerIndex: 1, explanation: 'Noah suggests moving raw scatterplots to the online supplementary appendix.', hint: 'Check the closing phrase.' },
    ],
  },
  {
    audioId: 'aud-m-cv-12',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Study Abroad',
    title: 'Choosing Homestay vs. Residence Hall Abroad',
    contextLabel: 'Campus Conversation · Global Education Office',
    script: [
      { speaker: 'Student', voiceRole: 'student-male', text: 'I’m torn between a local homestay and the international student dorm for my semester in Kyoto.' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Both have real perks. If rapid everyday Japanese conversation is your top priority, sharing dinner with a host family gives you two hours of natural practice daily.' },
      { speaker: 'Student', voiceRole: 'student-male', text: 'That sounds amazing, though I’m also taking an evening calligraphy workshop twice a week and worry about disrupting a host family’s dinner schedule.' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Good thinking—our housing questionnaire lets you note evening classes explicitly so we match you with flexible host households who eat later or gladly save a plate.' },
    ],
    questions: [
      { skillFocus: 'Decision Dilemma', question: 'What housing choice is the student trying to make?', options: ['Off-campus studio vs. hotel', 'Local homestay vs. international student dorm in Kyoto', 'Single dorm room vs. double dorm room', 'Staying one semester vs. a full year'], correctAnswerIndex: 1, explanation: 'He is deciding between a homestay and an international dorm in Kyoto.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Homestay Benefit', question: 'What major advantage of a homestay does the advisor highlight?', options: ['Closer walking distance to every subway line', 'Roughly two hours of natural daily Japanese conversation over dinner', 'Lower monthly electricity bills', 'Guaranteed private study offices'], correctAnswerIndex: 1, explanation: 'Sharing dinner with a host family delivers daily immersive Japanese conversation.', hint: 'Check turn 2.' },
      { skillFocus: 'Student Hesitation', question: 'Why is the student hesitant about choosing a homestay?', options: ['He dislikes Japanese home cooking', 'His twice-weekly evening calligraphy workshop might conflict with family dinners', 'He already has friends living in the dorm', 'Homestays do not offer wireless internet'], correctAnswerIndex: 1, explanation: 'He worries evening calligraphy sessions twice a week might disrupt host-family dinner timing.', hint: 'Listen to turn 3.' },
      { skillFocus: 'Solution', question: 'How does the housing office accommodate his evening schedule?', options: ['By forbidding homestay students from taking night classes', 'By letting him note evening classes on the matching questionnaire to pair with flexible hosts', 'By refunding half of his dinner fee', 'By assigning him to the dorm automatically'], correctAnswerIndex: 1, explanation: 'Noting evening classes on the questionnaire ensures placement with flexible host households.', hint: 'Read the final turn carefully.' },
    ],
  },
  {
    audioId: 'aud-m-cv-13',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Theater Production',
    title: 'Solving Stage Lighting Glare on Painted Backdrops',
    contextLabel: 'Campus Conversation · Black Box Theater',
    script: [
      { speaker: 'Lighting Designer', voiceRole: 'student-female', text: 'Sam, during dress rehearsal the overhead LEDs bounced a bright hotspot straight off the painted harbor backdrop.' },
      { speaker: 'Scenic Painter', voiceRole: 'student-male', text: 'Ah—we sealed the canvas with satin varnish yesterday to keep the blue pigment from scuffing during scene changes, and satin catches grazing light.' },
      { speaker: 'Lighting Designer', voiceRole: 'student-female', text: 'Can we roll a dead-matte acrylic coat over the sky section, or should I steepen the fixture angles?' },
      { speaker: 'Scenic Painter', voiceRole: 'student-male', text: 'Let’s do both quickly: a thin matte roller coat dries in forty minutes, and nudging your fixtures ten degrees steeper will kill glare completely before opening night.' },
    ],
    questions: [
      { skillFocus: 'Visual Problem', question: 'What visual glitch appeared during dress rehearsal?', options: ['The blue paint peeled off the canvas', 'Overhead LEDs created a bright glare hotspot on the painted harbor backdrop', 'The theater spotlights overheated', 'Stagehands dropped the canvas frame'], correctAnswerIndex: 1, explanation: 'LEDs bounced a bright reflective hotspot off the backdrop.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Technical Cause', question: 'Why did the backdrop start reflecting grazing light?', options: ['The lighting designer used uncalibrated white bulbs', 'A satin protective varnish had been applied to stop scuffing', 'The canvas was accidentally hung upside down', 'The paint was still wet during rehearsal'], correctAnswerIndex: 1, explanation: 'Satin varnish applied to protect blue pigment caught grazing light.', hint: 'Check turn 2.' },
      { skillFocus: 'Combined Fix', question: 'What two-part fix do Sam and the lighting designer agree on?', options: ['Repainting the entire harbor black and turning off overhead lights', 'Rolling a fast-drying dead-matte acrylic coat and angling fixtures ten degrees steeper', 'Replacing the canvas with a digital video screen', 'Moving the audience three rows back'], correctAnswerIndex: 1, explanation: 'They pair a 40-minute matte topcoat with steepening LED angles by ten degrees.', hint: 'Listen to turn 4.' },
      { skillFocus: 'Practical Detail', question: 'How long will the matte roller coat take to dry?', options: ['Ten minutes', 'Forty minutes', 'Four hours', 'Overnight'], correctAnswerIndex: 1, explanation: 'Sam states a thin matte roller coat dries in forty minutes.', hint: 'Catch the drying time in turn 4.' },
    ],
  },
  {
    audioId: 'aud-m-cv-14',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Campus Archives',
    title: 'Evaluating Oral History Recording Equipment',
    contextLabel: 'Campus Conversation · Media Loan Counter',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'I’m recording oral-history interviews with retired shipyard workers next week—should I borrow the shotgun boom mic or clip-on lavalier mics?' },
      { speaker: 'Media Specialist', voiceRole: 'male-academic', text: 'Where are the interviews taking place? Kitchens and living rooms have refrigerators and street traffic that wide microphones pick up.' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'Mostly inside people’s homes, often around a dining table.' },
      { speaker: 'Media Specialist', voiceRole: 'male-academic', text: 'Then grab our dual-channel clip-on lavaliers plus a small tabletop backup recorder. Clipped six inches below the chin, lavaliers isolate clear speech and let older interviewees relax without staring at a huge boom pole.' },
    ],
    questions: [
      { skillFocus: 'Project Context', question: 'What project is the student preparing to record?', options: ['A student jazz concert', 'Oral-history interviews with retired shipyard workers', 'Outdoor wildlife bird calls', 'A campus sports broadcast'], correctAnswerIndex: 1, explanation: 'She is recording oral-history interviews with retired shipyard workers.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Acoustic Factor', question: 'Why does the specialist ask about the interview locations?', options: ['Because outdoor loans require extra insurance', 'Because indoor home appliances and traffic create background noise that wide mics capture', 'Because lavalier cables are too short for auditoriums', 'Because home electrical outlets lack grounding'], correctAnswerIndex: 1, explanation: 'Refrigerators and street traffic inside homes degrade wide-pickup recordings.', hint: 'Check turn 2.' },
      { skillFocus: 'Recommended Gear', question: 'Which equipment combination does the specialist recommend?', options: ['A single shotgun boom pole only', 'Dual-channel clip-on lavaliers plus a small tabletop backup recorder', 'A smartphone voice memo app alone', 'Wireless studio headsets'], correctAnswerIndex: 1, explanation: 'He recommends dual-channel clip-on lavaliers paired with a tabletop backup recorder.', hint: 'Listen to turn 4.' },
      { skillFocus: 'Human Factor', question: 'Besides clearer audio isolation, what benefit do clip-on lavaliers offer for elderly interviewees?', options: ['They translate regional dialects automatically', 'Interviewees feel more relaxed without an intimidating boom pole in front of them', 'They double as hearing aids', 'They require zero battery power'], correctAnswerIndex: 1, explanation: 'Clip-on mics let interviewees relax naturally rather than staring at a large boom pole.', hint: 'Check the closing clause.' },
    ],
  },
  {
    audioId: 'aud-m-cv-15',
    difficulty: 'Intermediate',
    cefr: 'B2',
    topic: 'Graduate Seminar',
    title: 'Coordinating a Joint Conference Panel Proposal',
    contextLabel: 'Campus Conversation · Department Lounge',
    script: [
      { speaker: 'Grad A', voiceRole: 'student-male', text: 'Chloe, we have three strong abstracts on coastal wetland carbon for the October conference, but panel submissions require a unifying 250-word rationale and an external discussant.' },
      { speaker: 'Grad B', voiceRole: 'student-female', text: 'What connects all three papers cleanly? Yours tracks salt-marsh sediment cores, mine models oyster-reef wave damping, and Mateo’s analyzes municipal zoning buyouts.' },
      { speaker: 'Grad A', voiceRole: 'student-male', text: 'They all show how ecological restoration and municipal land policy have to work together—so our unifying theme could be "Bridging Living Shorelines and Coastal Governance."' },
      { speaker: 'Grad B', voiceRole: 'student-female', text: 'Love that framing! I’ll email Dr. Okonkwo at Harbor State today to ask if she’ll serve as discussant, and I’ll draft the 250-word rationale by Wednesday.' },
    ],
    questions: [
      { skillFocus: 'Submission Gap', question: 'What two pieces are still missing from their conference panel submission?', options: ['Travel funding and hotel bookings', 'A 250-word unifying rationale and an external discussant', 'Poster tubes and laser pointers', 'Three revised literature tables'], correctAnswerIndex: 1, explanation: 'Turn 1 states panel submissions require a 250-word rationale and an external discussant.', hint: 'Listen to Grad A’s opening turn.' },
      { skillFocus: 'Synthesis', question: 'What unifying theme connects the three distinct papers?', options: ['Deep-ocean mineral mining', 'Integrating ecological restoration with municipal coastal governance', 'Historical shipwrecks along northern harbors', 'Comparing global fishing tariffs'], correctAnswerIndex: 1, explanation: 'Grad A unifies sediment cores, oyster reefs, and zoning buyouts under bridging living shorelines and coastal governance.', hint: 'Check turn 3.' },
      { skillFocus: 'Division of Labor', question: 'What tasks does Chloe volunteer to handle?', options: ['Rewriting Mateo’s zoning paper', 'Inviting Dr. Okonkwo as discussant and drafting the 250-word rationale by Wednesday', 'Submitting travel grants to the dean', 'Designing all three PowerPoint decks'], correctAnswerIndex: 1, explanation: 'Chloe will email Dr. Okonkwo today and draft the 250-word rationale by Wednesday.', hint: 'Listen to turn 4.' },
      { skillFocus: 'Detail', question: 'What specific subject does Mateo’s paper analyze?', options: ['Salt-marsh sediment cores', 'Oyster-reef wave damping', 'Municipal zoning buyouts', 'Satellite rainfall radar'], correctAnswerIndex: 2, explanation: 'Chloe notes Mateo’s paper analyzes municipal zoning buyouts.', hint: 'Check the three paper topics listed in turn 2.' },
    ],
  },
  {
    audioId: 'aud-m-cv-16',
    difficulty: 'Advanced',
    cefr: 'C1',
    topic: 'Research Design',
    title: 'Handling Attrition Bias in a Longitudinal Study',
    contextLabel: 'Campus Conversation · Quantitative Methods Advising',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Dr. Bergstrom, we retained eighty-two percent of participants across our six-month commuter-cycling study, which felt solid—until I checked who dropped out.' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Let me guess: the eighteen percent who left weren’t random?' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'Right—nearly two-thirds of dropouts lived farther than six kilometers from campus and lacked protected bike lanes. If I drop them completely, won’t my model overstate cycling satisfaction?' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Sharp catch. Report baseline differences transparently in Table 1, apply inverse-probability weighting to adjust for differential attrition, and run a sensitivity bound showing how results shift if dropouts had zero cycling gain.' },
    ],
    questions: [
      { skillFocus: 'Statistical Threat', question: 'Why is an 82-percent retention rate still concerning to the student?', options: ['Journals require 100 percent retention', 'Dropouts were concentrated among longer-distance commuters lacking bike lanes, introducing non-random attrition bias', 'The bike trackers ran out of batteries', 'Too many urban walkers joined late'], correctAnswerIndex: 1, explanation: 'Systematic dropout among distant commuters without bike lanes would artificially inflate reported cycling satisfaction.', hint: 'Listen to turns 1 through 3.' },
      { skillFocus: 'Bias Direction', question: 'How would ignoring the dropouts distort her final conclusion?', options: ['It would understate fuel savings', 'It would overstate overall commuter satisfaction with cycling', 'It would shrink the distance variable to zero', 'It would have no measurable effect'], correctAnswerIndex: 1, explanation: 'Excluding frustrated distant riders leaves mostly satisfied nearby riders, overstating satisfaction.', hint: 'Check the student’s question in turn 3.' },
      { skillFocus: 'Analytical Remedy', question: 'Which three-step methodological remedy does Dr. Bergstrom prescribe?', options: ['Recruit eighteen random replacements immediately', 'Report baseline differences, apply inverse-probability weighting, and run a conservative sensitivity bound', 'Shorten the study retrospectively to one month', 'Exclude every commuter living over five kilometers away'], correctAnswerIndex: 1, explanation: 'He prescribes Table 1 baseline comparison, inverse-probability weighting, and a zero-gain sensitivity bound.', hint: 'Listen carefully to turn 4.' },
      { skillFocus: 'Attitude', question: 'How does the professor react to the student discovering this issue?', options: ['Annoyed that she delayed publication', 'Pleased with her analytical vigilance ("Sharp catch")', 'Skeptical that 18 percent attrition matters', 'Insistent that she restart data collection from scratch'], correctAnswerIndex: 1, explanation: 'He praises her diligence ("Sharp catch") and equips her with rigorous statistical adjustments.', hint: 'Notice his opening reaction in turn 4.' },
    ],
  },
  {
    audioId: 'aud-m-cv-17',
    difficulty: 'Advanced',
    cefr: 'C1',
    topic: 'Materials Lab',
    title: 'Evaluating Unexpected Thermal Drift in Battery Cells',
    contextLabel: 'Campus Conversation · Electrochemistry Lab',
    script: [
      { speaker: 'Researcher A', voiceRole: 'student-male', text: 'Look at Batch C’s fast-charge curves—internal resistance jumped twelve percent after only three hundred cycles, whereas Batch B stayed flat.' },
      { speaker: 'Researcher B', voiceRole: 'female-academic', text: 'Wait—didn’t we switch electrolyte suppliers between Batch B and Batch C when our regular vendor was backordered?' },
      { speaker: 'Researcher A', voiceRole: 'student-male', text: 'Good memory! Both bottles were labeled ninety-nine-point-nine percent pure, though Batch C’s certificate of analysis listed forty parts per million of trace moisture instead of ten.' },
      { speaker: 'Researcher B', voiceRole: 'female-academic', text: 'Aha—trace moisture reacts with the lithium salt to form hydrofluoric acid, etching the cathode surface. Let’s dry the remaining Batch C solvent over molecular sieves overnight and re-build three verification coin cells.' },
    ],
    questions: [
      { skillFocus: 'Experimental Anomaly', question: 'What unexpected behavior appeared in Batch C battery cells?', options: ['They charged twice as fast as Batch B', 'Internal resistance spiked 12 percent after only 300 cycles', 'Their casings leaked electrolyte immediately', 'They refused to discharge below room temperature'], correctAnswerIndex: 1, explanation: 'Batch C’s internal resistance jumped 12% after 300 cycles while Batch B stayed flat.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Hidden Variable', question: 'What subtle difference distinguished the backup electrolyte supplier from the regular vendor?', options: ['A completely different lithium salt', 'Forty parts per million of trace moisture versus ten ppm despite identical 99.9% headline purity', 'Expired manufacturing dates', 'Plastic bottles instead of amber glass'], correctAnswerIndex: 1, explanation: 'Both claimed 99.9% purity, but Batch C held 40 ppm moisture instead of 10 ppm.', hint: 'Check turn 3.' },
      { skillFocus: 'Chemical Mechanism', question: 'How does trace moisture harm battery longevity according to Researcher B?', options: ['It freezes inside the separator', 'It reacts with lithium salt to generate hydrofluoric acid that etches the cathode', 'It dilutes copper foil conductivity', 'It blocks external charging leads'], correctAnswerIndex: 1, explanation: 'Trace water forms hydrofluoric acid, etching the cathode surface and raising resistance.', hint: 'Listen to the start of turn 4.' },
      { skillFocus: 'Verification Test', question: 'How will they confirm moisture was the sole culprit?', options: ['Discard both batches completely', 'Dry Batch C solvent over molecular sieves overnight and rebuild three verification coin cells', 'Charge Batch B at double voltage', 'Send the battery cycler out for calibration'], correctAnswerIndex: 1, explanation: 'Drying the same solvent over molecular sieves and testing 3 new coin cells directly isolates moisture.', hint: 'Catch the closing test plan.' },
    ],
  },
  {
    audioId: 'aud-m-cv-18',
    difficulty: 'Advanced',
    cefr: 'C1',
    topic: 'Architecture Studio',
    title: 'Revising a Mass-Timber Acoustic Floor Assembly',
    contextLabel: 'Campus Conversation · Architecture Jury Prep',
    script: [
      { speaker: 'Student', voiceRole: 'student-female', text: 'Professor Sato, my cross-laminated timber housing studio celebrates exposed spruce ceilings—yet our structural consultant warned that bare timber slabs transmit footstep thuds downstairs.' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Very common mass-timber pitfall! Lightweight wood transmits low-frequency impact vibration far more readily than heavy poured concrete.' },
      { speaker: 'Student', voiceRole: 'student-female', text: 'If I cover the ceiling underneath with drywall, I lose the warm wood aesthetic completely. Is there a way to fix acoustics from the top side instead?' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Yes—lay a thin recycled-rubber acoustic mat topped with forty millimeters of gypsum concrete screed above the structural timber panel. You keep the exposed spruce ceiling below while meeting top residential sound ratings.' },
    ],
    questions: [
      { skillFocus: 'Design Conflict', question: 'What technical issue threatens the student’s exposed-spruce apartment ceiling?', options: ['Spruce fails fire-code structural loads', 'Bare lightweight mass-timber slabs transmit low-frequency footstep noise downstairs', 'Spruce warps in dry winter heating', 'Local mills cannot supply long panels'], correctAnswerIndex: 1, explanation: 'Lightweight timber conducts impact footstep vibration much more easily than heavy concrete.', hint: 'Listen to turns 1 and 2.' },
      { skillFocus: 'Aesthetic Constraint', question: 'Why does the student want to avoid hanging drywall underneath the ceiling?', options: ['Drywall is prohibitively expensive', 'It would conceal the warm exposed wood ceiling central to her studio concept', 'Drywall adds excessive ceiling height', 'Drywall amplifies impact noise'], correctAnswerIndex: 1, explanation: 'Covering the underside hides the exposed spruce aesthetic she wants to celebrate.', hint: 'Check turn 3.' },
      { skillFocus: 'Engineering Solution', question: 'What top-side floor assembly solves footstep noise while preserving exposed wood below?', options: ['Thick wool rugs stapled directly to beams', 'A recycled-rubber acoustic mat beneath 40 mm of gypsum concrete screed atop the timber slab', 'Doubling the spruce plank thickness alone', 'Installing sound-masking white-noise speakers'], correctAnswerIndex: 1, explanation: 'Decoupling with a rubber mat plus mass from a 40 mm gypsum screed stops impact noise from above.', hint: 'Listen carefully to turn 4.' },
      { skillFocus: 'Physical Principle', question: 'Why does mass timber behave worse than poured concrete on footstep vibration?', options: ['Because wood is much lighter than concrete, offering less inertial mass against low-frequency impacts', 'Because timber panels contain hollow steel pipes', 'Because concrete absorbs sound like open foam', 'Because spruce expands under footsteps'], correctAnswerIndex: 0, explanation: 'Professor Sato attributes impact transmission directly to lightweight wood versus heavy concrete.', hint: 'Check turn 2.' },
    ],
  },
  {
    audioId: 'aud-m-cv-19',
    difficulty: 'Advanced',
    cefr: 'C1',
    topic: 'Clinical Ethics',
    title: 'Designing Plain-Language Consent Forms for Community Health',
    contextLabel: 'Campus Conversation · Public Health Practicum',
    script: [
      { speaker: 'Student', voiceRole: 'student-male', text: 'Dr. Osei, our mobile clinic’s blood-pressure screening consent form currently runs six pages of dense legal phrasing—patients just flip to the back and sign without reading.' },
      { speaker: 'Supervisor', voiceRole: 'female-academic', text: 'That defeats the entire ethical purpose of informed consent. If people don’t understand what they’re signing, a signature is just paperwork theater.' },
      { speaker: 'Student', voiceRole: 'student-male', text: 'Could we put a one-page visual summary up front—covering purpose, data privacy, and the right to withdraw in sixth-grade plain language—while keeping full statutory clauses attached behind?' },
      { speaker: 'Supervisor', voiceRole: 'female-academic', text: 'Yes! That "key-information front sheet" actually aligns directly with revised federal IRB standards. Pilot it with five clinic patients tomorrow and ask them to explain the study back in their own words.' },
    ],
    questions: [
      { skillFocus: 'Core Problem', question: 'What practical failure occurs with the clinic’s current six-page consent form?', options: ['Patients refuse to participate altogether', 'Patients skip the dense legal prose and sign blindly without genuine comprehension', 'Printing six pages costs too much ink', 'Doctors misplace page six routinely'], correctAnswerIndex: 1, explanation: 'Dense legal wording causes patients to flip straight to the signature line unread.', hint: 'Listen to turns 1 and 2.' },
      { skillFocus: 'Proposed Redesign', question: 'How does the student propose improving comprehension while remaining legally compliant?', options: ['Eliminating written consent entirely', 'Adding a plain-language one-page visual summary in front of the full statutory clauses', 'Reading all six legal pages aloud rapidly', 'Replacing signatures with verbal phone recordings'], correctAnswerIndex: 1, explanation: 'He proposes a sixth-grade plain-language key-information front sheet ahead of full statutory clauses.', hint: 'Check turn 3.' },
      { skillFocus: 'Validation Test', question: 'How does Dr. Osei instruct the student to verify whether the revised summary genuinely works?', options: ['Run it through a legal dictionary checker', 'Pilot it with five clinic patients and ask them to teach back the study in their own words', 'Compare word count against neighboring hospitals', 'Have three lawyers sign off on the typography'], correctAnswerIndex: 1, explanation: 'Asking five patients to explain the study back ("teach-back") directly tests real-world understanding.', hint: 'Listen to the closing sentence.' },
      { skillFocus: 'Vocabulary in Context', question: 'What does Dr. Osei mean by calling unread signatures "paperwork theater"?', options: ['Patients enjoy dramatic brochures', 'Going through the outward motion of compliance without achieving genuine informed understanding', 'Clinic staff rehearse scripts like actors', 'Forms are stored inside a campus theater'], correctAnswerIndex: 1, explanation: 'Signing an unread form satisfies superficial bureaucracy while failing the ethical substance of informed consent.', hint: 'Connect "defeats the entire ethical purpose" with "paperwork theater".' },
    ],
  },
  {
    audioId: 'aud-m-cv-20',
    difficulty: 'Advanced',
    cefr: 'C1',
    topic: 'Environmental Law',
    title: 'Evaluating Wetland Mitigation Banking Credits',
    contextLabel: 'Campus Conversation · Environmental Policy Clinic',
    script: [
      { speaker: 'Law Student', voiceRole: 'student-female', text: 'Professor Novak, a highway developer wants to fill three acres of urban marsh here and offset it by buying six acres of mitigation credits forty miles upriver. Doesn’t two-for-one acreage sound like a net ecological win?' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'On paper, maybe—yet hydrology isn’t interchangeable like dollars in a checking account. Ask what specific ecosystem services those three urban acres perform right here.' },
      { speaker: 'Law Student', voiceRole: 'student-female', text: 'Wait—this urban marsh buffers storm surge right beside two low-income neighborhoods, whereas the upriver bank sits in rural pastureland.' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Exactly. Moving flood-storage acreage forty miles upstream may satisfy a raw acreage ratio while stripping flood protection from local residents. Frame your public comment around watershed-service equivalence, not just raw square footage.' },
    ],
    questions: [
      { skillFocus: 'Core Proposal', question: 'What offset deal is the highway developer proposing?', options: ['Rebuilding the marsh directly underneath the highway', 'Filling 3 acres of urban marsh in exchange for 6 acres of mitigation credits 40 miles upriver', 'Paying cash fines directly to neighborhood homeowners', 'Rerouting the highway entirely around the county'], correctAnswerIndex: 1, explanation: 'The developer proposes trading 3 urban acres for 6 rural mitigation acres 40 miles upstream.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Analytical Critique', question: 'Why does Professor Novak reject treating wetland acres like interchangeable dollars?', options: ['Because rural land is always polluted', 'Because location-specific services like local flood buffering do not transfer 40 miles away', 'Because two-for-one ratios are illegal under federal law', 'Because upriver marshes hold no wildlife'], correctAnswerIndex: 1, explanation: 'Ecosystem services such as urban storm-surge buffering are tied to exact watershed location.', hint: 'Listen to turns 2 through 4.' },
      { skillFocus: 'Equity Impact', question: 'Who loses critical protection if the mitigation shifts 40 miles upriver?', options: ['Rural pasture owners', 'Two nearby low-income urban neighborhoods currently buffered from storm surge', 'Interstate freight drivers', 'Upriver kayak outfitters'], correctAnswerIndex: 1, explanation: 'The urban marsh specifically shields two adjacent low-income neighborhoods from storm surge.', hint: 'Check turn 3.' },
      { skillFocus: 'Advocacy Strategy', question: 'What concept does Professor Novak advise centering in the student’s public comment?', options: ['Demanding a ten-for-one rural acreage ratio', 'Watershed-service equivalence rather than raw acreage ratios', 'Stopping all bridge maintenance statewide', 'Estimating asphalt material costs'], correctAnswerIndex: 1, explanation: 'He advises arguing for watershed-service equivalence rather than raw square footage.', hint: 'Catch the final sentence.' },
    ],
  },
  {
    audioId: 'aud-m-cv-21',
    difficulty: 'Expert',
    cefr: 'C2',
    topic: 'Astrophysics',
    title: 'Separating Stellar Spots From Exoplanet Signals',
    contextLabel: 'Campus Conversation · Observatory Data Review',
    script: [
      { speaker: 'Postdoc', voiceRole: 'student-male', text: 'Dr. Vega, our radial-velocity pipeline flagged a tantalizing twelve-day periodic wobble around that red dwarf star—matching an Earth-mass habitable-zone planet.' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Hold the champagne for a minute! Twelve days is awfully close to typical rotation periods for active M-dwarfs. Could dark rotating starspots be mimicking a planetary tug?' },
      { speaker: 'Postdoc', voiceRole: 'student-male', text: 'Good intuition—let me overlay the chromospheric calcium emission index and infrared spectra. Look: the twelve-day signal stays rock-solid in the infrared, whereas starspot contrast drops sharply at longer wavelengths.' },
      { speaker: 'Advisor', voiceRole: 'female-academic', text: 'Now that’s compelling! Wavelength-invariant Doppler amplitude is the cleanest signature of genuine gravitational pull. Write up a follow-up request for simultaneous optical and near-infrared epochs so referees see it airtight.' },
    ],
    questions: [
      { skillFocus: 'False-Positive Risk', question: 'Why is Dr. Vega initially cautious about the 12-day radial-velocity signal?', options: ['Twelve days is too long for an M-dwarf orbit', 'Dark starspots rotating on an active red dwarf can mimic a 12-day planetary wobble', 'The spectrograph mirror was misaligned', 'Earth-mass planets cannot orbit red dwarfs'], correctAnswerIndex: 1, explanation: 'Active M-dwarf rotation periods often sit near 12 days, letting rotating starspots impersonate planets.', hint: 'Listen to turn 2.' },
      { skillFocus: 'Diagnostic Test', question: 'Why does comparing optical and infrared Doppler amplitudes distinguish real planets from starspots?', options: ['Planets disappear completely in infrared wavelengths', 'Gravitational tug is wavelength-invariant, whereas starspot contrast weakens sharply in the infrared', 'Infrared telescopes block red dwarf gravity', 'Starspots move twice as fast in infrared light'], correctAnswerIndex: 1, explanation: 'True gravitational pull shifts all wavelengths equally, whereas cooler starspots produce smaller signals in the infrared.', hint: 'Listen closely to turns 3 and 4.' },
      { skillFocus: 'Result Interpretation', question: 'What convinced Dr. Vega that the candidate signal merits serious follow-up?', options: ['The twelve-day signal vanished completely in the infrared', 'The signal remained steady in the infrared alongside calcium index checks', 'A second star eclipsed the red dwarf', 'The postdoc reduced the data sample by half'], correctAnswerIndex: 1, explanation: 'Constant amplitude into the infrared indicates genuine gravitational pull rather than spot contrast.', hint: 'Check turns 3 and 4.' },
      { skillFocus: 'Next Step', question: 'What follow-up observation does Dr. Vega recommend to satisfy peer referees?', options: ['Publish immediately without extra epochs', 'Request simultaneous optical and near-infrared observing epochs', 'Switch to a radio dish array', 'Remove calcium emission indices from the paper'], correctAnswerIndex: 1, explanation: 'Simultaneous optical and near-infrared observations make wavelength invariance airtight for referees.', hint: 'Listen to the closing sentence.' },
    ],
  },
  {
    audioId: 'aud-m-cv-22',
    difficulty: 'Expert',
    cefr: 'C2',
    topic: 'Paleoclimatology',
    title: 'Calibrating Tree-Ring Widths Against Divergence',
    contextLabel: 'Campus Conversation · Dendrochronology Lab',
    script: [
      { speaker: 'PhD Candidate', voiceRole: 'student-female', text: 'Professor Lindstrom, our subarctic spruce ring-width series tracks summer temperature closely from 1880 to 1965, yet after 1970 ring growth flattens out even as station thermometers climb.' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'You’ve run straight into the classic boreal "divergence problem." Warming above a moisture threshold dries shallow permafrost soils, so trees become drought-stressed rather than strictly temperature-limited.' },
      { speaker: 'PhD Candidate', voiceRole: 'student-female', text: 'Does that mean ring widths can’t reconstruct medieval warmth reliably at this site?' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Pair total ring width with maximum latewood density measured by X-ray densitometry. Latewood cell-wall thickness responds far more purely to late-summer warmth and shows minimal post-1970 moisture divergence.' },
    ],
    questions: [
      { skillFocus: 'Phenomenon', question: 'What is the "divergence problem" observed in the subarctic spruce cores?', options: ['Two neighboring trees grew at opposite seasons', 'Tree-ring widths stopped tracking rising summer temperatures after 1970 due to warming-induced moisture stress', 'Thermometer stations broke down in 1965', 'Spruce roots stopped absorbing carbon dioxide completely'], correctAnswerIndex: 1, explanation: 'Warmer soils dry shallow permafrost, shifting trees from temperature limitation to drought limitation after 1970.', hint: 'Listen to turns 1 and 2.' },
      { skillFocus: 'Causal Mechanism', question: 'Why did warmer summers eventually flatten tree growth instead of speeding it up?', options: ['Higher warmth triggered drought stress in shallow soils', 'Winter snowpack buried spruce saplings permanently', 'Air pollution darkened spruce needles', 'Cold ocean currents cooled the subarctic after 1970'], correctAnswerIndex: 0, explanation: 'Warming past a threshold dries shallow permafrost soils, imposing moisture stress.', hint: 'Check turn 2.' },
      { skillFocus: 'Methodological Fix', question: 'Which complementary tree-ring measurement overcomes moisture divergence?', options: ['Counting bark fissures manually', 'Measuring maximum latewood cell-wall density via X-ray densitometry', 'Averaging only seedlings under ten years old', 'Replacing spruce with tropical palms'], correctAnswerIndex: 1, explanation: 'Maximum latewood density responds cleanly to late-summer temperature with minimal moisture divergence.', hint: 'Listen carefully to turn 4.' },
      { skillFocus: 'Inference', question: 'Why is solving divergence vital for reconstructing medieval temperatures?', options: ['Because medieval records lacked X-ray machines', 'Because if a proxy loses sensitivity under warmth, it might misestimate past warm epochs too', 'Because spruce trees did not exist in the Middle Ages', 'Because thermometers already cover the year 1000'], correctAnswerIndex: 1, explanation: 'Uncalibrated sensitivity loss under warm conditions casts doubt on reconstructing earlier warm intervals.', hint: 'Connect turn 3’s question to turn 4’s solution.' },
    ],
  },
  {
    audioId: 'aud-m-cv-23',
    difficulty: 'Expert',
    cefr: 'C2',
    topic: 'Monetary Economics',
    title: 'Evaluating Forward Guidance Credibility Under Supply Shocks',
    contextLabel: 'Campus Conversation · Macroeconomics Workshop',
    script: [
      { speaker: 'Grad Student', voiceRole: 'student-male', text: 'Professor Vance, why did bond yields spike right after the central bank promised to keep policy rates low for two years—isn’t forward guidance supposed to calm long-term rates?' },
      { speaker: 'Professor', voiceRole: 'female-academic', text: 'Only when bond traders distinguish "Odyssean" commitment from "Delphic" forecasting—and only if they believe inflation won’t break out.' },
      { speaker: 'Grad Student', voiceRole: 'student-male', text: 'So if energy prices are already surging and the bank promises flat rates anyway, markets infer the bank is falling behind the curve and price in higher future inflation premiums?' },
      { speaker: 'Professor', voiceRole: 'male-academic', text: 'Wait—let me chime in from the empirical side too: state-contingent guidance tied explicitly to realized inflation thresholds anchors yields far better than rigid calendar dates that turn stale when supply shocks hit.' },
    ],
    questions: [
      { skillFocus: 'Paradox', question: 'What counterintuitive market reaction puzzled the graduate student?', options: ['Stocks plunged when taxes were cut', 'Long-term bond yields rose right after the central bank promised low rates for two years', 'Energy prices collapsed after a storm', 'Currency reserves vanished overnight'], correctAnswerIndex: 1, explanation: 'Bond yields jumped despite a promise of two years of low policy rates.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Market Logic', question: 'Why can promising low rates during an energy shock push bond yields UP?', options: ['Traders assume the bank is falling behind inflation and demand higher future inflation premiums', 'Bond investors prefer paying higher taxes', 'Energy companies stop issuing corporate debt', 'Low rates mechanically force yields upward immediately'], correctAnswerIndex: 0, explanation: 'If markets doubt inflation control, they demand higher long-term inflation compensation.', hint: 'Listen to turn 3.' },
      { skillFocus: 'Policy Refinement', question: 'What type of forward guidance performs better when supply shocks arrive?', options: ['Rigid multi-year calendar promises', 'State-contingent guidance tied to explicit realized inflation thresholds', 'Zero public communication between meetings', 'Publishing daily stock-market targets'], correctAnswerIndex: 1, explanation: 'State-contingent guidance linked to explicit economic thresholds adapts cleanly when shocks hit.', hint: 'Check turn 4.' },
      { skillFocus: 'Contrast', question: 'What weakness makes rigid calendar-based guidance brittle?', options: ['Traders cannot read calendars accurately', 'Fixed calendar dates become outdated as soon as unexpected supply shocks alter inflation trajectories', 'Calendar guidance is illegal under central bank charters', 'It forces weekly policy meetings'], correctAnswerIndex: 1, explanation: 'Turn 4 notes rigid calendar dates turn stale rapidly when supply shocks hit.', hint: 'Listen to the closing clause.' },
    ],
  },
  {
    audioId: 'aud-m-cv-24',
    difficulty: 'Expert',
    cefr: 'C2',
    topic: 'Bioinformatics',
    title: 'Mitigating Batch Effects in Multi-Hospital RNA Sequencing',
    contextLabel: 'Campus Conversation · Computational Biology Core',
    script: [
      { speaker: 'Analyst', voiceRole: 'student-female', text: 'Dr. Deshmukh, our clustering plot splits patient tumor biopsies into two gorgeous, non-overlapping groups—I thought we’d discovered a novel molecular subtype!' },
      { speaker: 'PI', voiceRole: 'female-academic', text: 'Before we celebrate, color those dots by collection hospital and library-prep kit date.' },
      { speaker: 'Analyst', voiceRole: 'student-female', text: 'Oh no—Group One is almost exclusively Hospital North samples processed in January, and Group Two is Hospital South processed in March. That’s a textbook batch effect!' },
      { speaker: 'PI', voiceRole: 'female-academic', text: 'Painful moment, yet catching it now just saved us from publishing a phantom subtype. Because hospital site isn’t completely confounded with clinical stage, we can apply empirical Bayes batch correction and verify whether any true biological clusters survive.' },
    ],
    questions: [
      { skillFocus: 'False Discovery', question: 'What did the two sharply separated clusters actually represent?', options: ['Two previously unknown cancer subtypes', 'A technical batch effect separating Hospital North January samples from Hospital South March samples', 'Male versus female patient biopsies', 'High-cost versus low-cost sequencing machines only'], correctAnswerIndex: 1, explanation: 'Coloring by site and prep date exposed a classic technical batch artifact.', hint: 'Listen to turns 2 and 3.' },
      { skillFocus: 'Diagnostic Habit', question: 'What immediate sanity check did Dr. Deshmukh ask the analyst to run?', options: ['Double the clustering iterations', 'Color data points by collection hospital and library-prep date', 'Delete the smallest twenty samples', 'Submit the figure directly to a journal'], correctAnswerIndex: 1, explanation: 'Visualizing technical covariates (hospital, prep date) immediately tests for batch confounding.', hint: 'Check turn 2.' },
      { skillFocus: 'Statistical Feasibility', question: 'Why is empirical Bayes batch correction still statistically viable on this dataset?', options: ['Because all samples came from identical healthy volunteers', 'Because hospital site is not completely confounded with clinical disease stage', 'Because Hospital North re-sequenced every biopsy', 'Because empirical Bayes requires no hospital metadata'], correctAnswerIndex: 1, explanation: 'Incomplete confounding between site and clinical stage allows separating technical batch noise from biological signal.', hint: 'Listen closely to sentence 2 of turn 4.' },
      { skillFocus: 'Tone', question: 'How does Dr. Deshmukh frame this setback?', options: ['As a career-ending mistake', 'As a painful yet crucial catch that prevented publishing a false biological claim', 'As proof that RNA sequencing is unreliable', 'As a reason to ignore Hospital South permanently'], correctAnswerIndex: 1, explanation: 'She stresses catching the artifact early saved the lab from publishing a phantom subtype.', hint: 'Check the start of turn 4.' },
    ],
  },
  {
    audioId: 'aud-m-cv-25',
    difficulty: 'Expert',
    cefr: 'C2',
    topic: 'Museum Conservation',
    title: 'Debating Overpaint Removal on a Renaissance Panel',
    contextLabel: 'Campus Conversation · Conservation Studio',
    script: [
      { speaker: 'Conservator', voiceRole: 'male-academic', text: 'Beatrice, our X-ray fluorescence map confirms that the heavy dark cloak over the kneeling figure was added in the 1780s—underneath sits the original bright vermilion robe.' },
      { speaker: 'Curator', voiceRole: 'female-academic', text: 'Tempting as it is to reveal the sixteenth-century vermilion, how intact is the original paint film underneath? Sometimes later overpaint hides severe abrasion.' },
      { speaker: 'Conservator', voiceRole: 'male-academic', text: 'Infrared scans show roughly eighty-five percent of the vermilion intact, though there’s a five-centimeter loss along the lower hem where wood panels joined.' },
      { speaker: 'Curator', voiceRole: 'female-academic', text: 'Let’s convene our ethics committee before lifting a single millimeter. If we remove the eighteenth-century cloak, we must document it completely in high-resolution multispectral archives and infill the hem loss using reversible hatched retouching.' },
    ],
    questions: [
      { skillFocus: 'Technical Discovery', question: 'What did X-ray fluorescence mapping uncover beneath the painting’s surface?', options: ['A hidden signature from the nineteenth century', 'An original sixteenth-century bright vermilion robe concealed beneath 1780s dark overpaint', 'Severe insect tunneling across the entire canvas', 'Modern acrylic paint added last decade'], correctAnswerIndex: 1, explanation: 'A 1780s dark cloak covers an original bright vermilion robe.', hint: 'Listen to turn 1.' },
      { skillFocus: 'Professional Caution', question: 'Why does the curator hesitate before approving immediate overpaint removal?', options: ['She prefers dark eighteenth-century colors', 'Later overpaint sometimes conceals severe damage or abrasion underneath', 'The museum cannot afford X-ray equipment', 'Removing overpaint takes less than one hour'], correctAnswerIndex: 1, explanation: 'She warns that removing historical overpaint can expose damaged or abraded original layers.', hint: 'Check turn 2.' },
      { skillFocus: 'Condition Detail', question: 'What did infrared imaging reveal about the state of the original vermilion layer?', options: ['It was completely erased', 'About 85 percent remains intact, with a 5-cm loss along the lower panel join', 'Only the sleeve survives intact', 'It was painted in water-soluble gouache'], correctAnswerIndex: 1, explanation: 'Roughly 85% is intact except for a 5-cm loss along the lower hem panel join.', hint: 'Listen to turn 3.' },
      { skillFocus: 'Ethical Protocol', question: 'What safeguards does the curator require if the committee approves removing the 1780s cloak?', options: ['Painting over the hem loss with permanent oil', 'Full multispectral archival documentation of the cloak and reversible hatched retouching for the hem loss', 'Hiding the removal from public exhibition labels', 'Selling the removed pigment samples'], correctAnswerIndex: 1, explanation: 'She requires ethics-committee review, complete multispectral archiving of the overpaint, and reversible hatched infill.', hint: 'Read turn 4 carefully.' },
    ],
  },
];

let runningIdx = 0;

export const LISTENING_CONVERSATION_MASTER: ListeningQuestion[] =
  CONVERSATION_BUNDLES.flatMap((bundle) =>
    bundle.questions.map((q) => {
      runningIdx += 1;
      const shift = (runningIdx * 3 + 2) % 4;
      const rotatedOptions = [
        q.options[(0 + shift) % 4],
        q.options[(1 + shift) % 4],
        q.options[(2 + shift) % 4],
        q.options[(3 + shift) % 4],
      ];
      const rotatedCorrect = (q.correctAnswerIndex - shift + 4) % 4;
      return {
        id: `ls-m-cv-${String(runningIdx).padStart(3, '0')}`,
        section: 'listening',
        taskType: 'listen-conversation',
        difficulty: bundle.difficulty,
        topic: bundle.topic,
        learningObjective:
          'Comprehend multi-turn campus and academic dialogues for speaker intent, troubleshooting details, policy constraints, and next steps.',
        skillFocus: q.skillFocus,
        estimatedTimeSec: 50,
        keywords: [bundle.topic.toLowerCase(), 'conversation', q.skillFocus.toLowerCase()],
        cefr: bundle.cefr,
        sourceType: 'curated',
        reviewStatus: 'verified',
        scoreWeight: 1,
        audioId: `${bundle.audioId}-q${((runningIdx - 1) % 4) + 1}`,
        title: bundle.title,
        contextLabel: bundle.contextLabel,
        script: bundle.script,
        question: q.question,
        options: rotatedOptions,
        correctAnswerIndex: rotatedCorrect,
        explanation: q.explanation,
        hint: q.hint,
        packId: PACK_ID,
      };
    })
  );
