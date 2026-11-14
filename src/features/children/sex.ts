export type Sex = "" | "female" | "male";
export const sexLabels = {
  "": "Не указывать",
  female: "Женский",
  male: "Мужской",
};
export function validSex(value: unknown) {
  return (
    value === undefined ||
    value === "" ||
    value === "female" ||
    value === "male"
  );
}
