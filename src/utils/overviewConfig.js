export const ASSESSMENTS = ["Overall", "PGI-D", "PARAKH", "SAT"];
export const YEARS = ["2025-26", "2024-25"];

// PARAKH stages are reported per grade band; this maps the Grade filter
// onto the stage column in Dashboard_PARAKH.
export const PARAKH_GRADES = { "Grade 3": "Foundational", "Grade 6": "Preparatory", "Grade 9": "Middle" };

// Available grade options for each assessment.
export const gradeOptionsFor = (assessment, satGrades = []) => {
  if (assessment === "PARAKH") return ["All Grades", ...Object.keys(PARAKH_GRADES)];
  if (assessment === "SAT") return ["All Grades", ...satGrades];
  return ["All Grades"]; // PGI-D is scored per district, not per grade
};

// Period dropdown: academic year for PGI-D, semester for SAT.
export const periodOptionsFor = (assessment) => {
  if (assessment === "PGI-D") return ["2025-26", "2024-25", "Both Years"];
  if (assessment === "SAT") return ["Overall", "Sem 1", "Sem 2"];
  return ["Latest"];
};
export const periodLabelFor = (assessment) => (assessment === "SAT" ? "Semester" : "Academic Year");
