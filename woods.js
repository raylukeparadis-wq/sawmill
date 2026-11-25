// Wood species and the sawyer's rules for cutting them, in layers.
// Layer 1: wood group. Layer 2: species in that group. Layer 3: condition.
// Each layer narrows the next and adds its own cutting rules.
// Janka hardness in lbf, approximate published values for each species.

// Sawyer's rules that hold for every log.
const SAWYER_RULES=[
  'Feed by the engine: keep it near full speed. If it bogs, back off the feed.',
  'Watch the sawdust. Fine powder means a dull blade or too slow a feed; you want coarse chips.',
  'A wavy board means the blade is dull, under-tensioned or fed too fast. Fix it before the next cut.',
  'Open the log on its best face, then turn it to saw for grade.',
  'Take the blade tension off at the end of the day.'
];

const WOOD_GROUPS={
  soft:{name:'Softwood',hook:'10–12°',k:0.055,
    rules:['Run a 10–12° hook blade; it clears the long fibers fast.',
      'Pitch builds up on the blade. Run water with a squirt of dish soap; add a little diesel or windshield washer fluid for heavy pitch.']},
  med:{name:'Medium hardwood',hook:'10°',k:0.08,
    rules:['A standard 10° hook blade works well.',
      'Water lube is usually enough.']},
  hard:{name:'Hard hardwood',hook:'8–10°',k:0.115,
    rules:['Use an 8–10° hook blade, or a 10° blade kept very sharp.',
      'Swap blades every 2–3 hours of cutting; a dull blade dives and makes wavy boards.',
      'Water lube keeps the blade cool and the gullets clean.']},
  xhard:{name:'Very hard',hook:'4–8°',k:0.15,
    rules:['Use a low-hook blade (4–8°) and expect to change blades often.',
      'Feed slowly and steadily; let the engine hold its speed.',
      'Tension the blade fully and check the guides before each log.']}
};

const SPECIES=[
  // softwoods
  {id:'wpine',g:'soft',name:'Eastern white pine',janka:380},
  {id:'wrcedar',g:'soft',name:'Western red cedar',janka:350},
  {id:'spruce',g:'soft',name:'Spruce',janka:510},
  {id:'hemlock',g:'soft',name:'Eastern hemlock',janka:500,note:'Hemlock often has ring shake; check log ends.'},
  {id:'cypress',g:'soft',name:'Bald cypress',janka:510},
  {id:'tamarack',g:'soft',name:'Tamarack (larch)',janka:590},
  {id:'dfir',g:'soft',name:'Douglas fir',janka:660},
  {id:'syp',g:'soft',name:'Southern yellow pine',janka:690,note:'Very pitchy. Use the soap-and-diesel lube mix.'},
  {id:'ercedar',g:'soft',name:'Eastern red cedar',janka:900,note:'Small, knotty logs; saw slowly through knots.'},
  // medium hardwoods
  {id:'aspen',g:'med',name:'Aspen',janka:350,note:'Fuzzy grain; a sharp blade matters more than speed.'},
  {id:'basswood',g:'med',name:'Basswood',janka:410},
  {id:'cottonwood',g:'med',name:'Cottonwood',janka:430,note:'Wet and stringy; it can bind the blade. Use plenty of water.'},
  {id:'butternut',g:'med',name:'Butternut',janka:490},
  {id:'poplar',g:'med',name:'Yellow poplar (tulip)',janka:540},
  {id:'sycamore',g:'med',name:'Sycamore',janka:770},
  {id:'elm',g:'med',name:'American elm',janka:830,note:'Interlocked grain; boards can twist. Saw and stack promptly.'},
  {id:'sweetgum',g:'med',name:'Sweetgum',janka:850},
  {id:'smaple',g:'med',name:'Soft (red) maple',janka:950},
  {id:'cherry',g:'med',name:'Black cherry',janka:950},
  {id:'walnut',g:'med',name:'Black walnut',janka:1010,note:'Yard trees often hide nails and fence wire. Use a metal detector.'},
  // hard hardwoods
  {id:'ybirch',g:'hard',name:'Yellow birch',janka:1260},
  {id:'roak',g:'hard',name:'Red oak',janka:1290},
  {id:'beech',g:'hard',name:'American beech',janka:1300},
  {id:'ash',g:'hard',name:'White ash',janka:1320},
  {id:'woak',g:'hard',name:'White oak',janka:1360},
  {id:'hmaple',g:'hard',name:'Hard (sugar) maple',janka:1450},
  // very hard
  {id:'hlocust',g:'xhard',name:'Honey locust',janka:1580},
  {id:'blocust',g:'xhard',name:'Black locust',janka:1700,note:'Very abrasive; plan on a fresh blade per log on big logs.'},
  {id:'pecan',g:'xhard',name:'Pecan',janka:1820},
  {id:'hophorn',g:'xhard',name:'Hophornbeam (ironwood)',janka:1860},
  {id:'hickory',g:'xhard',name:'Shagbark hickory',janka:1880},
  {id:'persimmon',g:'xhard',name:'Persimmon',janka:2300},
  {id:'osage',g:'xhard',name:'Osage orange',janka:2760,note:'Hardest common US wood. Saw at half speed and expect short blade life.'}
];

const WOOD_CONDITIONS={
  green:{name:'Green (freshly cut)',m:1,rules:['Green logs saw easiest. Mill within a few months of felling.']},
  dry:{name:'Air-dried log (cut a year or more)',m:1.25,
    rules:['Dry wood takes about 25% more power. Expect slower feed and duller blades sooner.']},
  frozen:{name:'Frozen',m:1.4,
    rules:['Frozen wood takes about 40% more power. Use a 4–7° hook blade and less blade set.',
      'Use windshield washer fluid instead of water so the lube doesn\'t freeze on the blade.']}
};

// Cutting energy, HP-minutes per cubic inch of kerf. Rises with Janka hardness.
// At the group averages this matches the group factors above.
function speciesK(sp,cond){
  return (0.03+0.00006*sp.janka)*(WOOD_CONDITIONS[cond]||WOOD_CONDITIONS.green).m;
}

function speciesIn(g){return SPECIES.filter(s=>s.g===g)}

// Resolve the three layers, keeping each choice valid for the layer above it.
function woodPick(){
  const g=WOOD_GROUPS[S.woodG]?S.woodG:'hard';
  const list=speciesIn(g);
  const sp=list.find(s=>s.id===S.woodS)||list[0];
  const cond=WOOD_CONDITIONS[S.woodC]?S.woodC:'green';
  // Frozen wood overrides the group's hook-angle rule (always the first one).
  const groupRules=cond==='frozen'?WOOD_GROUPS[g].rules.slice(1):WOOD_GROUPS[g].rules;
  const rules=[...groupRules,...WOOD_CONDITIONS[cond].rules];
  if(sp.note)rules.push(sp.note);
  rules.push(...SAWYER_RULES);
  return{g,sp,cond,list,rules,k:speciesK(sp,cond)};
}
