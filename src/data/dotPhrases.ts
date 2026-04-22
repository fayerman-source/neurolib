export interface DotPhrase {
  id: string;
  name: string;
  trigger: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  source?: string;
}

export const categories = [
  { id: 'all', name: 'All Phrases' },
  { id: 'stroke', name: 'Stroke' },
  { id: 'tia', name: 'TIA' },
  { id: 'headache', name: 'Headache' },
  { id: 'seizure', name: 'Seizure' },
  { id: 'general', name: 'General Neuro' },
] as const;

export type CategoryId = typeof categories[number]['id'];

export const dotPhrases: DotPhrase[] = [
  {
    id: 'stroke-hpi',
    name: 'Stroke HPI',
    trigger: '.strokehpi',
    category: 'stroke',
    description: 'Comprehensive stroke history of present illness',
    content: `HISTORY OF PRESENT ILLNESS:
Patient is a [AGE]-year-old [SEX] who presents with [ACUTE/CHRONIC] onset of [SYMPTOMS] starting on [DATE] at [TIME]. 

Last known well: [TIME]
Found at: [LOCATION]
Wake-up stroke: [YES/NO]

Stroke symptoms:
- Location: [RIGHT/LEFT/BILATERAL]
- Nature: [WEAKNESS/NUMBNESS/DYSARTHRIA/ATAXIA/VISION/OTHER]
- Progression: [STATIC/IMPROVING/WORSENING]

Associated symptoms:
[ ] Headache - severity [0-10]/10, onset [GRADUAL/SUDDEN]
[ ] Nausea/Vomiting
[ ] Seizure
[ ] Altered mental status

Pertinent negatives: No chest pain, no palpitations, no shortness of breath, no trauma, no prior similar episodes.

PMH/PSH:
- Prior stroke/TIA: [YES/NO - DATE]
- Atrial fibrillation: [YES/NO - if yes, on anticoagulation: YES/NO]
- Hypertension: [YES]
- Diabetes: [YES]
- Hyperlipidemia: [YES]
- Smoking: [CURRENT/FORMER/NEVER]
- Coronary artery disease: [YES/NO]`,
    tags: ['stroke', 'HPI', 'admission', 'consult'],
  },
  {
    id: 'nihss-documentation',
    name: 'NIHSS Documentation',
    trigger: '.nihssdoc',
    category: 'stroke',
    description: 'Complete NIH Stroke Scale documentation with scoring',
    content: `NIH STROKE SCALE (NIHSS)

1a. Level of Consciousness: [0-3]
  □ 0 - Alert, keenly responsive
  □ 1 - Not alert, but arousable by minor stimulation
  □ 2 - Not alert, requires repeated stimulation
  □ 3 - Reflex motor or autonomic effects

1b. LOC Questions (month, age): [0-2]
  □ 0 - Answers both correctly
  □ 1 - Answers one correctly
  □ 2 - Answers neither correctly

1c. LOC Commands (open/close eyes, grip/release): [0-2]
  □ 0 - Performs both correctly
  □ 1 - Performs one correctly
  □ 2 - Performs neither

2. Best Gaze: [0-3]
  □ 0 - Normal
  □ 1 - Partial gaze palsy
  □ 2 - Forced deviation
  □ 3 - Total gaze paresis

3. Visual Fields: [0-3]
  □ 0 - No visual loss
  □ 1 - Partial hemianopia
  □ 2 - Complete hemianopia
  □ 3 - Bilateral hemianopia

4. Facial Movement: [0-3]
  □ 0 - Normal symmetric movement
  □ 1 - Minor paralysis
  □ 2 - Partial paralysis
  □ 3 - Complete paralysis

5a. Motor Arm - Right: [0-4]
  □ 0 - No drift
  □ 1 - Drift but doesn't hit bed
  □ 2 - Some effort against gravity
  □ 3 - No effort against gravity
  □ 4 - No movement
  □ UN - Amputation/joint fusion

5b. Motor Arm - Left: [0-4]
  (same scale)

6a. Motor Leg - Right: [0-4]
  □ 0 - No drift
  □ 1 - Drift but doesn't hit bed
  □ 2 - Some effort against gravity
  □ 3 - No effort against gravity
  □ 4 - No movement
  □ UN - Amputation/joint fusion

6b. Motor Leg - Left: [0-4]
  (same scale)

7. Limb Ataxia: [0-2]
  □ 0 - Absent
  □ 1 - Present in one limb
  □ 2 - Present in two or more limbs

8. Sensory: [0-2]
  □ 0 - Normal
  □ 1 - Mild-moderate sensory loss
  □ 2 - Severe/total sensory loss

9. Best Language: [0-3]
  □ 0 - No aphasia
  □ 1 - Mild-moderate aphasia
  □ 2 - Severe aphasia
  □ 3 - Mute or global aphasia

10. Dysarthria: [0-2]
  □ 0 - Normal
  □ 1 - Mild-moderate dysarthria
  □ 2 - Severe dysarthria

11. Extinction and Inattention: [0-2]
  □ 0 - No abnormality
  □ 1 - Mild (one modality)
  □ 2 - Profound (multiple modalities)

TOTAL NIHSS SCORE: _____/42
Examiner: _________ Date/Time: _________`,
    tags: ['stroke', 'NIHSS', 'assessment', 'scoring'],
  },
  {
    id: 'tpa-eligibility',
    name: 'tPA Eligibility',
    trigger: '.tpaelig',
    category: 'stroke',
    description: 'tPA (alteplase) eligibility checklist',
    content: `IV TISSUE PLASMINOGEN ACTIVATOR (tPA) ELIGIBILITY CHECKLIST

INCLUSION CRITERIA:
□ Age ≥ 18 years
□ Clinical diagnosis of acute ischemic stroke
□ Measurable neurological deficit
□ Symptom onset < 4.5 hours (or wake-up stroke with MRI criteria)
□ CT or MRI ruling out hemorrhage

EXCLUSION CRITERIA:
□ Evidence of intracranial hemorrhage on CT
□ Recent intracranial/spinal surgery or head trauma (≤3 months)
□ Active internal bleeding
□ Platelet count < 100,000
□ Current use of anticoagulant with INR > 1.7
□ Blood glucose < 50 mg/dL
□ Seizure at stroke onset with postictal state
□ Stroke within past 3 months (except prior TIA)
□ Major surgery within 14 days
□ GI or urinary tract hemorrhage within 21 days
□ Myocardial infarction within past 3 months

RELATIVE CONTRAINDICATIONS (consider risk/benefit):
□ Minor or rapidly improving symptoms
□ Pregnancy
□ Recent major surgery (14-30 days)
□ Recent GI/urinary bleeding (21-30 days)
□ NIHSS > 25
□ Recent myocardial infarction
□ Stroke within 30 days

DECISION: □ APPROVED FOR tPA  □ DECLINED - Reason: ___________

Dose: [0.9 mg/kg] x [WEIGHT] kg = [TOTAL] mg
  - 10% bolus over 1 minute: [BOLUS] mg
  - Remaining 90% over 60 minutes: [INFUSION] mg

Consent obtained: □ Yes
BP: ____/____ mmHg - Required < 185/110 before treatment`,
    tags: ['stroke', 'tPA', 'treatment', 'eligibility', 'alteplase'],
  },
  {
    id: 'stroke-discharge',
    name: 'Stroke Discharge',
    trigger: '.strokedc',
    category: 'stroke',
    description: 'Stroke discharge instructions and follow-up',
    content: `STROKE DISCHARGE SUMMARY

DIAGNOSIS: Acute ischemic stroke (ICD-10: I63.9)
Location: [LACUNAR/PAC/Total anterior/PICA/Vertebrobasilar]

HOSPITAL COURSE:
Patient admitted for acute ischemic stroke. Received [IV tPA/Mechanical thrombectomy/Both/Medical management]. 
Hospital stay: [X] days
Discharged to: [Home/Home with services/Rehab/SNF]

NEUROLOGICAL EXAM AT DISCHARGE:
- Strength: [RIGHT ARM ___/5, LEFT ARM ___/5, RIGHT LEG ___/5, LEFT LEG ___/5]
- Speech: [Normal/Aphasia/Dysarthria]
- NIHSS at discharge: ___

DISCHARGE MEDICATIONS:
□ Aspirin 81mg daily
□ Clopidogrel 75mg daily x 21 days (if applicable)
□ Atorvastatin 80mg daily
□ Antihypertensives: _____________
□ Anticoagulation: [Apixaban/Rivaroxaban/Warfarin/None] - Start date: ___________

FOLLOW-UP:
□ Neurology clinic: [DATE] - [PHONE]
□ Primary care: within 7-14 days
□ Stroke support group referral
□ PT/OT/SLP outpatient referral

SECONDARY PREVENTION:
- BP goal: < 130/80
- LDL goal: < 70 mg/dL (or < 100 if on statin)
- Smoking cessation: [N/A/Counseled/Resources provided]
- Diabetes management: [HbA1c goal: < 7%]

RED FLAGS - Return immediately if:
- New weakness, numbness, or tingling
- New difficulty speaking or understanding
- New vision changes
- Severe headache
- Seizure
- Difficulty breathing

Patient/family education provided: □ Yes □ No
Patient verbalized understanding: □ Yes`,
    tags: ['stroke', 'discharge', 'summary', 'follow-up'],
  },
  {
    id: 'tia-hpi',
    name: 'TIA HPI',
    trigger: '.tiahpi',
    category: 'tia',
    description: 'Transient ischemic attack history template',
    content: `HISTORY OF PRESENT ILLNESS - TIA

Patient is a [AGE]-year-old [SEX] presenting with episode(s) of [RESOLVED/ONGOING] neurological symptoms concerning for TIA.

EPISODE DETAILS:
- Number of episodes: [1 / Multiple]
- Date/Time of most recent episode: ___________
- Duration: [MINUTES] (if known)
- Resolution: [COMPLETE / INCOMPLETE]

SYMPTOMS (check all that apply):
[ ] Weakness - Side: [R/L/B] - Distribution: [Face/Arm/Leg]
[ ] Numbness - Side: [R/L/B] - Distribution: [Face/Arm/Leg]
[ ] Speech difficulty (dysarthria)
[ ] Language difficulty (aphasia)
[ ] Visual loss - Type: [Hemianopia/Altitudinal/Monocular]
[ ] Ataxia/Imbalance
[ ] Vertigo
[ ] Diplopia
[ ] Dysphagia
[ ] Cognitive/Confusion

PROVOKING FACTORS:
[ ] Standing quickly
[ ] Exercise
[ ] Valsalva
[ ] Carotid pressure
[ ] None identified

Associated symptoms:
[ ] Headache
[ ] Nausea
[ ] Chest pain/Palpitations

PERTINENT NEGATIVES:
- No loss of consciousness
- No witnessed convulsive activity
- No witnessed urinary incontinence
- No traumatic injury

LAST KNOWN WELL: [DATE/TIME]

ABCD² SCORE (Risk of stroke after TIA):
- Age ≥60: [0/1]
- BP ≥140/90: [0/1]
- Clinical features: [0/1] (unilateral weakness) or [0] (speech disturbance alone)
- Duration: [0] (<10 min), [1] (10-59 min), or [2] (≥60 min)
- Diabetes: [0/1]
TOTAL: ___/7

ABCD² Risk Category: [Low (0-3) / Moderate (4-5) / High (6-7)]`,
    tags: ['TIA', 'HPI', 'ABCD2', 'stroke risk'],
  },
  {
    id: 'tia-workup',
    name: 'TIA Workup',
    trigger: '.tiaworkup',
    category: 'tia',
    description: 'TIA etiological workup checklist',
    content: `TIA ETIOLOGICAL WORKUP CHECKLIST

ADMISSION/EMERGENCY:
□ CT head (non-contrast) - Results: _____________
□ CT angio (head/neck) - Results: _____________
□ ECG - Results: _____________
□ Troponin - Results: _____________
□ CBC, CMP, PT/INR, PTT
□ Lipid panel
□ HbA1c

HOSPITAL/24-HOUR WORKUP:
□ Cardiac telemetry - Duration: [X] hours
□ TTE (transthoracic echo) - EF: ___%
□ TEE (transesophageal echo) - [Pending/Completed]
□ Carotid duplex - Results: _____________
□ MRI brain with DWI - Results: _____________

VASCULAR IMAGING:
□ CTA/MRA of head and neck
□ Carotid ultrasound

CARDIAC MONITORING:
□ Event recorder placed
□ Ambulatory cardiac monitoring (Zio patch/Holter)

LABORATORY EVALUATION:
□ Hypercoagulable workup (if indicated): [ ] Factor V Leiden [ ] Prothrombin G20210A [ ] Antiphospholipid antibodies [ ] Protein C/S [ ] Antithrombin III
□ ESR/CRP (if vasculitis suspected)

TREATMENT PLAN BASED ON ETIOLOGY:

Large Vessel Disease (Carotid):
□ Carotid endarterectomy evaluation
□ Plavix + Aspirin
□ Statin (high intensity)

Cardioembolic (AFL/AF):
□ Anticoagulation: [Apixaban 5mg BID / Rivaroxaban 20mg daily / Warfarin goal INR 2-3]
□ CHA₂DS₂-VASc: ___ (if starting anticoagulation)

Small Vessel Disease:
□ Antiplatelet: Aspirin 81mg or Clopidogrel 75mg
□ BP control
□ Statin

Cryptogenic:
□ Antiplatelet therapy
□ Consider anticoagulation if cryptogenic with ESUS criteria met`,
    tags: ['TIA', 'workup', 'diagnosis', 'etiology'],
  },
  {
    id: 'migraine-hpi',
    name: 'Migraine HPI',
    trigger: '.migrainehpi',
    category: 'headache',
    description: 'Migraine history of present illness',
    content: `HISTORY OF PRESENT ILLNESS - MIGRAINE

Patient is a [AGE]-year-old [SEX] with history of [migraine with aura/migraine without aura] presenting with [acute exacerbation/new onset] headache.

HEADACHE CHARACTERISTICS:
- Location: [Unilateral/Bilateral] - Side: [R/L/Alternating]
- Quality: [Pulsating/Throbbing/Dull/Pressure/Lancinating]
- Severity: [0-10]/10
- Onset: [Gradual over hours/Sudden/Gradually worsening]
- Duration: [HOURS/DAYS] (typical: 4-72 hours untreated)
- Frequency: [X] episodes per [week/month]

ASSOCIATED SYMPTOMS:
[ ] Photophobia
[ ] Phonophobia
[ ] Nausea
[ ] Vomiting
[ ] Osmophobia
[ ] Vertigo
[ ] Visual aura - Type: [Scintillating scotoma/Fortification/Visual loss]
[ ] Sensory aura - Side: [R/L/B]
[ ] Motor aura
[ ] Language aura (dysphasia)

TRIGGERS (check all that apply):
[ ] Stress
[ ] Sleep deprivation or oversleeping
[ ] Certain foods [List: _____________]
[ ] Weather changes
[ ] Hormonal (menstruation/ovulation)
[ ] Dehydration
[ ] Caffeine excess/withdrawal
[ ] Physical exertion
[ ] Lights/sounds

RELIEVING FACTORS:
[ ] Rest in dark room
[ ] Sleep
[ ] OTC analgesics: [ ]
[ ] Triptans: [ ]
[ ] Antiemetics: [ ]

PRIOR TREATMENTS (acute):
[ ] NSAIDs: _____________
[ ] Triptans: _____________
[ ] Antiemetics: _____________
[ ] Dihydroergotamine
[ ] CGRP antagonists

PREVENTIVE TREATMENTS:
[ ] Beta blocker: _____________
[ ] CGRP monoclonal antibody: _____________
[ ] Topiramate
[ ] Amitriptyline
[ ] Valproic acid
[ ] None

FAMILY HISTORY: [Migraine/Stroke/SAH] - [Y/N]

REDS FLAGS (checked at presentation):
[ ] Thunderclap onset - NO
[ ] Fever/stiff neck - NO
[ ] New neurological deficits - NO
[ ] Papilledema - NO
[ ] Risk factors for secondary cause - [Assess]
`,
    tags: ['headache', 'migraine', 'HPI', 'aura'],
  },
  {
    id: 'sah-workup',
    name: 'SAH Red Flags',
    trigger: '.sahworkup',
    category: 'headache',
    description: 'Subarachnoid hemorrhage red flag evaluation',
    content: `SUBARACHNOID HEMORRHAGE (SAH) RED FLAG EVALUATION

PATIENT PRESENTING WITH ACUTE HEADACHE

REDS FLAGS ASSESSMENT:
□ Thunderclap headache (peak intensity < 1 hour) - [Y/N - DESCRIBE]
□ New neurological symptoms - [Y/N - DESCRIBE]
□ Altered mental status - [Y/N]
□ Fever - [Y/N]
□ Neck stiffness/Kernig/Brudzinski - [Y/N]
□ Photophobia - [Y/N]
□ Loss of consciousness at onset - [Y/N]
□ Seizure at onset - [Y/N]

RISK FACTORS FOR SAH:
□ Previous SAH
□ Intracranial aneurysm (known)
□ Family history of SAH/aneurysm
□ Autosomal dominant polycystic kidney disease
□ Connective tissue disorder
□ Smoking history
□ Hypertension
□ Alcohol use (>2 drinks/day)

DIAGNOSTIC WORKUP:
□ Non-contrast CT head - [RESULTS]
  - Sensitivity: ~95-98% within 24 hours
  - Decreases to ~90% at 3 days, ~50% at 7 days

□ LP (if CT negative but clinical suspicion): [PENDING/COMPLETED]
  - Opening pressure: _________
  - RBC count: _________
  - Xanthochromia: [PENDING/ABSENT/PRESENT] (must wait 12 hours from onset)
  - Send for spectrophotometry

□ CTA (if CT negative, high suspicion): [PENDING/COMPLETED]
  - Sensitivity: 95-100% for aneurysms > 3mm
  - Results: _____________

□ MR brain (if available): [PENDING/COMPLETED]

DIAGNOSIS:
□ SAH confirmed
□ Thunderclap headache - CT/LP negative
□ Primary headache disorder
□ Secondary cause: _____________

IF SAH CONFIRMED:
□ Neurosurgery consultation
□ Nimodipine 60mg q4h (prevent vasospasm)
□ ICU admission
□ Monitor for hydrocephalus
□ Day 3-5 TCD for vasospasm`,
    tags: ['headache', 'SAH', 'subarachnoid', 'emergency', 'red flags'],
  },
  {
    id: 'seizure-hpi',
    name: 'Seizure HPI',
    trigger: '.seizhpi',
    category: 'seizure',
    description: 'Seizure history of present illness',
    content: `HISTORY OF PRESENT ILLNESS - SEIZURE

Patient is a [AGE]-year-old [SEX] presenting with [FIRST/PROVOKED/RECURRENT] seizure(s).

SEIZURE DETAILS:

NUMBER OF EVENTS: [X] episodes in past [HOURS/DAYS]
- Single seizure
- Recurrent seizures without recovery between (status epilepticus)
- Cluster of seizures

TIMING:
- Date/Time of first event: ___________
- Date/Time of most recent event: ___________
- Total duration of event(s): ___________

PROVOKING FACTORS (check all that apply):
[ ] Sleep deprivation
[ ] Alcohol use/withdrawal
[ ] Substance use: _____________
[ ] Medication non-compliance: [ ]
[ ] Acute illness
[ ] Metabolic abnormality
[ ] Photosensitive (flashing lights)
[ ] No triggers identified

SEIZURE SEMIOLOGY (describe what observer witnessed):

PRODROME (if any):
- Mood changes, aura, rising epigastric sensation, déjà vu, etc.

ICTAL PHASE:
- Motor activity: [Tonic/Clonic/Myoclonic/Atonic/Subtle]
- Location: [Generalized/Focal to bilateral/Focal - Side: ____]
- Duration: [SECONDS/MINUTES]
- Eye deviation: [R/L/Central]
- Pupils: [Normal/Dilated/Asymmetric]
- Incontinence: [Urine/Feces - Y/N]
- Cyanosis: [Y/N]
- Observed automatisms: [Lip smacking/Picking/Fumbling/Walking - Y/N]

POSTICTAL PHASE:
- Duration: [MINUTES/HOURS]
- Confusion: [Y/N]
- Aphasia: [Y/N]
- Weakness (Todd's paralysis): [Y/N - Side: ___]
- Headache: [Y/N]
- Muscle aches: [Y/N]
- Sleep: [Y/N]

PREVIOUS SEIZURES:
- First seizure ever: [Y/N]
- History of epilepsy: [Y/N]
- Last seizure prior to this: ___________
- Current antiseizure medications: _____________
- Medication adherence: [Good/Poor]`,
    tags: ['seizure', 'HPI', 'epilepsy', 'ictal'],
  },
  {
    id: 'post-ictal',
    name: 'Post-Ictal Protocol',
    trigger: '.postictal',
    category: 'seizure',
    description: 'Post-seizure management and documentation',
    content: `POST-ICTAL MANAGEMENT PROTOCOL

IMMEDIATE POST-ICTAL CARE:
□ Ensure safety - bed in low position, side rails up
□ Position: [Side-lying/Semi-Fowler's/Supine]
□ Airway: [Patent/Requires assistance]
□ Supplemental O2: [None/NC/Simple mask]
□ Pulse ox monitoring: [SpO2: ___%]

ASSESSMENT:
□ Blood glucose: [X] mg/dL - If <70, treat per hypoglycemia protocol
□ Vital signs: BP [X]/[X], HR [X], RR [X], Temp [X]
□ Full neurological exam
  - Level of consciousness: [GCS: ___]
  - Orientation: [Person/Place/Time/Situation]
  - Speech: [Normal/Aphasia/Dysarthria]
  - Motor: [Strength - RUE: __/5, LUE: __/5, RLE: __/5, LLE: __/5]
  - Sensation: [Intact/Impaired - describe]
  - Cranial nerves: [Normal/Abnormal]

POST-ICTAL COMPLICATIONS TO MONITOR:
□ Respiratory depression (especially after benzodiazepines)
□ Aspiration
□ Metabolic derangements
□ Recurrent seizures (25% risk within 24 hours)

LABORATORY EVALUATION:
□ Basic metabolic panel (electrolytes)
□ CBC
□ LFTs
□ Antiseizure medication level (if applicable)
□ Toxicity screen (if indicated)
□ Consider: Prolactin (within 10-20 min of GTCS)
□ Consider: EEG (if recurrent or unclear etiology)

NEUROIMAGING:
□ CT head (non-contrast) - [Indicated: new-onset, focal features, status epilepticus]
  Results: _____________
□ MRI brain with epilepsy protocol - [If recurrent seizures]
  Results: _____________

NEUROLOGY CONSULT:
□ Seizure etiology discussion
□ Antiseizure medication initiation/adjustment
□ EEG interpretation
□ Driving restrictions discussion
□ Safety counseling

DISCHARGE PLANNING (if outpatient):
□ Antiseizure medication: _____________
□ Follow-up: Neurology in [X] days
□ Driving restrictions: [No driving for X months per state law]
□ Safety counseling: [No swimming/No bathing (shower only)/No operating heavy machinery]
□ Return precautions: [Return for recurrent seizure >5 min, >2 in 24h, injury, first unprovoked seizure]`,
    tags: ['seizure', 'post-ictal', 'management', 'protocol'],
  },
  {
    id: 'general-consult',
    name: 'General Neuro Consult',
    trigger: '.neuroconsult',
    category: 'general',
    description: 'General neurology consultation template',
    content: `NEUROLOGY CONSULTATION

DATE/TIME: ___________
REQUESTING SERVICE: ___________
REASON FOR CONSULTATION: ___________

HISTORY OF PRESENT ILLNESS:
[Comprehensive HPI - see specialty-specific templates]

PAST MEDICAL HISTORY:
- Seizures/Epilepsy: [Y/N]
- Stroke/TIA: [Y/N - Date: ____]
- Migraine/Headache: [Y/N]
- Multiple Sclerosis: [Y/N]
- Parkinson's Disease: [Y/N]
- Alzheimer's Disease/Dementia: [Y/N]
- Neuropathy: [Y/N]
- Other: _____________

MEDICATIONS:
1. _____________ - Dose: _____ - Frequency: _____
2. _____________ - Dose: _____ - Frequency: _____
3. _____________ - Dose: _____ - Frequency: _____
4. _____________ - Dose: _____ - Frequency: _____
5. _____________ - Dose: _____ - Frequency: _____

ALLERGIES: _____________

FAMILY HISTORY:
- Neurological disease: _____________

SOCIAL HISTORY:
- Smoking: [Never/Former/Current]
- Alcohol: [None/Social/Excess]
- Occupation: _____________
- Living situation: _____________

NEUROLOGICAL EXAMINATION:

Mental Status:
- Appearance: [Alert/Lethargic/Confused]
- Orientation: [x3 / x2 / x1 / 0]
- Attention: [Intact/Impaired]
- Memory: [Intact/Impaired]
- Language: [Normal/Aphasia/Dysarthria]

Cranial Nerves:
- I: [Normal/Impaired]
- II: [Pupils: __mm/__mm, PERRL, Fundi: Normal/Abnormal]
- III, IV, VI: [EOMs intact/Deficit: ____]
- V: [Sensation: Normal/Impaired], [Motor: Masseter: Normal/Weak]
- VII: [Facial symmetry: Y/N]
- VIII: [Hearing: Normal/Impaired]
- IX, X: [Gag: Normal/Impaired], [Palate: Moves midline Y/N]
- XI: [SCM: Normal/Weak], [Trapezius: Normal/Weak]
- XII: [Tongue: Midline/Deviation: ___]

Motor:
- Bulk: [Normal/Atrophy: ___]
- Tone: [Normal/Hypertonic/Hypotonic]
- Strength: 
  RUE: __/5  LUE: __/5
  RLE: __/5  LLE: __/5

Sensory:
- Primary: [Normal/Abnormal]
- Cortical: [Normal/Abnormal]

Coordination:
- Finger-to-nose: [Normal/Impaired - Side: ___]
- Heel-to-shin: [Normal/Impaired - Side: ___]
- Fine finger movements: [Normal/Impaired]

Reflexes:
- Biceps: R: __+  L: __+
- Triceps: R: __+  L: __+
- Brachioradialis: R: __+  L: __+
- Patellar: R: __+  L: __+
- Achilles: R: __+  L: __+
- Babinski: R: [Neg/Pos]  L: [Neg/Pos]

Gait:
- [Normal/Ataxic/Hemiparetic/Parkinsonian/Shuffling/Staggering/Wide-based]
- Tandem gait: [Normal/Abnormal]

RECOMMENDATIONS:
1. _____________
2. _____________
3. _____________
4. _____________

Thank you for this consult. Please contact the neurology service with any questions.

Consultant: _____________
Fellow/Resident: _____________`,
    tags: ['consult', 'general', 'template', 'admission'],
  },
  {
    id: 'neuro-exam',
    name: 'Complete Neuro Exam',
    trigger: '.neuroexam',
    category: 'general',
    description: 'Complete neurological examination template',
    content: `COMPLETE NEUROLOGICAL EXAMINATION

MENTAL STATUS EXAM:
□ Appearance: [Alert, well-developed, well-nourished, comfortable]
□ Behavior: [Appropriate/Inappropriate/Agitated]
□ Speech: [Normal/Fluent nonfluent/Slow/Dysarthric]
□ Orientation: [Person/Place/Time/Situation - 4/4]
□ Attention: [Intact/Digit span ___]
□ Memory: [Immediate: __/3], [Recent: __/3], [Remote: Intact/Impaired]
□ Language: [Naming: __/5], [Repetition: Intact/Impaired], [Comprehension: Intact/Impaired]
□ Abstraction: [Intact/Impaired]
□ Fund of knowledge: [Appropriate for age/education]

CRANIAL NERVES:

CN I (Olfactory):
- Tested: [Y/N]
- Result: [Normal/Impaired - Right/Left/Bilateral]

CN II (Optic):
- Visual acuity: R: ___, L: ___ (with correction)
- Visual fields: [Full confrontation/Deficit: ____]
- Fundoscopy: [Normal/Papilledema/Hemorrhage/Pale disc]

CN III, IV, VI (Oculomotor, Trochlear, Abducens):
- Palpebral fissures: R: ___mm, L: ___mm
- EOMs: [Full/Restricted: ____]
- Pupils: R: ___mm, L: ___mm (light)
- Pupils: R: ___mm, L: ___mm (dark)
- PERRL: [Y/N], APD: [Y/N]
- Nystagmus: [None/___]

CN V (Trigeminal):
- Sensation: [Light touch/Pinprick/Temperature - Normal/Impaired]
- Motor: [Masseters: Strong/Symmetric/Weak]

CN VII (Facial):
- Motor: [Smile/Symmetric/Weak - R/L]
- Taste (anterior 2/3): [Tested Y/N - Result: ___]

CN VIII (Vestibulocochlear):
- Hearing: [Whisper test: R: __/__, L: __/__]
- Weber: [No lateralization/Lateralizes to R/L]
- Rinne: [AC > BC/BC > AC]

CN IX, X (Glossopharyngeal, Vagus):
- Gag reflex: [Present/Reduced/Absent]
- Palate: [Moves midline/R Deviation/L Deviation]
- Voice: [Normal/Hoarse]

CN XI (Accessory):
- SCM: R: [Strong/Weak], L: [Strong/Weak]
- Trapezius: R: [Strong/Weak], L: [Strong/Weak]

CN XII (Hypoglossal):
- Tongue: [Midline/Deviation: R/L/Atrophy/Fasciculations]

MOTOR EXAM:
- Bulk: [Normal/Atrophy: ___]
- Tone: [Normal/Spasticity/Rigidity/Flaccidity]
- Strength (0-5 scale):
        R       L
Arms:  __       __  (Deltoid)
       __       __  (Biceps)
       __       __  (Triceps)
       __       __  (Wrist extensors)
       __       __  (Finger abductors)
Legs:  __       __  (Hip flexors)
       __       __  (Knee extensors)
       __       __  (Ankle dorsiflexors)
       __       __  (Ankle plantar flexors)

SENSORY EXAM:
- Light touch: [Normal/Impaired - Pattern: ____]
- Pinprick: [Normal/Impaired - Pattern: ____]
- Temperature: [Normal/Abnormal]
- Vibration: [Normal/Impaired - Up to: ____]
- Position sense: [Normal/Impaired - toes/fingers]
- Cortical sensory: [Normal/Impaired]
  - Stereognosis: [Normal/Impaired]
  - Graphesthesia: [Normal/Impaired]
  - Two-point discrimination: [Normal/Impaired]

COORDINATION:
- Finger-to-nose: [Normal/Impaired - R/L/Both]
- Finger-to-finger: [Normal/Impaired]
- Heel-to-shin: [Normal/Impaired - R/L/Both]
- Rapid alternating movements: [Normal/Impaired]
- Fine finger movements: [Normal/Impaired]

REFLEXES:
        R       L
Biceps:   __+     __+
Triceps:  __+     __+
BR:       __+     __+
Patellar: __+     __+
Achilles: __+     __+
Babinski: [Neg]   [Neg]
Hoffman:  [Neg]   [Neg]

GAIT:
- Base: [Normal/Wide/Narrow]
- Stride: [Normal/Short/Shuffling]
- Arm swing: [Present/Reduced/Absent]
- Heel walk: [Normal/Impaired - R/L]
- Toe walk: [Normal/Impaired - R/L]
- Tandem: [Normal/Abnormal]
- Romberg: [Negative/Positive]`,
    tags: ['exam', 'examination', 'general', 'documentation'],
  },
  {
    id: 'neuro-ros',
    name: 'Neuro ROS',
    trigger: '.neuroros',
    category: 'general',
    description: 'Neurology-focused review of systems',
    content: `NEUROLOGY REVIEW OF SYSTEMS

GENERAL:
[ ] Fever
[ ] Chills
[ ] Night sweats
[ ] Unintentional weight changes
[ ] Fatigue

HEADACHE:
[ ] Headache - Location: ____
[ ] Severity: __/10
[ ] Frequency: ____
[ ] Associated: [Nausea/Vomiting/Photophobia/Phonophobia/Aura]
[ ] Worse with: [Valsalva/Position/Activity]
[ ] Thunderclap quality

CRANIAL NERVES:
[ ] Vision changes - [Blurred/Double/Blindness/Scotoma]
[ ] Eye pain
[ ] Hearing loss
[ ] Tinnitus
[ ] Vertigo
[ ] Imbalance
[ ] Facial weakness/numbness
[ ] Dysphagia
[ ] Dysarthria
[ ] Dysphagia

MOTOR:
[ ] Weakness - Distribution: ____
[ ] Twitching/Fasciculations
[ ] Cramps
[ ] Stiffness
[ ] Clumsiness

SENSORY:
[ ] Numbness - Distribution: ____
[ ] Tingling
[ ] Burning
[ ] Electric shock sensations
[ ] Imbalance

SEIZURES:
[ ] Seizure
[ ] Witnessed convulsion
[ ] Tongue biting
[ ] Incontinence
[ ] Post-ictal confusion

COORDINATION:
[ ] Clumsiness
[ ] Tremor
[ ] Involuntary movements

AUTONOMIC:
[ ] Orthostatic lightheadedness
[ ] Syncope
[ ] Bladder dysfunction
[ ] Bowel dysfunction
[ ] Sexual dysfunction

SLEEP:
[ ] Insomnia
[ ] Excessive daytime sleepiness
[ ] Sleepwalking
[ ] REM sleep behavior disorder

MOOD/COGNITIVE:
[ ] Memory problems
[ ] Confusion
[ ] Depression
[ ] Anxiety
[ ] Hallucinations
[ ] Personality changes`,
    tags: ['ROS', 'review of systems', 'general', 'headache'],
  },
  {
    id: 'ataxia-workup',
    name: 'Ataxia Workup',
    trigger: '.ataxiaworkup',
    category: 'general',
    description: 'Ataxia differential diagnosis workup',
    content: `ATAXIA ETIOLOGICAL WORKUP

CLINICAL CLASSIFICATION:
□ Acute cerebellar ataxia
□ Subacute (days-weeks)
□ Chronic progressive (months-years)
□ Paroxysmal

LOCALIZATION:
□ Cerebellar: [Truncal ataxia/Limb ataxia/Dysmetria/Dysdiadochokinesia/Nystagmus/Scanning speech]
□ Sensory: [Proprioceptive loss/Gait worse in dark/Positive Romberg]
□ Vestibular: [Vertigo/Nausea/VOMIT/Nystagmus]
□ Frontal: [Gait apraxia/Lower limb paresis/Urinary incontinence]

ACUTE ATAXIA WORKUP (if < 24-48 hours):

IMAGING:
□ MRI brain with and without contrast
  - Looking for: [Stroke/ hemorrhage/ tumor/ demyelination/ infection]
□ CT head (if MRI unavailable or emergent)

LABORATORY:
□ CBC, CMP
□ Glucose
□ Electrolytes including Mg, Phos
□ Liver and renal function
□ Ammonia (if hepatic disease suspected)
□ Vitamin B12, B1, E
□ TSH
□ B2-glycoprotein
□ Anti-GAD antibodies
□ Paraneoplastic panel (if suspect occult malignancy)

TOXICOLOGY:
□ Urine drug screen
□ ETOH level
□ Medication levels (if on anticonvulsants)

INFECTIOUS:
□ Lumbar puncture - [Cell count/Protein/Glucose/OCBs/VDRL]
□ HSV PCR
□ West Nile virus (in endemic areas)
□ HIV

CEREBELLAR STROKE PROTOCOL:
□ CTA head/neck (if posterior circulation stroke suspected)
□ MRI DWI

SUBACUTE/CHRONIC PROGRESSIVE ATAXIA:

GENETIC:
□ Genetic counseling referral
□ Ataxia panel: [Spinocerebellar ataxia (SCA) 1,2,3,6,7 / Friedreich ataxia / Fragile X]
□ Mitochondrial testing
□ Vitamin E level
□ Very long chain fatty acids (if VLCAD suspected)

AUTOIMMUNE:
□ Anti-GAD
□ Anti-mGluR1
□ Anti-thyroid antibodies
□ ESR/CRP
□ ANA
□ Anti-phospholipid antibodies

ONCOLOGIC/PARANEOPLASTIC:
□ CT chest/abdomen/pelvis
□ PET scan
□ Paraneoplastic panel: [Yo/Hu/Ri/Ma2/Amphiphysin/CRMP5/PCA-Tr]

NEUROPHYSIOLOGY:
□ EMG/NCS
□ EEG (if seizures a concern)

SPECIFIC TREATMENTS:
- Acute cerebellar ataxia: Supportive, treat underlying cause
- Gluten ataxia: Gluten-free diet
- Vitamin E deficiency: Vitamin E supplementation
- Autoimmune: IVIG/Steroids/Plasmapheresis
- Paraneoplastic: Treat underlying tumor + immunotherapy
- Hereditary: Supportive, genetic counseling`,
    tags: ['ataxia', 'workup', 'diagnosis', 'cerebellar'],
  },
  {
    id: 'gbs-workup',
    name: 'Guillain-Barré Workup',
    trigger: '.gbsworkup',
    category: 'general',
    description: 'Guillain-Barré syndrome diagnostic workup',
    content: `GUILLAIN-BARRÉ SYNDROME (GBS) WORKUP

CLINICAL DIAGNOSIS:
□ Progressive weakness (ascending)
□ Areflexia/areflexia
□ Pain (back/limb)
□ Autonomic dysfunction

CLINICAL VARIANTS:
□ AIDP (most common in US)
□ Miller Fisher syndrome: [Areflexia/Ataxia/Ophthalmoplegia]
□ AMAN/AMSAN

DIAGNOSTIC CRITERIA (NINDS):
Required:
□ Progressive motor weakness (areflexia/areflexia)
□ Symptom progression < 4 weeks

Supportive:
□ CSF with elevated protein (>45 mg/dL) with <10 WBCs
□ Slow nerve conduction velocities (demyelination)
□ No fever at onset

EMG/NCS (nerve conduction studies):
□ Performed: [Y/N]
□ Results:
  - [Demyelinating features: Prolonged distal latency/CV block/Temporal dispersion]
  - [Axonal features: Reduced amplitudes]
  - [F-wave abnormalities]

LUMBAR PUNCTURE:
□ Performed: [Y/N]
□ Opening pressure: _________
□ WBC: __ (normal < 5)
□ Protein: __ (elevated > 45 mg/dL)
□ Glucose: __ (normal 40-70 mg/dL)

LABORATORY EVALUATION (to identify trigger):

Infectious:
□ Campylobacter jejuni [serology/stool culture]
□ Mycoplasma pneumoniae
□ CMV/EBV/HHV-6
□ HIV
□ SARS-CoV-2
□ Zika virus

Autoimmune:
□ Anti-GQ1b (Miller Fisher)
□ Anti-GM1, Anti-GD1a
□ Anti-AChR (myasthenia gravis mimic)
□ ANA

Other:
□ Diabetes screening (HbA1c)
□ Malignancy screen (paraneoplastic)

TREATMENT DECISION:
□ IVIG: [0.4 g/kg/day x 5 days]
□ PLEX: [5 exchanges over 10-14 days]
□ Both (if severe)
□ No treatment (mild, stable)

MONITORING:
□ Monitor for respiratory failure - check VC/NIF q4h
□ Monitor for autonomic dysfunction - BP/HR/arrhythmias
□ DVT prophylaxis
□ Pain management
□ PT/OT referral

PROGNOSIS:
□ Poor prognosis indicators: [Rapid progression/Respiratory failure/Axonal variant/Elderly/High CSF protein]`,
    tags: ['GBS', 'Guillain-Barré', 'workup', 'neuropathy', 'weakness'],
  },
];
