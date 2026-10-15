import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  Leaf,
  Info,
  ChevronRight,
  UserCheck,
  Building,
  Check,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  Globe,
  Sparkles,
} from 'lucide-react';
import {
  fetchInitiatives,
  fetchInitiativeById,
  joinInitiative,
  leaveInitiative,
  fetchCampusImpactMetrics,
} from '../api/initiativeApi';

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
  { id: 'ACTIVE', label: 'Active (Open)' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCategoryBadgeClass = (category) => {
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
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    case 'UPCOMING':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          Upcoming
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          Completed
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          Cancelled
        </span>
      );
    default:
      return null;
  }
};

const InitiativesPage = ({ defaultTab = 'drives' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [initiatives, setInitiatives] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Impact Metrics State
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  // Detail Modal State
  const [activeModalId, setActiveModalId] = useState(null);
  const [modalDetails, setModalDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const res = await fetchCampusImpactMetrics();
      setMetrics(res.data);
    } catch (err) {
      setMetricsError(
        err.response?.data?.message || 'Failed to load campus impact metrics.'
      );
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'impact') {
      loadMetrics();
    }
  }, [activeTab, loadMetrics]);

  const loadInitiatives = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const data = await fetchInitiatives({
          category: selectedCategory,
          status: selectedStatus,
        });
        setInitiatives(data.initiatives || []);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to load campus initiatives.'
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedCategory, selectedStatus]
  );

  useEffect(() => {
    loadInitiatives();
  }, [loadInitiatives]);

  // Handle open details modal
  const handleOpenDetails = async (id) => {
    setActiveModalId(id);
    setModalLoading(true);
    setModalError(null);
    try {
      const data = await fetchInitiativeById(id);
      setModalDetails(data.initiative);
    } catch (err) {
      setModalError(
        err.response?.data?.message || 'Unable to load initiative details.'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveModalId(null);
    setModalDetails(null);
    setModalError(null);
  };

  // Handle Join Initiative
  const handleJoin = async (id) => {
    setActionLoadingId(id);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await joinInitiative(id);
      setSuccessMessage(
        result.message || 'You have successfully joined the initiative!'
      );

      // Re-fetch initiatives from server to guarantee fresh state
      await loadInitiatives(true);

      // If modal is open for this item, update modal details too
      if (modalDetails && modalDetails._id === id) {
        setModalDetails((prev) => ({
          ...prev,
          hasJoined: true,
          participantCount: (prev.participantCount || 0) + 1,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to join this initiative.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Leave Initiative
  const handleLeave = async (id) => {
    setActionLoadingId(id);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await leaveInitiative(id);
      setSuccessMessage(
        result.message || 'You have left the initiative.'
      );

      // Re-fetch initiatives from server to guarantee fresh state
      await loadInitiatives(true);

      // If modal is open for this item, update modal details too
      if (modalDetails && modalDetails._id === id) {
        setModalDetails((prev) => ({
          ...prev,
          hasJoined: false,
          participantCount: Math.max(0, (prev.participantCount || 0) - 1),
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to leave this initiative.'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Leaf className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Campus Drives & Programs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Sustainability Initiatives
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Join environmental conservation events, clean-up operations, tree
            plantations, and renewable energy campaigns organized across campus.
          </p>
        </div>

        <button
          onClick={() =>
            activeTab === 'drives' ? loadInitiatives(false) : loadMetrics()
          }
          disabled={activeTab === 'drives' ? loading : metricsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              (activeTab === 'drives' ? loading : metricsLoading)
                ? 'animate-spin'
                : ''
            }`}
          />
          {activeTab === 'drives' ? 'Refresh Drives' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'drives'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Campus Drives</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {initiatives.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === 'impact'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Campus Impact Metrics</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Live
          </span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DRIVES VIEW */}
      {activeTab === 'drives' && (
        <>
          {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedStatus === st.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-16 w-full bg-slate-100 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                <div className="h-4 w-2/3 bg-slate-100 rounded" />
              </div>
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : initiatives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Initiatives Found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no campus initiatives matching your selected
            category and status filters.
          </p>
          {(selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initiatives.map((item) => {
            const isActionLoading = actionLoadingId === item._id;
            const isEnded = new Date(item.endDate).getTime() < Date.now();
            const joinDeadline = item.registrationDeadline
              ? new Date(item.registrationDeadline).getTime()
              : new Date(item.startDate).getTime();
            const isJoinClosed = Date.now() > joinDeadline || isEnded;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  item.hasJoined
                    ? 'border-emerald-300 ring-1 ring-emerald-300 shadow-sm'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Card Header & Body */}
                <div className="p-6">
                  {/* Category & Status Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${getCategoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.hasJoined && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Joined
                        </span>
                      )}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Meta Details */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(item.startDate)}
                      </span>
                    </div>

                    {item.registrationDeadline && (
                      <div className="flex items-center gap-2 text-amber-700 bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-200/60 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Last date to join: {formatDate(item.registrationDeadline)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+{item.points || 10} EcoPoints</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.participantCount || 0} Joined</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenDetails(item._id)}
                    className="text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1 transition"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    {item.hasJoined ? (
                      item.status === 'COMPLETED' ||
                      item.status === 'CANCELLED' ||
                      isEnded ? (
                        <span className="text-xs text-slate-400 font-medium">
                          Participation Closed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLeave(item._id)}
                          disabled={isActionLoading}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          {isActionLoading ? 'Leaving...' : 'Leave Drive'}
                        </button>
                      )
                    ) : isJoinClosed ? (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        {isEnded ? 'Drive Ended' : 'Joining Closed'}
                      </span>
                    ) : item.status === 'ACTIVE' || item.status === 'UPCOMING' ? (
                      <button
                        onClick={() => handleJoin(item._id)}
                        disabled={isActionLoading}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50 shadow-emerald-200"
                      >
                        {isActionLoading ? 'Joining...' : 'Join Drive'}
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.status === 'CANCELLED'
                          ? 'Cancelled'
                          : 'Drive Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Initiative Detail Modal */}
      {activeModalId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
            {modalLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-600 font-medium">
                  Loading initiative details...
                </p>
              </div>
            ) : modalError ? (
              <div className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm text-slate-800">{modalError}</p>
                <button
                  onClick={handleCloseModal}
                  className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            ) : modalDetails ? (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                          modalDetails.category
                        )}`}
                      >
                        {modalDetails.category}
                      </span>
                      {getStatusBadge(modalDetails.status)}
                      {modalDetails.hasJoined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          Joined
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {modalDetails.title}
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 text-sm text-slate-700 max-h-[60vh] overflow-y-auto">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      About this Initiative
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {modalDetails.description}
                    </p>
                  </div>

                  {/* Schedule & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Location
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{modalDetails.location}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Reward
                      </span>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold mt-0.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+{modalDetails.points || 10} EcoPoints</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Event Schedule
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {formatDate(modalDetails.startDate)} &mdash;{' '}
                          {formatDate(modalDetails.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Details */}
                  {modalDetails.organizer && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Organized By
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-900">
                            {modalDetails.organizer.fullName || 'Campus Coordinator'}
                          </span>
                        </div>
                        {modalDetails.organizer.department && (
                          <span className="text-slate-500 text-[11px]">
                            {modalDetails.organizer.department}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Participants counter */}
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>
                        Total Participants Registered:{' '}
                        <strong className="text-slate-900 font-semibold">
                          {modalDetails.participantCount || 0}
                        </strong>
                      </span>
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                  >
                    Close
                  </button>

                  <div>
                    {modalDetails.hasJoined ? (
                      modalDetails.status === 'COMPLETED' ||
                      modalDetails.status === 'CANCELLED' ||
                      new Date(modalDetails.endDate).getTime() < Date.now() ? (
                        <span className="text-xs text-slate-400 font-medium">
                          Participation Closed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLeave(modalDetails._id)}
                          disabled={actionLoadingId === modalDetails._id}
                          className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition disabled:opacity-50"
                        >
                          {actionLoadingId === modalDetails._id
                            ? 'Leaving...'
                            : 'Leave Initiative'}
                        </button>
                      )
                    ) : modalDetails.status === 'ACTIVE' &&
                      new Date(modalDetails.endDate).getTime() >= Date.now() ? (
                      <button
                        onClick={() => handleJoin(modalDetails._id)}
                        disabled={actionLoadingId === modalDetails._id}
                        className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-50"
                      >
                        {actionLoadingId === modalDetails._id
                          ? 'Joining...'
                          : 'Join Initiative'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium px-2">
                        {modalDetails.status === 'UPCOMING'
                          ? 'Registration Opens Soon'
                          : 'Initiative Closed'}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
      </>
      )}

      {/* IMPACT METRICS VIEW */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {/* Loading skeleton */}
          {metricsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-8 w-16 bg-slate-100 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {metricsError && !metricsLoading && (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm font-medium text-rose-800">{metricsError}</p>
              <button
                onClick={loadMetrics}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metrics grid */}
          {metrics && !metricsLoading && (
            <>
              {/* Section label */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Live Aggregated Data · Campus-Wide
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Initiatives totals */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <Layers className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Campus Initiatives
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {metrics.initiatives?.total ?? 0}
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Active: {metrics.initiatives?.byStatus?.ACTIVE ?? 0}
                    </span>
                    <span className="text-sky-700 font-semibold">
                      Upcoming: {metrics.initiatives?.byStatus?.UPCOMING ?? 0}
                    </span>
                    <span className="text-slate-500">
                      Completed: {metrics.initiatives?.byStatus?.COMPLETED ?? 0}
                    </span>
                    <span className="text-rose-500">
                      Cancelled: {metrics.initiatives?.byStatus?.CANCELLED ?? 0}
                    </span>
                  </div>
                </div>

                {/* Participation */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-sky-50 rounded-lg text-sky-600">
                      <Users className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Participation
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {metrics.participation?.totalParticipations ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total sign-ups across all initiatives
                  </p>
                  <p className="text-xs font-semibold text-sky-700">
                    {metrics.participation?.uniqueParticipants ?? 0} unique students involved
                  </p>
                </div>

                {/* Verified Activities */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Sustainability Activities
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {metrics.activities?.totalVerified ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">
                    Verified out of {metrics.activities?.totalRecorded ?? 0} recorded
                  </p>
                  <p className="text-xs font-semibold text-violet-700">
                    {metrics.activities?.pointsFromVerifiedActivities ?? 0} pts from verified actions
                  </p>
                </div>

                {/* EcoPoints pool */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                      <Award className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Campus EcoPoints Pool
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {(metrics.ecoPoints?.totalCampusPool ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    Combined across {metrics.ecoPoints?.totalRegisteredStudents ?? 0} registered students
                  </p>
                </div>

                {/* CO2 avoided */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-teal-50 rounded-lg text-teal-600">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      CO₂ Avoided
                    </span>
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900">
                    {(metrics.environmentalImpact?.co2AvoidedFromChallengesKg ?? 0).toLocaleString()}{' '}
                    <span className="text-lg font-bold text-slate-500">kg</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    From {metrics.environmentalImpact?.totalCompletedChallenges ?? 0} completed daily challenges
                  </p>
                </div>

                {/* Avg carbon footprint */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Avg Weekly Footprint
                    </span>
                  </div>
                  {metrics.environmentalImpact?.avgWeeklyFootprintKgCO2e != null ? (
                    <>
                      <p className="text-4xl font-extrabold text-slate-900">
                        {metrics.environmentalImpact.avgWeeklyFootprintKgCO2e.toLocaleString()}{' '}
                        <span className="text-lg font-bold text-slate-500">kg CO₂e</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Averaged from {metrics.environmentalImpact?.studentsWithFootprint ?? 0} students'
                        latest carbon calculation
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      No carbon calculations recorded yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy + methodology note */}
              <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-500">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-600">Data Privacy &amp; Methodology</p>
                  <p>All figures are campus-wide aggregates. No personal data is returned.</p>
                  <p>{metrics.environmentalImpact?.methodologyNote}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InitiativesPage;
