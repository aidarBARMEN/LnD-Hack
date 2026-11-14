export type ProfileStep =
  | "name"
  | "sex"
  | "age"
  | "city"
  | "language"
  | "needs"
  | "care"
  | "diagnosis"
  | "pmpk"
  | "prescriptions"
  | "documents"
  | "specialists"
  | "review";
export function profileSteps(includeCare: boolean): ProfileStep[] {
  return [
    "name",
    "age",
    "sex",
    "city",
    "language",
    "needs",
    "care",
    ...(includeCare
      ? ([
          "diagnosis",
          "pmpk",
          "prescriptions",
          "documents",
          "specialists",
        ] as const)
      : []),
    "review",
  ];
}
export function validAgeAnswer(value: string) {
  return (
    value === "" ||
    (Number.isInteger(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) <= 21)
  );
}
