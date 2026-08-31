# Gujarat District Map (clickable, filters like your dropdown)

## Files
- `src/assets/gujaratDistrictPaths.js` — Gujarat's 34 district boundaries, pre-converted to SVG paths (no extra map library needed).
- `src/components/GujaratDistrictMap.jsx` — the map component.

## How to use (drop-in, same pattern as your existing FilterBar)

```jsx
import GujaratDistrictMap from "../components/GujaratDistrictMap";

<GujaratDistrictMap
  district={district}         // same state you already pass to FilterBar
  setDistrict={setDistrict}   // same setter — clicking a district calls this
  districts={districts}       // same array you feed the dropdown's MenuItems
/>
```

That's it — clicking a district on the map sets `district` to the exact
value from your `districts` list, so every chart/table on the page that
already reads `district` filters exactly as it does today with the dropdown.
Put it next to (or instead of) `<FilterBar />` / `<DistrictFilterBar />`.

## Optional: colour districts by a metric (choropleth, like the PowerBI shading)

```jsx
<GujaratDistrictMap
  district={district}
  setDistrict={setDistrict}
  districts={districts}
  dataByDistrict={{ Ahmedabad: 82, Surat: 78, Kachchh: 55, ... }}
  metricLabel="Avg Score"
  valueSuffix="%"
/>
```

Darker = higher value. Selected district always shows in blue regardless
of its value, so it stays visually distinct. Hovering shows a tooltip with
the district name + value.

## Spelling mismatches (important)

Your data/dropdown and the boundary file don't always spell districts the
same way (`Kachchh` vs `Kutch`, `Sabar Kantha` vs `Sabarkantha`, `Panch
Mahals` vs `Panchmahal`, `Devbhoomi Dwarka` vs `Devbhumi Dwarka`, `Dang` vs
`The Dangs`, `Chhotaudepur` vs `Chhota Udaipur`). The component already
normalizes spacing/case and has an alias table for these known cases, so
it should just work with whatever spelling your `districts` array uses.

If any single district doesn't highlight/color correctly, open
`GujaratDistrictMap.jsx` and add a line to the `ALIASES` object near the
top — key is the boundary file's name (normalized, lowercase, no spaces),
value is a list with your data's spelling (also normalized). Example:

```js
const ALIASES = {
  kutch: ["kachchh", "kutchh"],
  ...
  // add more here if needed
};
```

## Data source note
District boundaries are 2011-census-based public boundary data (from the
`udit-001/india-maps-data` GitHub repo), simplified for a lighter file
size. They're good enough for a filter-map like this but are not
survey-grade — don't use them for anything needing precise borders.
