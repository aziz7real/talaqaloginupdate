/** A paragraph is a string; a bullet list is an array of strings. `{email}` is replaced with the contact address. */
export type LegalBlock = string | string[];

export interface LegalSection {
  id: string;
  heading: string;
  body: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  description: string;
  /** ISO date, formatted per locale on the page. */
  updated: string;
  intro: string;
  sections: LegalSection[];
}
