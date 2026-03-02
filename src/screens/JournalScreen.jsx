// src/screens/JournalScreen.jsx
import { useState, useEffect, useCallback } from 'react';
import { auth, saveJournalEntry, getJournalEntries, getJournalEntry } from '../services/firebaseService';
import { generateWeeklySummary } from '../services/geminiService';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😠', label: 'Irritable', value: 'irritable' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '🥱', label: 'Tired', value: 'tired' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

// ─── Mini Calendar Component ───────────────────────────────────────────────────
function Calendar({ year, month, entries, selectedDate, onSelectDate, onMonthChange }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const entryMap = {};
  entries.forEach(e => {
    const { day } = parseDate(e.date);
    entryMap[day] = e;
  });

  const cells = [];
  // Empty leading cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => selectedDate === formatDate(year, month, d);

  return (
    <div className="glass-card p-5 mb-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onMonthChange(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary font-bold transition-all"
        >
          ‹
        </button>
        <h3 className="text-base font-bold text-text-primary">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={() => onMonthChange(1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary font-bold transition-all"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-text-secondary uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const entry = entryMap[day];
          const period = entry?.period;
          const mood = entry?.mood;
          const moodEmoji = MOODS.find(m => m.value === mood)?.emoji;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(formatDate(year, month, day))}
              className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-xl text-sm font-medium transition-all duration-150
                ${isSelected(day)
                  ? 'bg-primary text-white shadow-md scale-105'
                  : isToday(day)
                    ? 'bg-primary/15 text-primary font-bold ring-1 ring-primary/40'
                    : entry
                      ? 'bg-primary/5 text-text-primary hover:bg-primary/10'
                      : 'text-text-secondary hover:bg-gray-50'
                }`}
            >
              <span className="text-xs leading-none">{day}</span>
              <div className="flex gap-[2px] mt-0.5">
                {period && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" title="Period day" />
                )}
                {moodEmoji && !isSelected(day) && (
                  <span className="text-[8px] leading-none">{moodEmoji}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-primary/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
          <span className="text-[11px] text-text-secondary">Period day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary/30 inline-block" />
          <span className="text-[11px] text-text-secondary">Has entry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span className="text-[11px] text-text-secondary">Selected</span>
        </div>
      </div>
    </div>
  );
}

// ─── Log Form Component ────────────────────────────────────────────────────────
function DayLogForm({ date, existingEntry, onSave, onClose }) {
  const [mood, setMood] = useState(existingEntry?.mood || '');
  const [fatigue, setFatigue] = useState(existingEntry?.fatigue || 1);
  const [pain, setPain] = useState(existingEntry?.pain || 1);
  const [period, setPeriod] = useState(existingEntry?.period || false);
  const [ironIntake, setIronIntake] = useState(existingEntry?.ironIntake || false);
  const [water, setWater] = useState(existingEntry?.water || 6);
  const [notes, setNotes] = useState(existingEntry?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ mood, fatigue, pain, period, ironIntake, water, notes, date });
    } finally {
      setSaving(false);
    }
  };

  const { day: dayNum, month: monthIdx, year } = parseDate(date);
  const displayDate = `${dayNum} ${MONTH_NAMES[monthIdx]} ${year}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-text-primary">Log for {displayDate}</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {existingEntry ? 'Editing existing entry' : 'New entry'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-text-secondary transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mood */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-3 uppercase tracking-wide">
              Mood
            </label>
            <div className="grid grid-cols-6 gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  title={m.label}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${mood === m.value
                    ? 'border-primary bg-primary/10 scale-105'
                    : 'border-gray-100 hover:border-primary/30'
                    }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-[9px] text-text-secondary font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-3">
              <span className="text-xl">🩸</span>
              <div>
                <p className="text-sm font-bold text-text-primary">Period Today?</p>
                <p className="text-xs text-text-secondary">Mark if you're on your period</p>
              </div>
            </div>
            <button
              onClick={() => setPeriod(!period)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${period ? 'bg-rose-400' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${period ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Fatigue */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-text-primary uppercase tracking-wide">
                😴 Fatigue Level
              </label>
              <span className="text-sm font-bold text-primary">{fatigue}/5</span>
            </div>
            <input
              type="range" min="1" max="5" value={fatigue}
              onChange={e => setFatigue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-secondary mt-1">
              <span>Low</span><span>High</span>
            </div>
          </div>

          {/* Pain */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-text-primary uppercase tracking-wide">
                😣 Pain Level
              </label>
              <span className="text-sm font-bold text-primary">{pain}/5</span>
            </div>
            <input
              type="range" min="1" max="5" value={pain}
              onChange={e => setPain(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-secondary mt-1">
              <span>None</span><span>Severe</span>
            </div>
          </div>

          {/* Iron Intake & Water */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-text-primary">🥗 Iron Food</span>
                <button
                  onClick={() => setIronIntake(!ironIntake)}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${ironIntake ? 'bg-emerald-400' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${ironIntake ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="text-[10px] text-text-secondary">Ragi, spinach, drumstick leaves?</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm font-bold text-text-primary mb-2">💧 Water (cups)</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWater(Math.max(0, water - 1))}
                  className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-300 transition-all"
                >−</button>
                <span className="text-lg font-bold text-blue-600 min-w-[24px] text-center">{water}</span>
                <button
                  onClick={() => setWater(Math.min(20, water + 1))}
                  className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-300 transition-all"
                >+</button>
              </div>
            </div>
          </div>

          {/* Private Notes */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 uppercase tracking-wide">
              📝 Private Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any symptoms, thoughts, or observations..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 text-text-primary text-sm resize-none transition-all bg-gray-50 focus:bg-white"
            />
            <p className="text-[10px] text-text-secondary mt-1">🔒 Private — only visible to you</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || !mood}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              `${existingEntry ? 'Update' : 'Save'} Entry`
            )}
          </button>
          {!mood && (
            <p className="text-xs text-center text-text-secondary -mt-2">Please select a mood to save</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Summary Banner ─────────────────────────────────────────────────────────
function AISummaryBanner({ entries }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const generate = async () => {
    if (entries.length < 3) return;
    setLoading(true);
    try {
      const s = await generateWeeklySummary(entries.slice(0, 7));
      setSummary(s);
      setShown(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (entries.length < 3) return null;

  const riskColor = {
    High: 'bg-red-50 border-red-200 text-red-700',
    Moderate: 'bg-amber-50 border-amber-200 text-amber-700',
    Low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className="mb-6">
      {!shown ? (
        <button
          onClick={generate}
          disabled={loading}
          className="w-full py-3 border-2 border-dashed border-primary/30 text-primary font-semibold rounded-2xl hover:bg-primary/5 transition-all text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Generating AI summary...
            </>
          ) : (
            <>✨ Generate AI Weekly Insight</>
          )}
        </button>
      ) : summary ? (
        <div className="glass-card p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h4 className="font-bold text-text-primary text-sm">AI Weekly Insight</h4>
          </div>
          <p className="text-text-primary text-sm mb-3 leading-relaxed">{summary.summary}</p>
          {summary.pattern && (
            <p className="text-text-secondary text-xs mb-2">📊 <strong>Pattern:</strong> {summary.pattern}</p>
          )}
          {summary.suggestion && (
            <p className="text-text-secondary text-xs mb-3">💡 <strong>Tip:</strong> {summary.suggestion}</p>
          )}
          {summary.anemia_risk && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskColor[summary.anemia_risk] || riskColor.Low}`}>
              Anemia Risk: {summary.anemia_risk} — {summary.anemia_reason}
            </span>
          )}
          <button onClick={() => setShown(false)} className="mt-3 text-xs text-text-secondary hover:text-primary transition-colors block">
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─── Recent Entry List ─────────────────────────────────────────────────────────
function EntryList({ entries, onEdit }) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3">Recent Entries</h4>
      <div className="space-y-3">
        {entries.slice(0, 8).map(entry => {
          const { day, month: m } = parseDate(entry.date);
          const moodObj = MOODS.find(mo => mo.value === entry.mood);
          return (
            <button
              key={entry.id}
              onClick={() => onEdit(entry)}
              className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary leading-none">{day}</span>
                <span className="text-[9px] text-primary/70">{MONTH_NAMES[m].slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-base">{moodObj?.emoji || '😐'}</span>
                  <span className="text-sm font-semibold text-text-primary">{moodObj?.label || 'No mood'}</span>
                  {entry.period && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">Period</span>}
                </div>
                <div className="flex gap-3 text-[11px] text-text-secondary">
                  <span>Fatigue {entry.fatigue}/5</span>
                  <span>Pain {entry.pain}/5</span>
                  <span>💧{entry.water} cups</span>
                </div>
                {entry.notes && (
                  <p className="text-xs text-text-secondary mt-1 truncate">{entry.notes}</p>
                )}
              </div>
              <span className="text-text-secondary text-xs">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Journal Screen ───────────────────────────────────────────────────────
export default function JournalScreen() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const loadEntries = useCallback(async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setLoadingEntries(true);
    try {
      const data = await getJournalEntries(userId, monthKey);
      setEntries(data);
    } catch (e) {
      console.error('Failed to load entries:', e);
    } finally {
      setLoadingEntries(false);
    }
  }, [monthKey]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleMonthChange = (delta) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const existing = await getJournalEntry(userId, date);
    setEditingEntry(existing);
    setShowForm(true);
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleSave = async (entryData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await saveJournalEntry(userId, entryData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setShowForm(false);
    loadEntries();
  };

  const handleEditFromList = (entry) => {
    setSelectedDate(entry.date);
    setEditingEntry(entry);
    setShowForm(true);
  };

  // Count period days this month
  const periodCount = entries.filter(e => e.period).length;

  return (
    <div className="min-h-full pb-24 pt-8 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">My Journal</h2>
            <p className="text-text-secondary mt-1 text-sm">Track your health journey privately</p>
          </div>
          <button
            onClick={handleNewEntry}
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/80 transition-all"
          >
            + Log Today
          </button>
        </div>

        {/* Save Success Toast */}
        {saveSuccess && (
          <div className="mb-4 px-5 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-fade-in">
            <span className="text-emerald-500 text-lg">✓</span>
            <p className="text-emerald-700 font-semibold text-sm">Entry saved successfully!</p>
          </div>
        )}

        {/* Month Stats */}
        {!loadingEntries && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-extrabold text-primary">{entries.length}</p>
              <p className="text-[11px] text-text-secondary font-medium mt-0.5">Entries</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-extrabold text-rose-500">{periodCount}</p>
              <p className="text-[11px] text-text-secondary font-medium mt-0.5">Period days</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-extrabold text-amber-500">
                {entries.length > 0
                  ? Math.round(entries.reduce((s, e) => s + (e.fatigue || 0), 0) / entries.length)
                  : 0}
                /5
              </p>
              <p className="text-[11px] text-text-secondary font-medium mt-0.5">Avg fatigue</p>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {entries.length >= 3 && <AISummaryBanner entries={entries} />}

        {/* Calendar */}
        <Calendar
          year={viewYear}
          month={viewMonth}
          entries={entries}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onMonthChange={handleMonthChange}
        />

        {/* Empty State */}
        {!loadingEntries && entries.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">📔</div>
            <p className="text-text-primary text-lg font-bold mb-2">No entries yet this month</p>
            <p className="text-text-secondary text-sm mb-6">
              Tap any date on the calendar or "Log Today" to start tracking
            </p>
            <button
              onClick={handleNewEntry}
              className="px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/80 transition-all"
            >
              Start Tracking
            </button>
          </div>
        )}

        {/* Entry List */}
        {!loadingEntries && (
          <EntryList entries={entries} onEdit={handleEditFromList} />
        )}

        {loadingEntries && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-text-secondary text-sm mt-3">Loading entries...</p>
          </div>
        )}
      </div>

      {/* Log Form Modal */}
      {showForm && (
        <DayLogForm
          date={selectedDate}
          existingEntry={editingEntry}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}