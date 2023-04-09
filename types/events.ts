export enum EventType {
  EQUINOX = "EQUINOX",
  SOLSTICE = "SOLSTICE",
  HIATUS_SOLAR = "HIATUS_SOLAR",
  TRIPURA_SUNDARI_PEAK = "TRIPURA_SUNDARI_PEAK",
  FULL_MOON_PEAK = "FULL_MOON_PEAK",
  SHIVARATRI = "SHIVARATRI",
  NEW_MOON = "NEW_MOON",
  MOON_ECLIPSE = "MOON_ECLIPSE",
  SOLAR_ECLIPSE = "SOLAR_ECLIPSE",
}

export type EventBaseType = {
  type: EventType;
  startDate: string;
  endDate?: string;
  description?: string;
};
