# Feature Specification: Today's Transit Chart

**Version:** 1.0  
**Status:** Draft  
**Feature Area:** Birth Chart / Transit Module

---

## Overview

The "Today's Transit" feature allows a logged-in user to instantly generate a birth chart using the current date, current local time, and their detected or manually selected location. The chart is pre-populated from session data and geolocation, requiring minimal user interaction.

---

## Goals

- Reduce friction for generating a real-time transit chart.
- Automatically populate name from the active session.
- Auto-detect user location via browser Geolocation API (GeoIP fallback).
- Allow manual location override via city search dropdown.
- Submit a valid chart request to the existing birth chart API endpoint.

---

## User Story

> As a logged-in user, I want to generate a chart for today with a single click, using my current location and time, so I can see my current transits without manually entering birth details.

---

## Functional Requirements

### FR-01: Session Name Auto-Population

- The `name` field in the API request must be populated from the current authenticated user session.
- Source: `session.user.name` or equivalent session attribute.
- The field must NOT be editable by the user in this flow (read-only display).
- If the session name is unavailable, display an error and block submission.

---

### FR-02: Date and Time Auto-Population

- `dateOfBirth` must be set to **today's date** in `YYYY-MM-DD` format, resolved at the moment of page load.
- `timeOfBirth` must be set to the **current local time** in `HH:MM` format (24-hour), resolved at the moment of page load or submission.
- Both values must be recalculated at the time of API submission (not cached from page load) to account for time passing.
- Neither field is shown to the user as editable in this flow.

---

### FR-03: Location Detection (Geolocation Permission)

- On page load or on user action (e.g., clicking "Detect My Location"), the app must request browser Geolocation permission via the `navigator.geolocation.getCurrentPosition()` API.
- Display a clear permission prompt explanation before triggering the browser dialog:
  > "To generate your transit chart, we need your current location. Your location is only used for this chart and is not stored."
- On permission granted:
  - Reverse-geocode the coordinates to a human-readable city and country string (e.g., `"Skopje, North Macedonia"`).
  - Populate the `location` field with this string.
  - Display the resolved location to the user in a read-only field.
- On permission denied:
  - Fall back to city search input (see FR-04).
  - Display a non-blocking notice: "Location access was denied. Please select your city manually."
- On geolocation error or timeout:
  - Fall back to city search input (see FR-04).
  - Log the error for debugging.

---

### FR-04: Manual City Selection (Dropdown Search)

- Display a city search input field that activates when:
  - Geolocation is denied or fails, OR
  - The user explicitly clicks "Change Location."
- The input must trigger a city search after the user types at least **3 characters**.
- City search must query a supported geocoding or city database API (e.g., OpenStreetMap Nominatim, Google Places Autocomplete, or internal dataset).
- Dropdown must display results as: `City, Country` (e.g., `Belgrade, Serbia`).
- On city selection:
  - Populate the `location` field with the selected value in `City, Country` format.
  - Update the displayed location in the UI.
- Debounce the search input with a delay of at least **300ms** to avoid excessive API calls.
- Minimum result threshold: if fewer than 1 result is returned, display "No cities found."

---

### FR-05: API Request Construction

The feature must construct and submit the following POST request upon user confirmation:

**Endpoint:**
```
POST http://144.76.78.183:9000/api/v1/birth-charts
```

**Request Body:**
```json
{
  "birthInfo": {
    "dateOfBirth": "<today's date in YYYY-MM-DD>",
    "timeOfBirth": "<current time in HH:MM>",
    "location": "<resolved city string, e.g. 'Skopje, North Macedonia'>",
    "isTimeApproximate": false,
    "gender": "male",
    "name": "<session user name>"
  },
  "chartStyle": "north_indian",
  "ayanamsa": "lahiri",
  "houseSystem": "equal",
  "isPublic": false,
  "metadata": {}
}
```

**Fields that are auto-populated and NOT editable by the user in this flow:**

| Field | Source |
|---|---|
| `name` | Session (logged-in user) |
| `dateOfBirth` | System clock (today's date) |
| `timeOfBirth` | System clock (current time) |
| `location` | Geolocation API or city dropdown |
| `isTimeApproximate` | Always `false` |
| `chartStyle` | Hardcoded: `north_indian` |
| `ayanamsa` | Hardcoded: `lahiri` |
| `houseSystem` | Hardcoded: `equal` |
| `isPublic` | Hardcoded: `false` |

---

### FR-06: Submission Flow

1. User lands on the "Today's Transit" page or opens the modal.
2. App requests geolocation permission (with explanation shown first).
3. Location resolves (auto or manual).
4. User sees:
   - Their name (read-only).
   - Today's date (read-only).
   - Current time (read-only, optionally live-updating).
   - Resolved location (editable via "Change Location" action).
5. User clicks **"Generate My Chart"** button.
6. App constructs the API request with current time at moment of click.
7. Loading state shown during API call.
8. On success: render the chart view.
9. On API error: display user-friendly error message with retry option.

---

## Non-Functional Requirements

- Location permission request must comply with browser standards and must not auto-trigger without user context.
- No location data is to be stored server-side beyond what is included in the chart API request.
- City search must handle special characters (e.g., diacritics in city names).
- The feature must be responsive and usable on mobile browsers.
- Geolocation reverse-geocoding must return results in under 3 seconds; otherwise fall back to manual city entry.

---

## Out of Scope (v1.0)

- Gender selection (hardcoded to `male` for now; to be addressed in a future iteration).
- Editable chart style, ayanamsa, or house system settings in this flow.
- Storing or reusing previously detected locations.
- Anonymous (non-logged-in) user access to this feature.

---

## Open Questions

1. Which reverse-geocoding service should be used? (Nominatim, Google, internal?)
2. Should the city search use the same geocoding service or a separate city dataset?
3. What is the expected `gender` value strategy when session data includes gender? Should it auto-populate from profile?
4. Should the chart be saved to the user's history automatically, or only on explicit save?

---

## Acceptance Criteria

- [ ] Name is auto-populated from session and not editable.
- [ ] Date is always today's date at time of submission.
- [ ] Time is always the current time at moment of submission.
- [ ] Geolocation permission prompt is shown with explanation before browser dialog.
- [ ] Location is resolved from geolocation and displayed to the user.
- [ ] If geolocation is denied, city search input is shown.
- [ ] City search activates after 3 characters are typed.
- [ ] City selection populates the location field in correct format.
- [ ] API request is constructed correctly with all required fields.
- [ ] Loading and error states are handled gracefully.
- [ ] Feature is not accessible to unauthenticated users.
