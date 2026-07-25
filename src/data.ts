// Mocked "elevation engine" for demo purposes.
// In the real app this is a FastAPI service that retrieves curated library
// entries and calls a local/hosted LLM. Here we just match keywords against
// a few canned example plans so the whole flow works with zero backend.

export type OutputType = 'delta' | 'rewrite'

export interface ElevationPlan {
  id: string
  dishName: string
  outputType: OutputType
  summary: string
  libraryMatches: string[] // curated library entries used as "grounding"
  changes: string[] // used when outputType === 'delta'
  steps: string[] // used when outputType === 'rewrite' (or as extra detail for delta)
  equipment: string[]
  plating: string
  createdAt: string
}

export interface HistoryEntry {
  input: string
  goal: string
  plan: ElevationPlan
}

interface ExampleDish {
  id: string
  label: string
  keywords: string[]
  sampleInput: string
  sampleGoal: string
  plan: Omit<ElevationPlan, 'id' | 'createdAt'>
}

export const EXAMPLE_DISHES: ExampleDish[] = [
  {
    id: 'salmon',
    label: 'Pan-Seared Salmon',
    keywords: ['salmon', 'fish'],
    sampleInput:
      'I pan-sear salmon fillets in a hot skillet with salt, pepper, and a squeeze of lemon.',
    sampleGoal: 'Make it feel like a dinner-party centerpiece.',
    plan: {
      dishName: 'Pan-Seared Salmon',
      outputType: 'delta',
      summary:
        'Your technique is solid — the upgrade is about precision doneness, a built sauce instead of a squeeze of lemon, and a deliberate plate.',
      libraryMatches: ['Sous Vide Finishing', 'Pan Sauce Reduction', 'Rule-of-Thirds Plating'],
      changes: [
        'Swap the direct sear-only method for a sous vide finish (108°F / 42°C, 30 min) before a 60-second hard sear skin-side down — guarantees edge-to-edge doneness.',
        'Build a beurre blanc (shallot, white wine, butter) instead of a lemon squeeze — same acidity, far more depth.',
        'Rest the fillet 2 minutes off heat before plating so the sauce doesn\'t break.',
        'Finish with a few drops of good olive oil and flaky salt right before serving, not during cooking.',
      ],
      steps: [
        'Sous vide the salmon at 108°F for 30 minutes.',
        'Pat dry, sear skin-side down in a smoking-hot pan for 60 seconds.',
        'Reduce shallots + white wine, mount with cold butter off heat for the beurre blanc.',
        'Rest fillet 2 minutes, then plate.',
      ],
      equipment: ['Sous vide immersion circulator', 'Cast iron or stainless skillet', 'Fine-mesh strainer (for the sauce)'],
      plating: 'Pool the beurre blanc off-center, set the fillet skin-up on top, and finish with microgreens along one edge — avoid centering the protein.',
    },
  },
  {
    id: 'piccata',
    label: 'Chicken Piccata',
    keywords: ['piccata', 'chicken'],
    sampleInput:
      'I make chicken piccata with pounded chicken breast, flour, butter, lemon, and capers over pasta.',
    sampleGoal: '',
    plan: {
      dishName: 'Chicken Piccata',
      outputType: 'rewrite',
      summary:
        'The bones of this dish are already fine-dining — this rewrite tightens the technique end-to-end so the sauce, the sear, and the plate all match the effort you\'re already putting in.',
      libraryMatches: ['Pan Sauce Reduction', 'Even Cutlet Technique', 'Starch-Water Emulsion'],
      changes: [],
      steps: [
        'Butterfly and pound chicken breasts to an even 1/4" thickness for uniform cooking.',
        'Dredge in seasoned flour, shaking off excess — this is what builds the fond for the sauce.',
        'Sear in butter + olive oil over medium-high heat, 3 minutes per side, then rest on a rack (not a plate, so it stays crisp).',
        'Deglaze the pan with white wine and chicken stock, scraping up the fond.',
        'Reduce by half, add lemon juice, capers, and a splash of pasta water for body.',
        'Mount the sauce with cold butter off heat until glossy.',
        'Return chicken to the pan just to coat, then plate over a thin bed of pasta tossed in a little of the sauce.',
      ],
      equipment: ['Meat mallet', 'Wire cooling rack', 'Wide sauté pan'],
      plating: 'Pasta first as a low bed, chicken leaning against it, sauce spooned over — not pooled underneath — with capers scattered visibly on top.',
    },
  },
  {
    id: 'pasta',
    label: 'Weeknight Pasta',
    keywords: ['pasta', 'spaghetti', 'noodles'],
    sampleInput:
      'I make a weeknight pasta with garlic, olive oil, red pepper flakes, and parmesan.',
    sampleGoal: '',
    plan: {
      dishName: 'Weeknight Aglio e Olio',
      outputType: 'delta',
      summary:
        'This is already a classic — the elevation is almost entirely about emulsion technique and finishing, not new ingredients.',
      libraryMatches: ['Starch-Water Emulsion', 'Toasted Garlic Confit'],
      changes: [
        'Slow-confit the garlic in the olive oil over low heat instead of quick-frying it — deeper flavor, no burnt bitterness.',
        'Reserve a full cup of starchy pasta water; you need more than you think for a silky emulsion.',
        'Finish the pasta IN the pan off heat, tossing vigorously while adding pasta water in small splashes until the sauce clings and turns glossy.',
        'Add parmesan off heat, in two additions, tossing between each so it doesn\'t clump.',
      ],
      steps: [],
      equipment: ['Wide, high-walled sauté pan (for tossing)'],
      plating: 'Twirl into a low nest in a warmed, wide bowl; finish with a few whole toasted garlic slices, a drizzle of raw olive oil, and cracked pepper on top.',
    },
  },
]

const GENERIC_TIPS: Omit<ElevationPlan, 'id' | 'createdAt' | 'dishName'> = {
  outputType: 'delta',
  summary:
    "We don't have a curated match for this exact dish yet, so here's a general elevation pass based on the most common upgrades: doneness precision, a built sauce, and deliberate plating.",
  libraryMatches: ['Pan Sauce Reduction', 'Rule-of-Thirds Plating'],
  changes: [
    'Season in stages (before, during, and just before serving) rather than only at the start.',
    'Build a quick pan sauce from whatever fond is left in the pan instead of serving the protein dry.',
    'Let proteins rest before slicing or plating.',
    'Plate off-center with height and one deliberate garnish instead of centering everything on the plate.',
  ],
  steps: [],
  equipment: ['A pan you already own — no new equipment needed for this pass'],
  plating: 'Use the rule of thirds: place the main element off-center, add a sauce swoosh or pool, and finish with one clear garnish.',
}

let counter = 0
function nextId() {
  counter += 1
  return `elev-${counter}`
}

export function generateElevation(input: string, goal: string, seedTime: string): ElevationPlan {
  const lower = input.toLowerCase()
  const match = EXAMPLE_DISHES.find((d) => d.keywords.some((k) => lower.includes(k)))

  if (match) {
    return { ...match.plan, id: nextId(), createdAt: seedTime }
  }

  const dishName = input.trim().length > 0 ? input.trim().slice(0, 60) : 'Your Dish'
  return { ...GENERIC_TIPS, dishName, id: nextId(), createdAt: seedTime }
}
