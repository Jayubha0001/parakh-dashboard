# SAT 2025-26 Page — Integration (Excel-Live-Loading Version)

Aa version ma data **pre-built JSON thi nathi avtu** — page load thay tyare
browser j directly `/public` ni Excel file fetch kari, parse kari, ane
screen par batave che. Excel update karo → app ma navi values automatic
aavi jashe (rebuild ni jarur nathi).

## Files
```
src/components/SAT/
  satExcelService.js   → Excel fetch + parse (SheetJS) + data getters
  SATPage.jsx           → page component (loading / error state sathe)
  SATPage.css           → styling
```

## Setup steps

1. **`xlsx` package install karo** (jo PGI pages pehla thi vapri rahya hoy to
   already hase, skip kari shako):
   ```
   npm install xlsx
   ```

2. **Excel file `public/` folder ma hovi joiye** — screenshot mujab tamara
   `public` folder ma already file mukel che. `satExcelService.js` ni
   sherua ma aa line che:
   ```js
   const EXCEL_PATH = '/Gujarat_PARAKH_PGI_Comprehensive_Template.xlsx';
   ```
   **Aa filename tamara `public` folder ma jem exact save karyu hoy tem
   match karvu joiye** (case-sensitive). Different naam hoy to fakt aa
   line update kari do.

3. **Files copy karo** — `src/components/SAT/` folder tamara project ma paste.

4. **Route add karo** (PGI ni niche):
   ```jsx
   import SATPage from './components/SAT/SATPage';
   <Route path="/sat" element={<SATPage />} />
   ```
   ```jsx
   <NavLink to="/sat">SAT 2025-26</NavLink>
   ```

5. `npm run dev` — pehli vaar page khulshe tyare "SAT data load thay rahyu
   che…" batashe (Excel parse thavama થોડી second lage, khaskarine LO sheet
   10,700+ rows ni hovathi) — pachi data cache thai jay che, biji vaar
   navigate karo to tarat batashe.

## Grading scale — hવे khare khari PGI scale j vapri che
Tamara template ni `Grading_Scale` sheet mathi j (Akanshi-3 thi Daksh, 10
bands) service automatic vachi le che — koi manually match karvani jarur
nathi. Jo Excel ma e sheet nu naam badle, to `satExcelService.js` ma
`SHEET_CANDIDATES.gradingScale` update kari do.

## Sheet name matching
Tamara comprehensive template ma sheets nu naam "SAT " prefix sathe che
(`SAT District Wise` etc.) — service e naam ne pehla try kare, na male to
fallback tarike "SAT " vinu naam pan try kare. Etle SAT-only excel ane
comprehensive template — banne sathe kaam kare.

## Structure — PGI jevu j
District → Grade → Subject → Learning Outcome drill-down, breadcrumb thi
pacha java shakay, LO list ma sauthi nabdi LO pehla batavel che.
