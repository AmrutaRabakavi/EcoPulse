import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Calendar,
  MapPin,
  Award,
  Filter,
  Leaf,
  ChevronDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  fetchInitiatives,
  fetchInitiativeById,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  verifyInitiativeCompletion,
} from '../api/initiativeApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'TRANSPORT', label: 'Transport' },
  { id: 'ENERGY', label: 'Energy' },
  { id: 'WATER', label: 'Water' },
  { id: 'FOOD', label: 'Food' },
  { id: 'WASTE', label: 'Waste' },
  { id: 'COMMUNITY', label: 'Community' },
  { id: 'TREES', label: 'Trees & Nature' },
  { id: 'CAMPUS', label: 'Campus' },
];

const STATUSES = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const CATEGORY_VALUES = CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => c.id);
const STATUS_VALUES = STATUSES.filter((s) => s.id !== 'ALL').map((s) => s.id);

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'COMMUNITY',
  location: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  points: 10,
  status: 'UPCOMING',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const toDatetimeLocal = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'UPCOMING':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'TREES':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ENERGY':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'WATER':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'WASTE':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'TRANSPORT':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'FOOD':
      return 'bg-lime-50 text-lime-700 border-lime-200';
    case 'COMMUNITY':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'CAMPUS':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

// ── Initiative Form Modal ─────────────────────────────────────────────────────

const InitiativeFormModal = ({ isOpen, onClose, onSubmit, initialData, isEditing, submitting }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setForm({
          title: initialData.title || '',
          description: initialData.description || '',
          category: initialData.category || 'COMMUNITY',
          location: initialData.location || '',
          startDate: toDatetimeLocal(initialData.startDate),
          endDate: toDatetimeLocal(initialData.endDate),
          registrationDeadline: toDatetimeLocal(initialData.registrationDeadline),
          points: initialData.points ?? 10,
          status: initialData.status || 'UPCOMING',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [isOpen, isEditing, initialData]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 150) errs.title = 'Title must be ≤ 150 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length > 2000) errs.description = 'Description must be ≤ 2000 characters';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (form.registrationDeadline && form.endDate && new Date(form.registrationDeadline) > new Date(form.endDate)) {
      errs.registrationDeadline = 'Joining deadline cannot be after event end date';
    }
    const pts = Number(form.points);
    if (isNaN(pts) || pts < 0 || pts > 100) errs.points = 'Points must be 0–100';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      location: form.location.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      points: Number(form.points),
      status: form.status,
    });
  };

  if (!isOpen) return null;

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
      errors[name]
        ? 'border-rose-300 focus:ring-rose-200'
        : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-400'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Initiative' : 'Create Initiative'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass('title')}
              placeholder="e.g., Campus Tree Plantation Drive"
              maxLength={150}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={fieldClass('description')}
              rows={3}
              placeholder="Describe the initiative..."
              maxLength={2000}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
            <p className="text-xs text-slate-400 mt-0.5">{form.description.length}/2000</p>
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={fieldClass('category')}
              >
                {CATEGORY_VALUES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES.find((cat) => cat.id === c)?.label || c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={fieldClass('status')}
              >
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {STATUSES.find((st) => st.id === s)?.label || s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={fieldClass('location')}
              placeholder="e.g., North Quad Gardens"
            />
            {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={fieldClass('startDate')}
              />
              {errors.startDate && <p className="text-xs text-rose-600 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date *</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={fieldClass('endDate')}
              />
              {errors.endDate && <p className="text-xs text-rose-600 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Registration / Joining Deadline */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600">
                Last Date to Join (Registration Deadline)
              </label>
              <span className="text-[10px] text-slate-400">Optional (Defaults to Start Date)</span>
            </div>
            <input
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
              className={fieldClass('registrationDeadline')}
            />
            {errors.registrationDeadline && (
              <p className="text-xs text-rose-600 mt-1">{errors.registrationDeadline}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Students will not be able to join the event once this date and time passes.
            </p>
          </div>

          {/* Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">EcoPoints (0–100)</label>
            <input
              type="number"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
              className={fieldClass('points')}
              min={0}
              max={100}
            />
            {errors.points && <p className="text-xs text-rose-600 mt-1">{errors.points}</p>}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Initiative'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, initiative, deleting }) => {
  if (!isOpen || !initiative) return null;

  const hasParticipants = (initiative.participantCount || initiative.participants?.length || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-xl">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Initiative</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-sm font-semibold text-slate-800 truncate">{initiative.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {initiative.category} · {initiative.status} · {initiative.participantCount ?? initiative.participants?.length ?? 0} participants
          </p>
        </div>

        {hasParticipants && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              This initiative has active participants and <strong>cannot be deleted</strong>.
              Cancel or complete the initiative instead to preserve participation records.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting || hasParticipants}
            className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Delete Initiative
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Verify Completion Modal ───────────────────────────────────────────────────

const VerifyCompletionModal = ({ isOpen, onClose, onConfirm, initiative, verifying }) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const participants = initiative?.participants || [];
  const verifiedList = initiative?.verifiedParticipants || [];
  
  // Initialize selection with unverified participants when modal opens
  useEffect(() => {
    if (initiative && participants.length > 0) {
      const verifiedIds = new Set(verifiedList.map((v) => (v._id || v).toString()));
      const unverifiedIds = participants
        .map((p) => (p._id || p).toString())
        .filter((id) => !verifiedIds.has(id));
      setSelectedStudentIds(unverifiedIds);
    } else {
      setSelectedStudentIds([]);
    }
  }, [initiative]);

  if (!isOpen || !initiative) return null;

  const verifiedIds = new Set(verifiedList.map((v) => (v._id || v).toString()));
  const unverifiedParticipants = participants.filter(
    (p) => !verifiedIds.has((p._id || p).toString())
  );

  const isAllSelected =
    unverifiedParticipants.length > 0 &&
    unverifiedParticipants.every((p) =>
      selectedStudentIds.includes((p._id || p).toString())
    );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(unverifiedParticipants.map((p) => (p._id || p).toString()));
    }
  };

  const toggleStudent = (idStr) => {
    if (selectedStudentIds.includes(idStr)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== idStr));
    } else {
      setSelectedStudentIds([...selectedStudentIds, idStr]);
    }
  };

  const handleConfirmClick = () => {
    onConfirm(selectedStudentIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verify Event & Award Points</h3>
              <p className="text-xs text-slate-500">Select students who completed the initiative</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Initiative Card Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{initiative.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  📍 {initiative.location} • 📂 {initiative.category}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex-shrink-0">
                +{initiative.points} pts / student
              </span>
            </div>
          </div>

          {/* Student Selection Controls */}
          {participants.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No Students Registered</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No students joined this initiative yet. Confirming will set status to COMPLETED without distributing points.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Enrolled Students ({participants.length})
                </span>

                {unverifiedParticipants.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
                  >
                    {isAllSelected ? 'Deselect All' : 'Select All (' + unverifiedParticipants.length + ')'}
                  </button>
                )}
              </div>

              {/* List of students */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {participants.map((p) => {
                  const idStr = (p._id || p).toString();
                  const isAlreadyVerified = verifiedIds.has(idStr);
                  const isChecked = selectedStudentIds.includes(idStr);

                  return (
                    <div
                      key={idStr}
                      onClick={() => {
                        if (!isAlreadyVerified) toggleStudent(idStr);
                      }}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isAlreadyVerified
                          ? 'bg-slate-50 border-slate-200/60 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 cursor-pointer shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked || isAlreadyVerified}
                          disabled={isAlreadyVerified}
                          onChange={() => {}}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 pointer-events-none"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {p.fullName || 'Student'}
                            </span>
                            {p.collegeId && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {p.collegeId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {p.email} {p.department ? '• ' + p.department : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isAlreadyVerified ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            <span>Awarded</span>
                          </span>
                        ) : (
                          <span className="text-xs font-black text-emerald-700">
                            +{initiative.points} pts
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status summary pill */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                <span>Selected for verification:</span>
                <strong className="text-emerald-800 font-bold">
                  {selectedStudentIds.length} student{selectedStudentIds.length === 1 ? '' : 's'} (
                  {selectedStudentIds.length * (initiative.points || 10)} total pts)
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmClick}
            disabled={verifying || (participants.length > 0 && selectedStudentIds.length === 0)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {verifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <ShieldCheck className="w-4 h-4" />
            <span>
              {participants.length === 0
                ? 'Mark as Completed'
                : selectedStudentIds.length === unverifiedParticipants.length && unverifiedParticipants.length > 0
                ? 'Verify All (' + selectedStudentIds.length + ')'
                : 'Verify Selected (' + selectedStudentIds.length + ')'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Initiatives Page ───────────────────────────────────────────────

const AdminInitiativesPage = () => {
  const { user } = useAuth();

  // List state
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Verify modal state
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Feedback
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiError, setApiError] = useState(null);

  // ── Fetch list ──────────────────────────────────────────────────────────
  const loadInitiatives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (categoryFilter !== 'ALL') filters.category = categoryFilter;
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      const data = await fetchInitiatives(filters);
      setInitiatives(data.initiatives || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load initiatives');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ── Create ──────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setSubmitting(true);
    setApiError(null);
    try {
      await createInitiative(formData);
      setSuccessMsg('Initiative created successfully');
      setFormOpen(false);
      await loadInitiatives();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to create initiative');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const openEdit = async (initiative) => {
    try {
      const data = await fetchInitiativeById(initiative._id);
      setEditTarget(data.initiative);
      setApiError(null);
      setFormOpen(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to load initiative details');
    }
  };

  const handleUpdate = async (formData) => {
    if (!editTarget) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await updateInitiative(editTarget._id, formData);
      setSuccessMsg('Initiative updated successfully');
      setFormOpen(false);
      setEditTarget(null);
      await loadInitiatives();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to update initiative');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setApiError(null);
    try {
      await deleteInitiative(deleteTarget._id);
      setSuccessMsg('Initiative deleted successfully');
      setDeleteTarget(null);
      await loadInitiatives();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to delete initiative');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Verify Completion ──────────────────────────────────────────────────
  const openVerify = async (initiative) => {
    try {
      const data = await fetchInitiativeById(initiative._id);
      setVerifyTarget(data.initiative);
      setApiError(null);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to load initiative details');
    }
  };

  const handleVerify = async (studentIds) => {
    if (!verifyTarget) return;
    setVerifying(true);
    setApiError(null);
    try {
      const res = await verifyInitiativeCompletion(verifyTarget._id, studentIds);
      setSuccessMsg(res.message || 'Initiative completion verified and points awarded!');
      setVerifyTarget(null);
      await loadInitiatives();
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to verify initiative');
      setVerifyTarget(null);
    } finally {
      setVerifying(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            Manage Initiatives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, and manage campus sustainability initiatives
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(null);
            setApiError(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Create Initiative
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium rounded-xl">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto p-0.5 hover:bg-emerald-100 rounded-lg transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* API error banner */}
      {apiError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="ml-auto p-0.5 hover:bg-rose-100 rounded-lg transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Filters
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          onClick={loadInitiatives}
          className="ml-auto p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">{error}</p>
          <button
            onClick={loadInitiatives}
            className="mt-3 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
          >
            Try Again
          </button>
        </div>
      ) : initiatives.length === 0 ? (
        <div className="text-center py-16">
          <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No initiatives found</p>
          <p className="text-xs text-slate-400 mt-1">
            {categoryFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try changing the filters above'
              : 'Create the first campus initiative'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initiatives.map((init) => (
            <div
              key={init._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{init.title}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(init.status)}`}>
                      {init.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />}
                      {init.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryColor(init.category)}`}>
                      {init.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{init.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {init.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(init.startDate)} — {formatDate(init.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {init.participantCount ?? 0} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {init.points} pts
                    </span>
                    {init.registrationDeadline && (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Join by: {formatDate(init.registrationDeadline)}
                      </span>
                    )}
                    {init.organizer && (
                      <span className="flex items-center gap-1 text-slate-400">
                        • Created by: <strong className="text-slate-600">{init.organizer.fullName || 'Admin'}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(() => {
                  const currentUserId = user?._id || user?.id;
                  const organizerId = (init.organizer?._id || init.organizer)?.toString();
                  const isCreator = !organizerId || organizerId === currentUserId?.toString();

                  return (
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      {isCreator ? (
                        <>
                          <button
                            onClick={() => openVerify(init)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition shadow-xs"
                            title="Verify event completion and award EcoPoints to participants"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verify Event</span>
                          </button>
                          <button
                            onClick={() => openEdit(init)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-xl transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(init)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-xl transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed"
                          title={`Created by ${init.organizer?.fullName || 'another admin'}. Only the creator can verify or modify.`}
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Organized by {init.organizer?.fullName?.split(' ')[0] || 'Peer Admin'}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <InitiativeFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
          setApiError(null);
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        initialData={editTarget}
        isEditing={!!editTarget}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        initiative={deleteTarget}
        deleting={deleting}
      />

      {/* Verify Completion Modal */}
      <VerifyCompletionModal
        isOpen={!!verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleVerify}
        initiative={verifyTarget}
        verifying={verifying}
      />
    </div>
  );
};

export default AdminInitiativesPage;
