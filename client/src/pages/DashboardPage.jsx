import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard, fetchPointsHistory } from '../api/dashboardApi';
import {
  Award,
  Leaf,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Calculator,
  QrCode,
  Box,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Flame,
  HelpCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' | 'points'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashRes, ptsRes] = await Promise.all([
        fetchDashboard(),
        fetchPointsHistory(),
      ]);
      setDashboardData(dashRes);
      setPointsHistory(ptsRes.history || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to load dashboard data'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
          <div className="h-32 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl"></div>
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Dashboard Unavailable</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => loadData(false)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const { student, ecoPoints, greenScore, activityStats, carbonSummary, recentActivities, badges } = dashboardData;

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'recycling':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'transport':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'energy':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'water':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'conservation':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Student Sustainability Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.fullName || user?.fullName}! 🌱
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              <span className="font-mono text-emerald-200">{student?.collegeId}</span> • {student?.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition border border-white/20"
              title="Refresh dashboard metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <Link
              to="/carbon-footprint"
              className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-50 transition shadow-sm"
            >
              Calculate Footprint
            </Link>
          </div>
        </div>

        {/* Decorative corner background leaf */}
        <Leaf className="absolute -right-6 -bottom-8 w-44 h-44 text-white/5 pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Eco-Points Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Eco-Points</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-slate-900">{ecoPoints?.current || 0}</span>
              <span className="text-xs text-slate-500 font-medium">pts total</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400 block">This Week</span>
              <span className="font-bold text-emerald-600">+{ecoPoints?.thisWeek || 0} pts</span>
            </div>
            <div>
              <span className="text-slate-400 block">This Month</span>
              <span className="font-bold text-emerald-700">+{ecoPoints?.thisMonth || 0} pts</span>
            </div>
          </div>
        </div>

        {/* 2. Green Score Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold uppercase tracking-wider">Green Score</span>
                <button
                  onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                  className="text-slate-400 hover:text-emerald-600 transition"
                  title="View formula details"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">{greenScore?.score || 0}</span>
              <span className="text-xs text-slate-400 font-medium">/ 100</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {greenScore?.tier?.split(' ')[0] || 'Active'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, greenScore?.score || 0)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            Tier: <strong className="text-slate-800">{greenScore?.tier}</strong>
          </div>
        </div>

        {/* 3. Verified Activities Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Verified Activities</span>
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-slate-900">
                {activityStats?.verifiedActivities || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">verified</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Total Logged: <strong>{activityStats?.totalActivities || 0}</strong></span>
            {activityStats?.unverifiedActivities > 0 && (
              <span className="text-amber-600 font-medium">
                {activityStats.unverifiedActivities} pending
              </span>
            )}
          </div>
        </div>

        {/* 4. Carbon Footprint Overview Status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Carbon Footprint</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {carbonSummary ? (
                <div>
                  <div className="text-3xl font-black text-slate-900">
                    {carbonSummary.currentFootprint}{' '}
                    <span className="text-xs font-normal text-slate-500">kg CO2e/wk</span>
                  </div>
                  {carbonSummary.percentageChange !== null && (
                    <p className={`text-xs mt-1 font-semibold flex items-center space-x-1 ${
                      carbonSummary.percentageChange <= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {carbonSummary.percentageChange <= 0 ? (
                        <TrendingDown className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {Math.abs(carbonSummary.percentageChange)}% vs last calculation
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-slate-700">Not Calculated</div>
                  <p className="text-xs text-slate-400 mt-1">Pending student baseline</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/carbon-footprint"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>{carbonSummary ? 'Recalculate' : 'Take assessment'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Formula Info Modal / Banner (Toggleable) */}
      {showFormulaInfo && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Transparent Green Score Formula (0 - 100)</span>
            </span>
            <button
              onClick={() => setShowFormulaInfo(false)}
              className="text-teal-600 hover:text-teal-900 text-xs"
            >
              Dismiss
            </button>
          </div>
          <p className="text-teal-800">
            Calculated deterministically without black-box AI based on your verified sustainability deeds:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-teal-800 font-mono text-[11px]">
            <li>Verified Activities: 15 pts per verified deed (max 60) → Currently: {greenScore?.breakdown?.verifiedActivitiesContribution} pts</li>
            <li>Accumulated Eco-Points: 1 pt per 10 eco-points (max 30) → Currently: {greenScore?.breakdown?.pointsContribution} pts</li>
            <li>Category Diversity: 2.5 pts per unique activity category (max 10) → Currently: {greenScore?.breakdown?.diversityBonus} pts</li>
          </ul>
        </div>
      )}

      {/* Carbon Footprint Summary Component (Requirement 4) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Carbon Footprint Summary</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly personal campus greenhouse gas emissions tracking.
            </p>
          </div>
          <Link
            to="/carbon-footprint"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition self-start sm:self-auto"
          >
            <span>Calculate My Footprint</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {carbonSummary ? (
          /* Populated State */
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Current Footprint</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {carbonSummary.currentFootprint} <span className="text-xs font-normal text-slate-500">kg CO2e/wk</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Previous Footprint</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {carbonSummary.previousFootprint !== null ? (
                    `${carbonSummary.previousFootprint} kg CO2e`
                  ) : (
                    <span className="text-sm font-normal text-slate-400">Baseline Calculation</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase">Reduction Change</span>
                <div className="text-2xl font-black mt-1">
                  {carbonSummary.percentageChange !== null ? (
                    <span className={carbonSummary.percentageChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {carbonSummary.percentageChange > 0 ? '+' : ''}
                      {carbonSummary.percentageChange}%
                    </span>
                  ) : (
                    <span className="text-emerald-600 text-sm font-semibold">Active Baseline</span>
                  )}
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {carbonSummary.breakdown && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Category Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                    <span className="text-slate-500 block">Transit</span>
                    <strong className="text-slate-900 text-sm">{carbonSummary.breakdown.transport || 0} kg</strong>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-slate-500 block">Diet</span>
                    <strong className="text-slate-900 text-sm">{carbonSummary.breakdown.diet || 0} kg</strong>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <span className="text-slate-500 block">Dorm Energy</span>
                    <strong className="text-slate-900 text-sm">{carbonSummary.breakdown.energy || 0} kg</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 block">Waste</span>
                    <strong className="text-slate-900 text-sm">{carbonSummary.breakdown.waste || 0} kg</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Friendly Empty State as specified in Requirement 4 */
          <div className="py-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                No carbon footprint calculated yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Answer a quick 2-minute assessment to discover your weekly emissions score and reduction roadmap.
              </p>
            </div>
            <div>
              <Link
                to="/carbon-footprint"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-200 transition"
              >
                <span>Calculate My Footprint</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Activity History & Points Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Activities / Ledger Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activity & Points Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic green deeds and rewards logged to your student identity.
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'activities'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recent Deeds ({recentActivities?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('points')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'points'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Points Ledger
              </button>
            </div>
          </div>

          {activeTab === 'activities' ? (
            /* Recent Activities List */
            <div className="space-y-3">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act._id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-200 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="mt-1">
                        {act.verified ? (
                          <div
                            className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"
                            title="Verified Green Deed"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0"
                            title="Unverified (Self-Reported)"
                          >
                            <Clock className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActivityTypeColor(
                              act.activityType
                            )}`}
                          >
                            {act.activityType}
                          </span>

                          {/* Verification pill */}
                          {act.verified ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{act.verificationMethod} Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Self-Reported (Unverified)</span>
                            </span>
                          )}
                        </div>

                        {act.description && (
                          <p className="text-xs text-slate-500 mt-1">{act.description}</p>
                        )}

                        <div className="text-[11px] text-slate-400 mt-2 flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right flex-shrink-0">
                      <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                        +{act.points} pts
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No activities recorded yet. Complete challenges or scan campus QR stations.
                </div>
              )}
            </div>
          ) : (
            /* Points History Ledger */
            <div className="space-y-3">
              {pointsHistory && pointsHistory.length > 0 ? (
                pointsHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.source} • {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-black text-emerald-600 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      +{item.points} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No points ledger events found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Badges & Quick Action Shortcuts */}
        <div className="space-y-6">
          {/* Badges Earned */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Current Badges</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {badges?.length || 0} earned
              </span>
            </div>

            <div className="space-y-2.5">
              {badges && badges.length > 0 ? (
                badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center space-x-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{badge.title}</div>
                      <div className="text-[10px] text-emerald-700">Pioneer Membership</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No badges earned yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Campus Green Deeds</h3>

            <Link
              to="/carbon-footprint"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Carbon Footprint</div>
                  <div className="text-[10px] text-slate-500">Calculate & log weekly metrics</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </Link>

            <Link
              to="/challenges"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">AI Daily Challenges</div>
                  <div className="text-[10px] text-slate-500">Earn points for green habits</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
            </Link>

            <Link
              to="/qr-scan"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Campus Eco-Stations</div>
                  <div className="text-[10px] text-slate-500">Scan QR codes for verification</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition" />
            </Link>

            <Link
              to="/campus-3d"
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Campus Aerial Map</div>
                  <div className="text-[10px] text-slate-500">Real photo &amp; smart bins</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
