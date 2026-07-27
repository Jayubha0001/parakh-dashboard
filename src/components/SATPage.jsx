// SATPage.jsx
// "SAT 2025-26" page — Sem 2 results, loaded LIVE from the Excel workbook in
// /public (see satExcelService.js). Follows the same drill-down pattern as
// PGI: State -> District -> Grade -> Subject -> Learning Outcome, and uses
// the same grading scale (Akanshi-3 ... Daksh) read straight from the
// workbook's Grading_Scale sheet.

import React, { useEffect, useMemo, useState } from 'react';
import {
  loadSATData,
  getDistrictsRanked,
  getGradesForDistrict,
  getSubjectsForGrade,
  getLOsForSubject,
  getBand,
} from './satExcelService';
import './SATPage.css';

function Bar({ pct, bands }) {
  const band = getBand(bands, pct);
  return (
    <div className="sat-bar-track">
      <div
        className="sat-bar-fill"
        style={{ width: `${Math.max(pct ?? 0, 2)}%`, background: band.color }}
      />
    </div>
  );
}

function PctPill({ pct, bands }) {
  const band = getBand(bands, pct);
  return (
    <span className="sat-pill" style={{ background: band.color }} title={band.label}>
      {pct != null ? `${pct.toFixed(2)}%` : '—'}
    </span>
  );
}

function Breadcrumb({ trail, onJump }) {
  return (
    <div className="sat-breadcrumb">
      {trail.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span className="sat-crumb-sep">›</span>}
          <button
            className={`sat-crumb ${i === trail.length - 1 ? 'sat-crumb-active' : ''}`}
            onClick={() => onJump(i)}
            disabled={i === trail.length - 1}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export function SATPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [district, setDistrict] = useState(null);
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    loadSATData()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const districts = useMemo(() => (data ? getDistrictsRanked(data) : []), [data]);
  const grades = useMemo(
    () => (data && district ? getGradesForDistrict(data, district) : []),
    [data, district]
  );
  const subjects = useMemo(
    () => (data && district && grade ? getSubjectsForGrade(data, district, grade) : []),
    [data, district, grade]
  );
  const los = useMemo(
    () => (data && district && grade && subject ? getLOsForSubject(data, district, grade, subject) : []),
    [data, district, grade, subject]
  );

  if (error) {
    return (
      <div className="sat-page">
        <div className="sat-error">
          <strong>Data load na thayu.</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="sat-page">
        <div className="sat-loading">SAT data load thay rahyu che…</div>
      </div>
    );
  }

  const bands = data.bands;
  const trail = [{ label: 'ગુજરાત રાજ્ય' }];
  if (district) trail.push({ label: district });
  if (grade) trail.push({ label: grade });
  if (subject) trail.push({ label: subject });

  const handleJump = (index) => {
    if (index === 0) {
      setDistrict(null);
      setGrade(null);
      setSubject(null);
    } else if (index === 1) {
      setGrade(null);
      setSubject(null);
    } else if (index === 2) {
      setSubject(null);
    }
  };

  return (
    <div className="sat-page">
      <header className="sat-header">
        <div>
          <h1>SAT 2025-26</h1>
          <p className="sat-subtitle">Semester 2 · Student Assessment Test — Result Dashboard</p>
        </div>
        {data.stateTotal && (
          <div className="sat-state-total">
            <span className="sat-state-total-label">રાજ્ય કક્ષાનું પરિણામ</span>
            <span className="sat-state-total-value">{data.stateTotal.pct.toFixed(2)}%</span>
          </div>
        )}
      </header>

      <Breadcrumb trail={trail} onJump={handleJump} />

      {!district && (
        <section className="sat-section">
          <h2>જિલ્લા મુજબ પરિણામ (District Wise)</h2>
          <div className="sat-table">
            <div className="sat-table-head">
              <span>ક્રમ</span>
              <span>જિલ્લો</span>
              <span>ટકાવારી</span>
              <span></span>
            </div>
            {districts.map((row) => (
              <button
                key={row.district}
                className="sat-table-row sat-row-clickable"
                onClick={() => setDistrict(row.district)}
              >
                <span className="sat-rank">{row.rank}</span>
                <span className="sat-name">{row.district}</span>
                <span><PctPill pct={row.pct} bands={bands} /></span>
                <Bar pct={row.pct} bands={bands} />
              </button>
            ))}
          </div>
        </section>
      )}

      {district && !grade && (
        <section className="sat-section">
          <h2>{district} — ધોરણ મુજબ પરિણામ (Grade Wise)</h2>
          <div className="sat-card-grid">
            {grades.map((g) => (
              <button key={g.grade} className="sat-card" onClick={() => setGrade(g.grade)}>
                <div className="sat-card-title">{g.grade}</div>
                <PctPill pct={g.pct} bands={bands} />
                <Bar pct={g.pct} bands={bands} />
              </button>
            ))}
          </div>
        </section>
      )}

      {district && grade && !subject && (
        <section className="sat-section">
          <h2>{district} · {grade} — વિષય મુજબ પરિણામ (Subject Wise)</h2>
          <div className="sat-card-grid">
            {subjects.map((s) => (
              <button key={s.subject} className="sat-card" onClick={() => setSubject(s.subject)}>
                <div className="sat-card-title">{s.subject}</div>
                <PctPill pct={s.pct} bands={bands} />
                <Bar pct={s.pct} bands={bands} />
              </button>
            ))}
          </div>
        </section>
      )}

      {district && grade && subject && (
        <section className="sat-section">
          <h2>{subject} — અધ્યયન નિષ્પત્તિ મુજબ પરિણામ (LO Wise)</h2>
          <p className="sat-hint">સૌથી નબળી નિષ્પત્તિઓ (LO) સૌથી પહેલા બતાવેલ છે.</p>
          <div className="sat-lo-list">
            {los.map((lo) => (
              <div key={lo.lo} className="sat-lo-row">
                <div className="sat-lo-meta">
                  <span className="sat-lo-code">{lo.lo}</span>
                  <PctPill pct={lo.pct} bands={bands} />
                </div>
                <div className="sat-lo-indicator">{lo.indicator}</div>
                <Bar pct={lo.pct} bands={bands} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default SATPage;
