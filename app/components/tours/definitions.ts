export type TourStep = {
  id: string;
  element?: string;
  titleKey: string;
  descKey: string;
};

export type TourDefinition = {
  id: string;
  trigger: "auto" | "manual";
  labelKey: string;
  steps: TourStep[];
};

export const TOURS: TourDefinition[] = [
  {
    id: "intro",
    trigger: "auto",
    labelKey: "tour.intro.label",
    steps: [
      {
        id: "welcome",
        titleKey: "tour.intro.welcome.title",
        descKey: "tour.intro.welcome.description",
      },
      {
        id: "theme",
        element: '[data-tour="theme"]',
        titleKey: "tour.intro.theme.title",
        descKey: "tour.intro.theme.description",
      },
      {
        id: "language",
        element: '[data-tour="language"]',
        titleKey: "tour.intro.language.title",
        descKey: "tour.intro.language.description",
      },
      {
        id: "calendar",
        element: '[data-tour="calendar"]',
        titleKey: "tour.intro.calendar.title",
        descKey: "tour.intro.calendar.description",
      },
      {
        id: "location",
        element: '[data-tour="location"]',
        titleKey: "tour.intro.location.title",
        descKey: "tour.intro.location.description",
      },
      {
        id: "navigation",
        element: '[data-tour="navigation"]',
        titleKey: "tour.intro.navigation.title",
        descKey: "tour.intro.navigation.description",
      },
      {
        id: "events",
        element: '[data-tour="events"]',
        titleKey: "tour.intro.events.title",
        descKey: "tour.intro.events.description",
      },
    ],
  },
  {
    id: "calendar-dialog",
    trigger: "manual",
    labelKey: "tour.calendarDialog.label",
    steps: [
      {
        id: "welcome",
        titleKey: "tour.calendarDialog.welcome.title",
        descKey: "tour.calendarDialog.welcome.description",
      },
      {
        id: "url",
        element: '[data-tour="calendar-url"]',
        titleKey: "tour.calendarDialog.url.title",
        descKey: "tour.calendarDialog.url.description",
      },
      {
        id: "copy",
        element: '[data-tour="calendar-copy"]',
        titleKey: "tour.calendarDialog.copy.title",
        descKey: "tour.calendarDialog.copy.description",
      },
    ],
  },
];

export function findTour(id: string): TourDefinition | undefined {
  return TOURS.find((t) => t.id === id);
}
