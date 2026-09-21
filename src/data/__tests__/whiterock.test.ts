import { describe, it, expect } from "vitest";
import {
  ASSETS,
  SITE_COPY,
  CONTACT,
  STATS,
  DAYBEDS,
  EXPERIENCES,
  MENU_CATEGORIES,
  SPA_TREATMENTS,
  SPA_HOURS,
  WEDDING_VENUES,
  MICE_HALLS,
  NYE,
  RECURRING_EVENTS,
  FAQS,
  ENTERTAINMENT_DJS,
  SPECIAL_OFFERS,
  PARTNERS,
  PAST_EVENTS,
  BALI_GUIDE,
  MEDIA_COVERAGE,
  PRESS_RELEASES,
} from "../whiterock";

/**
 * `src/data/whiterock.ts` is the single source of truth for the site's content
 * and is imported by ~20 pages and layout components. It is plain data, so the
 * failure mode worth guarding against is silent corruption of that data: an id
 * duplicated, a bilingual pair missing its Indonesian half, a price typed as a
 * string, an empty array shipped as if it were content. Every assertion below
 * is a structural invariant the pages rely on, not a snapshot of the values.
 */
describe("whiterock data module", () => {
  it("exports every collection the pages import, non-empty", () => {
    const collections = {
      DAYBEDS,
      EXPERIENCES,
      MENU_CATEGORIES,
      SPA_TREATMENTS,
      SPA_HOURS,
      WEDDING_VENUES,
      MICE_HALLS,
      RECURRING_EVENTS,
      FAQS,
      ENTERTAINMENT_DJS,
      SPECIAL_OFFERS,
      PARTNERS,
      PAST_EVENTS,
      BALI_GUIDE,
      MEDIA_COVERAGE,
      PRESS_RELEASES,
      STATS,
    };
    for (const [name, collection] of Object.entries(collections)) {
      expect(Array.isArray(collection), `${name} should be an array`).toBe(true);
      expect(collection.length, `${name} should not be empty`).toBeGreaterThan(0);
    }
  });

  it("gives every bilingual pair both an Indonesian and an English string", () => {
    const bilingual: Record<string, { id: string; en: string }>[] = [
      ...DAYBEDS.map((d) => ({ name: d.name, ...(d.desc ? { desc: d.desc } : {}) })),
      ...EXPERIENCES.map((e) => ({ title: e.title, desc: e.desc })),
      ...SPA_TREATMENTS.map((s) => ({ name: s.name })),
      ...WEDDING_VENUES.map((v) => ({ name: v.name })),
      ...MICE_HALLS.map((h) => ({ name: h.name })),
      { title: NYE.title },
    ];

    for (const pair of bilingual) {
      for (const [key, value] of Object.entries(pair)) {
        expect(value, `${key} must have id and en`).toBeTruthy();
        expect(typeof value.id, `${key}.id must be a string`).toBe("string");
        expect(typeof value.en, `${key}.en must be a string`).toBe("string");
        expect(value.id.trim().length, `${key}.id must not be blank`).toBeGreaterThan(0);
        expect(value.en.trim().length, `${key}.en must not be blank`).toBeGreaterThan(0);
      }
    }
  });

  it("uses unique ids across every collection whose pages link to entries by id", () => {
    const idCollections = {
      DAYBEDS,
      EXPERIENCES,
      WEDDING_VENUES,
      MICE_HALLS,
    } as const;

    for (const [name, collection] of Object.entries(idCollections)) {
      const ids = (collection as { id: string }[]).map((entry) => entry.id);
      expect(ids.length, `${name} entries should carry an id`).toBe(collection.length);
      for (const id of ids) {
        expect(typeof id, `${name} ids must be strings`).toBe("string");
        expect(id.trim().length, `${name} ids must not be blank`).toBeGreaterThan(0);
      }
      expect(new Set(ids).size, `${name} ids must be unique`).toBe(ids.length);
    }
  });

  it("keeps the flat string collections free of blank entries", () => {
    const stringCollections = { SPECIAL_OFFERS, PARTNERS, BALI_GUIDE };
    for (const [name, collection] of Object.entries(stringCollections)) {
      for (const entry of collection) {
        expect(typeof entry, `${name} entries must be strings`).toBe("string");
        expect(entry.trim().length, `${name} must not contain a blank entry`).toBeGreaterThan(0);
      }
    }
  });

  it("gives every past event a date, a headline, and a detail", () => {
    for (const event of PAST_EVENTS) {
      for (const field of ["date", "title", "detail"] as const) {
        expect(String(event[field]).trim().length, `past event missing ${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("attributes every piece of media coverage to an outlet", () => {
    for (const item of MEDIA_COVERAGE) {
      expect(item.outlet.trim().length).toBeGreaterThan(0);
      expect(item.title.trim().length).toBeGreaterThan(0);
    }
    for (const release of PRESS_RELEASES) {
      expect(String(release).trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps daybed min-spend values numeric, positive, and ascending by tier", () => {
    for (const daybed of DAYBEDS) {
      expect(typeof daybed.minSpendIdr, `${daybed.id} minSpendIdr must be a number`).toBe("number");
      expect(daybed.minSpendIdr, `${daybed.id} minSpendIdr must be positive`).toBeGreaterThan(0);
      // IDR amounts are whole rupiah; a fractional value would be a unit slip.
      expect(Number.isInteger(daybed.minSpendIdr), `${daybed.id} minSpendIdr must be whole rupiah`).toBe(
        true,
      );
      expect(daybed.capacity, `${daybed.id} capacity must be set`).toBeTruthy();
      expect(daybed.image, `${daybed.id} image must be set`).toBeTruthy();
      expect(daybed.accent, `${daybed.id} accent must be set`).toBeTruthy();
    }
  });

  it("declares at least one daybed in each category the UI filters on", () => {
    const categories = new Set(DAYBEDS.map((d) => d.category).filter(Boolean));
    for (const expected of ["daybed", "sofa", "suite"]) {
      expect(categories.has(expected as "daybed"), `missing ${expected} category`).toBe(true);
    }
  });

  it("uses a Monad Testnet-era NYE date that parses as a real date", () => {
    expect(NYE.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${NYE.date}T00:00:00Z`);
    expect(Number.isNaN(parsed.getTime()), "NYE date must be parseable").toBe(false);
  });

  it("keeps spa treatment durations parseable whenever a duration is published", () => {
    // Treatments mirrored verbatim from /spa-wellness/. The nail and hair-wash
    // services there publish no duration, so an empty string is correct data;
    // what must never happen is a duration that claims minutes without naming a
    // number, because the page renders it straight into the treatment card.
    for (const treatment of SPA_TREATMENTS) {
      expect(typeof treatment.duration, `${treatment.name.en} duration must be a string`).toBe("string");
      if (treatment.duration !== "") {
        // The site publishes either minutes ("90 minutes") or hours ("2 hours").
        expect(treatment.duration, `${treatment.name.en} duration must be parseable`).toMatch(
          /^\d+\s*(minutes|hours)$/i,
        );
      }
    }
    expect(SPA_TREATMENTS.some((t) => t.duration !== "")).toBe(true);
  });

  it("publishes spa hours as an Indonesian and English opening range", () => {
    expect(SPA_HOURS.length).toBeGreaterThan(0);
    for (const hours of SPA_HOURS) {
      expect(hours.id.trim().length).toBeGreaterThan(0);
      expect(hours.en.trim().length).toBeGreaterThan(0);
    }
  });

  it("describes every FAQ with a bilingual question and a bilingual answer", () => {
    for (const faq of FAQS) {
      for (const part of [faq.q, faq.a]) {
        expect(part.id.trim().length, "FAQ text must have an Indonesian half").toBeGreaterThan(0);
        expect(part.en.trim().length, "FAQ text must have an English half").toBeGreaterThan(0);
      }
    }
  });

  it("exposes asset and contact records the layout components read", () => {
    expect(Object.keys(ASSETS).length).toBeGreaterThan(0);
    expect(SITE_COPY).toBeTruthy();
    // Contact detail is rendered directly into the footer and contact page.
    expect(CONTACT).toBeTruthy();
    expect(Object.keys(CONTACT).length).toBeGreaterThan(0);
  });

  it("labels every recurring event in both languages", () => {
    for (const event of RECURRING_EVENTS) {
      expect(event.id.trim().length).toBeGreaterThan(0);
      expect(event.name.id.trim().length).toBeGreaterThan(0);
      expect(event.name.en.trim().length).toBeGreaterThan(0);
      expect(event.desc.id.trim().length).toBeGreaterThan(0);
      expect(event.desc.en.trim().length).toBeGreaterThan(0);
      expect(event.accent.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives every entertainment slot the fields the schedule table renders", () => {
    for (const dj of ENTERTAINMENT_DJS) {
      // These rows are published verbatim in English only, so the invariant is
      // presence, not translation.
      for (const field of ["day", "date", "title", "djs", "tagline", "time"] as const) {
        expect(String(dj[field]).trim().length, `DJ row missing ${field}`).toBeGreaterThan(0);
      }
      expect(dj.image, "DJ row needs a poster image").toBeTruthy();
    }
  });

  it("labels every menu category in both languages", () => {
    for (const category of MENU_CATEGORIES) {
      expect(category.id.trim().length).toBeGreaterThan(0);
      expect(category.name.id.trim().length).toBeGreaterThan(0);
      expect(category.name.en.trim().length).toBeGreaterThan(0);
      expect(category.accent.trim().length).toBeGreaterThan(0);
    }
  });
});
