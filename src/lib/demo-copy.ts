import {
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_PROCUREMENT,
  INITIAL_OPERATIONS,
} from "./demo-data";
import { translate, type Locale } from "./translate";

const sampleRecords = [
  ...INITIAL_EXPENSES,
  ...INITIAL_INVENTORY,
  ...INITIAL_PROCUREMENT,
  ...INITIAL_OPERATIONS,
];

// Only the original fixture text is translated; user-written fields stay verbatim.
export function translateSample(
  locale: Locale,
  id: string,
  text: string,
): string {
  if (locale === "id") return text;
  const record = sampleRecords.find((item) => item.id === id);
  if (!record) return text;
  const values: string[] = [];
  function collect(value: unknown) {
    if (typeof value === "string") values.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object")
      Object.values(value).forEach(collect);
  }
  collect(record);
  if (values.includes(text)) return translate(locale, text);
  const original = values.find(
    (value) => value.length > 30 && text.startsWith(value + " Disetujui "),
  );
  if (original) {
    const suffix = text.slice(original.length).match(/^ Disetujui (.+)\.$/);
    if (suffix)
      return `${translate(locale, original)} Approved by ${suffix[1]}.`;
  }
  return text;
}
