"use client";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Autocomplete, Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoLocation } from "../../../lib/calculator";
import { track } from "../../../utils/mixpanel";
import { useTranslation } from "./TranslationProvider";

type NominatimSearchItem = {
  display_name: string;
  lat: string;
  lon: string;
  address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
};

const LOCATION_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function setLocationCookie(loc: GeoLocation) {
  const value = encodeURIComponent(JSON.stringify(loc));
  // biome-ignore lint/suspicious/noDocumentCookie: cookie is set in the browser
  document.cookie = `location=${value};path=/;max-age=${LOCATION_COOKIE_MAX_AGE};SameSite=Lax`;
}

async function searchPlaces(q: string): Promise<NominatimSearchItem[]> {
  const params = new URLSearchParams({ action: "search", q });
  const res = await fetch(`/api/v2/geocode?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ display_name: string; city?: string; timezone?: string } | null> {
  const params = new URLSearchParams({
    action: "reverse",
    lat: String(lat),
    lon: String(lon),
  });
  const res = await fetch(`/api/v2/geocode?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const display_name =
    typeof data.display_name === "string"
      ? data.display_name
      : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  const address = data.address ?? {};
  const city =
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    address.county ??
    address.state ??
    undefined;
  return { display_name, city, timezone: undefined };
}

type LocationSelectorProps = {
  value: GeoLocation | null;
  onChange: (location: GeoLocation) => void;
};

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const { t } = useTranslation();
  const valueDisplay =
    value?.city ?? (value ? `${value.lat.toFixed(2)}, ${value.lng.toFixed(2)}` : "");
  const [inputValue, setInputValue] = useState(valueDisplay);
  const [options, setOptions] = useState<NominatimSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchOptions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setOptions([]);
      return;
    }
    setLoading(true);
    track("Location Search", { query: q });
    try {
      const items = await searchPlaces(q);
      setOptions(items);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(valueDisplay);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [valueDisplay]);

  const handleInputChange = useCallback(
    (v: string) => {
      setInputValue(v);
      if (v.trim() === valueDisplay.trim()) {
        setOptions([]);
        return;
      }
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        searchTimeoutRef.current = null;
        if (!v.trim()) {
          setOptions([]);
          return;
        }
        fetchOptions(v);
      }, 300);
    },
    [valueDisplay, fetchOptions]
  );

  const handleFocus = () => {
    setOpen(true);
    track("Location Focus");
  };

  const handleSelect = (_: unknown, option: NominatimSearchItem | string | null) => {
    if (!option || typeof option === "string") return;
    const lat = parseFloat(option.lat);
    const lon = parseFloat(option.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const city =
      option.address?.city ??
      option.address?.town ??
      option.address?.village ??
      option.display_name;
    const location: GeoLocation = {
      lng: lon,
      lat,
      city: city ?? option.display_name,
      timezone: "UTC",
    };
    setLocationCookie(location);
    onChange(location);
    setInputValue(option.display_name);
    setOptions([]);
    track("Location Select", { display_name: option.display_name });
  };

  const handleMyLocation = () => {
    track("Location Geolocation Request");
    if (!navigator.geolocation) {
      track("Location Geolocation Unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        track("Location Geolocation Success", { lat, lon });
        const rev = await reverseGeocode(lat, lon);
        const location: GeoLocation = {
          lng: lon,
          lat,
          city: rev?.city ?? rev?.display_name ?? undefined,
          timezone: rev?.timezone ?? "UTC",
        };
        setLocationCookie(location);
        onChange(location);
        setInputValue(rev?.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      },
      () => {
        track("Location Geolocation Denied");
      }
    );
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
        {t("location.label")}
      </Typography>
      <Autocomplete
        fullWidth
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        inputValue={inputValue}
        onInputChange={(_, v, reason) => {
          if (reason === "input") handleInputChange(v);
          else setInputValue(v);
        }}
        options={options}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.display_name)}
        loading={loading}
        onFocus={handleFocus}
        onChange={handleSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t("location.placeholder")}
            size="small"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    <Tooltip title={t("location.myLocation")}>
                      <IconButton onClick={handleMyLocation} edge="end" size="small">
                        <MyLocationIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
    </Box>
  );
}
