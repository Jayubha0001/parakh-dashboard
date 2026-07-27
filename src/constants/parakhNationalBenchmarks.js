// Gujarat (State) vs National average figures, sourced directly from the
// official "PARAKH Rashtriya Sarvekshan 2024 — State Report: Gujarat"
// (NCERT / Ministry of Education). Our own Excel workbook only carries
// Gujarat's 33-district figures — it has no National column for these
// state-level rollups — so these numbers are transcribed here as a
// static reference and merged in on the PARAKH page.
//
// Competency-level State vs National figures are NOT duplicated here —
// those already exist as a "National (Benchmark)" column inside the
// PARAKH_Foundational_G3 / Preparatory_G6 / Middle_G9 sheets and are
// already shown in Reports > District Deep Dive.

export const PARAKH_NATIONAL_BENCHMARKS = {
  G3: {
    label: "Grade 3 — Foundational Stage",
    participation: { schools: 1091, teachers: 2898, students: 27731 },
    subject: [
      { name: "Language", state: 57, national: 64 },
      { name: "Mathematics", state: 52, national: 60 },
    ],
    gender: [
      { name: "Language — Boys", state: 56, national: 63 },
      { name: "Language — Girls", state: 58, national: 65 },
      { name: "Mathematics — Boys", state: 51, national: 60 },
      { name: "Mathematics — Girls", state: 52, national: 60 },
    ],
    location: [
      { name: "Language — Rural", state: 56, national: 64 },
      { name: "Language — Urban", state: 58, national: 63 },
      { name: "Mathematics — Rural", state: 51, national: 60 },
      { name: "Mathematics — Urban", state: 52, national: 59 },
    ],
    management: [
      { name: "Language — State Govt.", state: 56, national: 64 },
      { name: "Language — Govt. Aided", state: 59, national: 63 },
      { name: "Language — Private", state: 57, national: 64 },
      { name: "Language — Central Govt.", state: 57, national: 60 },
      { name: "Mathematics — State Govt.", state: 51, national: 61 },
      { name: "Mathematics — Govt. Aided", state: 53, national: 58 },
      { name: "Mathematics — Private", state: 51, national: 60 },
      { name: "Mathematics — Central Govt.", state: 54, national: 57 },
    ],
    socialGroup: [
      { name: "Language — SC", state: 56, national: 64 },
      { name: "Language — ST", state: 56, national: 61 },
      { name: "Language — OBC", state: 57, national: 63 },
      { name: "Language — Others", state: 59, national: 66 },
      { name: "Mathematics — SC", state: 51, national: 60 },
      { name: "Mathematics — ST", state: 50, national: 57 },
      { name: "Mathematics — OBC", state: 52, national: 60 },
      { name: "Mathematics — Others", state: 53, national: 61 },
    ],
  },

  G6: {
    label: "Grade 6 — Preparatory Stage",
    participation: { schools: 1188, teachers: 3408, students: 31386 },
    subject: [
      { name: "Language", state: 51, national: 57 },
      { name: "Mathematics", state: 40, national: 46 },
      { name: "The World Around Us", state: 45, national: 49 },
    ],
    gender: [
      { name: "Language — Boys", state: 49, national: 55 },
      { name: "Language — Girls", state: 54, national: 59 },
      { name: "Mathematics — Boys", state: 41, national: 47 },
      { name: "Mathematics — Girls", state: 40, national: 46 },
      { name: "The World Around Us — Boys", state: 45, national: 49 },
      { name: "The World Around Us — Girls", state: 47, national: 50 },
    ],
    location: [
      { name: "Language — Rural", state: 50, national: 55 },
      { name: "Language — Urban", state: 53, national: 59 },
      { name: "Mathematics — Rural", state: 39, national: 45 },
      { name: "Mathematics — Urban", state: 42, national: 47 },
      { name: "The World Around Us — Rural", state: 44, national: 48 },
      { name: "The World Around Us — Urban", state: 47, national: 51 },
    ],
    management: [
      { name: "Language — State Govt.", state: 46, national: 52 },
      { name: "Language — Govt. Aided", state: 50, national: 52 },
      { name: "Language — Private", state: 56, national: 60 },
      { name: "Language — Central Govt.", state: 62, national: 69 },
      { name: "Mathematics — State Govt.", state: 35, national: 43 },
      { name: "Mathematics — Govt. Aided", state: 37, national: 40 },
      { name: "Mathematics — Private", state: 44, national: 49 },
      { name: "Mathematics — Central Govt.", state: 60, national: 61 },
      { name: "The World Around Us — State Govt.", state: 41, national: 47 },
      { name: "The World Around Us — Govt. Aided", state: 45, national: 45 },
      { name: "The World Around Us — Private", state: 49, national: 52 },
      { name: "The World Around Us — Central Govt.", state: 52, national: 58 },
    ],
    socialGroup: [
      { name: "Language — SC", state: 52, national: 54 },
      { name: "Language — ST", state: 46, national: 51 },
      { name: "Language — OBC", state: 51, national: 56 },
      { name: "Language — Others", state: 56, national: 61 },
      { name: "Mathematics — SC", state: 40, national: 44 },
      { name: "Mathematics — ST", state: 36, national: 41 },
      { name: "Mathematics — OBC", state: 39, national: 46 },
      { name: "Mathematics — Others", state: 45, national: 50 },
      { name: "The World Around Us — SC", state: 45, national: 47 },
      { name: "The World Around Us — ST", state: 42, national: 45 },
      { name: "The World Around Us — OBC", state: 45, national: 49 },
      { name: "The World Around Us — Others", state: 49, national: 53 },
    ],
  },

  G9: {
    label: "Grade 9 — Middle Stage",
    participation: { schools: 1620, teachers: 5836, students: 45766 },
    subject: [
      { name: "Language", state: 50, national: 54 },
      { name: "Mathematics", state: 32, national: 37 },
      { name: "Science", state: 38, national: 40 },
      { name: "Social Science", state: 37, national: 40 },
    ],
    gender: [
      { name: "Language — Boys", state: 47, national: 52 },
      { name: "Language — Girls", state: 54, national: 56 },
      { name: "Mathematics — Boys", state: 32, national: 37 },
      { name: "Mathematics — Girls", state: 32, national: 36 },
      { name: "Science — Boys", state: 38, national: 41 },
      { name: "Science — Girls", state: 39, national: 40 },
      { name: "Social Science — Boys", state: 36, national: 39 },
      { name: "Social Science — Girls", state: 39, national: 41 },
    ],
    location: [
      { name: "Language — Rural", state: 47, national: 51 },
      { name: "Language — Urban", state: 55, national: 58 },
      { name: "Mathematics — Rural", state: 30, national: 36 },
      { name: "Mathematics — Urban", state: 35, national: 38 },
      { name: "Science — Rural", state: 36, national: 39 },
      { name: "Science — Urban", state: 42, national: 42 },
      { name: "Social Science — Rural", state: 36, national: 39 },
      { name: "Social Science — Urban", state: 41, national: 41 },
    ],
    management: [
      { name: "Language — State Govt.", state: 44, national: 48 },
      { name: "Language — Govt. Aided", state: 46, national: 49 },
      { name: "Language — Private", state: 56, national: 59 },
      { name: "Language — Central Govt.", state: 66, national: 69 },
      { name: "Mathematics — State Govt.", state: 28, national: 33 },
      { name: "Mathematics — Govt. Aided", state: 29, national: 33 },
      { name: "Mathematics — Private", state: 36, national: 39 },
      { name: "Mathematics — Central Govt.", state: 47, national: 48 },
      { name: "Science — State Govt.", state: 35, national: 37 },
      { name: "Science — Govt. Aided", state: 35, national: 37 },
      { name: "Science — Private", state: 42, national: 44 },
      { name: "Science — Central Govt.", state: 51, national: 51 },
      { name: "Social Science — State Govt.", state: 34, national: 37 },
      { name: "Social Science — Govt. Aided", state: 35, national: 37 },
      { name: "Social Science — Private", state: 41, national: 42 },
      { name: "Social Science — Central Govt.", state: 47, national: 49 },
    ],
    socialGroup: [
      { name: "Language — SC", state: 52, national: 50 },
      { name: "Language — ST", state: 45, national: 47 },
      { name: "Language — OBC", state: 48, national: 53 },
      { name: "Language — Others", state: 58, national: 60 },
      { name: "Mathematics — SC", state: 32, national: 35 },
      { name: "Mathematics — ST", state: 28, national: 32 },
      { name: "Mathematics — OBC", state: 31, national: 37 },
      { name: "Mathematics — Others", state: 37, national: 40 },
      { name: "Science — SC", state: 39, national: 39 },
      { name: "Science — ST", state: 35, national: 36 },
      { name: "Science — OBC", state: 37, national: 40 },
      { name: "Science — Others", state: 43, national: 44 },
      { name: "Social Science — SC", state: 38, national: 38 },
      { name: "Social Science — ST", state: 34, national: 36 },
      { name: "Social Science — OBC", state: 36, national: 39 },
      { name: "Social Science — Others", state: 43, national: 43 },
    ],
  },
};

export const PARAKH_SURVEY_META = {
  title: "PARAKH Rashtriya Sarvekshan 2024",
  source: "NCERT / Ministry of Education, Government of India — State Report: Gujarat",
  languages: ["English", "Gujarati", "Hindi", "Marathi", "Odia", "Sanskrit", "Urdu"],
};
