import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  submitCarbonCalculation,
  fetchCurrentFootprint,
  fetchFootprintHistory,
} from '../api/carbonApi';
import {
  Calculator,
  Car,
  Zap,
  Droplets,
  Utensils,
  Trash2,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Calendar,
  History,
  Sparkles,
  Info,
  HelpCircle,
  Lightbulb,
  SunMedium
} from 'lucide-react';

const TRANSPORT_MODES = [
  { id: 'walk_bicycle', label: 'Walk / Bicycle', desc: 'Zero emissions active commute', icon: '🚲' },
  { id: 'bus_public', label: 'Campus / Public Bus', desc: 'Shared public bus transit', icon: '🚌' },
  { id: 'train_metro', label: 'Train / Metro', desc: 'Electric rail transit', icon: '🚆' },
  { id: 'two_wheeler', label: 'Two-Wheeler / Scooter', desc: 'Gasoline motorcycle or scooter', icon: '🛵' },
  { id: 'carpool', label: 'Carpool (2+ Riders)', desc: 'Shared personal automobile', icon: '🚗' },
  { id: 'car_solo', label: 'Solo Automobile', desc: 'Single occupant driving', icon: '🚘' },
];

const DIETARY_PATTERNS = [
  { id: 'vegan', label: '100% Plant-Based (Vegan)', desc: 'Lowest footprint diet', icon: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Includes dairy & eggs, no meat', icon: '🥗' },
  { id: 'pescatarian', label: 'Pescatarian', desc: 'Fish & plant-based foods', icon: '🐟' },
  { id: 'omnivore_moderate', label: 'Moderate Omnivore', desc: 'Meat 2–4 meals a week', icon: '🍗' },
  { id: 'meat_heavy', label: 'Meat-Heavy', desc: 'Daily red meat and poultry', icon: '🥩' },
];

const RECYCLING_HABITS = [
  { id: 'always', label: 'Always / Consistently', desc: 'Sort plastics, cans, and paper', discount: '55% reduction' },
  { id: 'sometimes', label: 'Frequently / Sometimes', desc: 'Use campus recycling bins', discount: '35% reduction' },
  { id: 'rarely', label: 'Rarely', desc: 'Only recycle large items', discount: '15% reduction' },
  { id: 'never', label: 'Never / Landfill Only', desc: 'All waste goes in one bin', discount: '0% reduction' },
];

const CarbonCalculatorPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('calculator'); // 'calculator' | 'results' | 'history'
  const [currentStep, setCurrentStep] = useState(1); // 1: Transport, 2: Energy, 3: Water, 4: Food, 5: Waste
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form Inputs with sensible defaults
  const [inputs, setInputs] = useState({
    transport: {
      mode: 'bus_public',
      distanceKmPerDay: 8,
      daysPerWeek: 5,
    },
    electricity: {
      billingPeriod: 'weekly_kwh',
      consumptionValue: 15,
      hasRenewableSolar: false,
    },
    water: {
      dailyLiters: 110,
    },
    food: {
      dietaryPattern: 'vegetarian',
    },
    waste: {
      weeklyWasteKg: 4,
      recyclingHabit: 'sometimes',
    },
  });

  // Calculation Results
  const [resultData, setResultData] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Load existing calculation or history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetchFootprintHistory();
      if (res && res.history) {
        setHistoryList(res.history);
        if (res.history.length > 0 && !resultData) {
          // If student already has a previous calculation, fetch current to show if desired
          const curr = await fetchCurrentFootprint();
          if (curr && curr.data) {
            setResultData(curr.data);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await submitCarbonCalculation(inputs);
      if (response && response.data) {
        setResultData(response.data);
        setActiveView('results');
        // Refresh history
        loadHistory();
      }
    } catch (err) {
      console.error('Calculation submission failed:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to compute carbon footprint'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus GHG Modeling Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personal Carbon Footprint Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quantify your weekly campus emissions across Transportation, Energy, Water, Diet, and Waste.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveView('calculator')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeView === 'calculator'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Calculator
          </button>
          {resultData && (
            <button
              onClick={() => setActiveView('results')}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeView === 'results'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Latest Result
            </button>
          )}
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeView === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* -------------------- VIEW 1: STEP CALCULATOR WIZARD -------------------- */}
      {activeView === 'calculator' && (
        <div className="space-y-6">
          {/* Step Progress Bar */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
            {[
              { num: 1, label: 'Transit', icon: Car },
              { num: 2, label: 'Energy', icon: Zap },
              { num: 3, label: 'Water', icon: Droplets },
              { num: 4, label: 'Diet', icon: Utensils },
              { num: 5, label: 'Waste', icon: Trash2 },
            ].map((step) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-xs font-semibold transition flex flex-col items-center space-y-1 ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : isDone
                      ? 'border-emerald-200 bg-white text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {/* STEP 1: TRANSPORTATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Car className="w-5 h-5 text-sky-600" />
                    <span>1. Daily Campus Transportation</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your primary commute mode and estimated travel distance to campus.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-3">
                    Primary Travel Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {TRANSPORT_MODES.map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            transport: { ...prev.transport, mode: mode.id },
                          }))
                        }
                        className={`p-4 rounded-2xl border cursor-pointer transition flex items-start space-x-3 ${
                          inputs.transport.mode === mode.id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <span className="text-2xl">{mode.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{mode.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{mode.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Daily One-Way / Round-Trip Distance</span>
                      <span className="text-emerald-700 font-bold">{inputs.transport.distanceKmPerDay} km / day</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={inputs.transport.distanceKmPerDay}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          transport: {
                            ...prev.transport,
                            distanceKmPerDay: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 km (Dorm resident)</span>
                      <span>30 km</span>
                      <span>60+ km (Suburban)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Commute Days Per Week</span>
                      <span className="text-emerald-700 font-bold">{inputs.transport.daysPerWeek} days / wk</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      step="1"
                      value={inputs.transport.daysPerWeek}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          transport: {
                            ...prev.transport,
                            daysPerWeek: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>0 days</span>
                      <span>5 days (Standard)</span>
                      <span>7 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ELECTRICITY / ENERGY */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>2. Electricity & Dorm Power Consumption</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How you consume electrical energy in your college dormitory or apartment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'weekly_kwh', label: 'Weekly kWh', desc: 'Direct power meter metric' },
                    { id: 'monthly_kwh', label: 'Monthly kWh', desc: 'From electricity utility bill' },
                    { id: 'daily_hours_ac', label: 'Daily AC Hours', desc: 'Hours of dorm cooling/day' },
                  ].map((unit) => (
                    <div
                      key={unit.id}
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          electricity: { ...prev.electricity, billingPeriod: unit.id },
                        }))
                      }
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        inputs.electricity.billingPeriod === unit.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{unit.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{unit.desc}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Estimated Value</span>
                    <span className="text-emerald-700 font-bold">
                      {inputs.electricity.consumptionValue}{' '}
                      {inputs.electricity.billingPeriod === 'daily_hours_ac'
                        ? 'hours AC / day'
                        : 'kWh'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={inputs.electricity.billingPeriod === 'daily_hours_ac' ? 18 : 120}
                    step="1"
                    value={inputs.electricity.consumptionValue}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        electricity: {
                          ...prev.electricity,
                          consumptionValue: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-emerald-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Average student dorm room power consumption: ~12–25 kWh/week.
                  </p>
                </div>

                {/* Renewable Solar Toggle */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SunMedium className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Campus Solar / Renewable Grid</div>
                      <div className="text-[11px] text-slate-600">
                        Does your campus dormitory utilize rooftop solar panels or green tariffs?
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inputs.electricity.hasRenewableSolar}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        electricity: {
                          ...prev.electricity,
                          hasRenewableSolar: e.target.checked,
                        },
                      }))
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: WATER USAGE */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span>3. Daily Personal Water Consumption</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Treated campus municipal water carries pumping, treatment, and heating GHG emissions.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-700">Estimated Daily Water Use</span>
                    <span className="text-emerald-700 font-bold">{inputs.water.dailyLiters} Liters / day</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="350"
                    step="5"
                    value={inputs.water.dailyLiters}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        water: { dailyLiters: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-emerald-600"
                  />

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div
                      onClick={() => setInputs((prev) => ({ ...prev, water: { dailyLiters: 60 } }))}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                        inputs.water.dailyLiters <= 70
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-bold">~60 L</span>
                      <span className="text-[10px] text-slate-500">Conservation Mode</span>
                    </div>
                    <div
                      onClick={() => setInputs((prev) => ({ ...prev, water: { dailyLiters: 110 } }))}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                        inputs.water.dailyLiters > 70 && inputs.water.dailyLiters <= 160
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-bold">~110 L</span>
                      <span className="text-[10px] text-slate-500">Student Average</span>
                    </div>
                    <div
                      onClick={() => setInputs((prev) => ({ ...prev, water: { dailyLiters: 220 } }))}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer ${
                        inputs.water.dailyLiters > 160
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-bold">~220 L</span>
                      <span className="text-[10px] text-slate-500">High Usage</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FOOD / DIET */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Utensils className="w-5 h-5 text-amber-600" />
                    <span>4. Dietary Lifestyle & Food Carbon Impact</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Agricultural supply chains, meat processing, and food transport are major footprint drivers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIETARY_PATTERNS.map((diet) => (
                    <div
                      key={diet.id}
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          food: { dietaryPattern: diet.id },
                        }))
                      }
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start space-x-3.5 ${
                        inputs.food.dietaryPattern === diet.id
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-2xl">{diet.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{diet.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{diet.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: WASTE GENERATION */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Trash2 className="w-5 h-5 text-emerald-600" />
                    <span>5. Solid Waste Generation & Recycling Habits</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Landfill decay produces potent methane; segregation and recycling mitigate this impact.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Approximate Weekly Waste Generated</span>
                    <span className="text-emerald-700 font-bold">{inputs.waste.weeklyWasteKg} kg / week</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={inputs.waste.weeklyWasteKg}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        waste: {
                          ...prev.waste,
                          weeklyWasteKg: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 kg (Minimal)</span>
                    <span>4 kg (Average dorm student)</span>
                    <span>15+ kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-3">
                    Campus Recycling Habit
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {RECYCLING_HABITS.map((habit) => (
                      <div
                        key={habit.id}
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            waste: { ...prev.waste, recyclingHabit: habit.id },
                          }))
                        }
                        className={`p-4 rounded-2xl border cursor-pointer transition ${
                          inputs.waste.recyclingHabit === habit.id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{habit.label}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            {habit.discount}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">{habit.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-200 transition"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCalculate}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Emissions...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      <span>Calculate Estimated Footprint</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 2: CALCULATION RESULTS -------------------- */}
      {activeView === 'results' && resultData && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            {/* Top Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                  Estimated Carbon Footprint
                </span>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">
                    {resultData.totalWeeklyKgCO2e}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">kg CO2e / week</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Annualized impact: ~<strong>{resultData.annualEstimateKgCO2e} kg CO2e / year</strong>
                </p>
              </div>

              {/* Comparison with Previous Calculation (Requirement 6) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Historical Comparison
                </span>
                {resultData.comparison ? (
                  <div className="mt-1">
                    <div
                      className={`text-lg font-black flex items-center justify-end space-x-1 ${
                        resultData.comparison.percentageChange <= 0
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {resultData.comparison.percentageChange <= 0 ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      <span>
                        {resultData.comparison.percentageChange > 0 ? '+' : ''}
                        {resultData.comparison.percentageChange}%
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Previous: {resultData.comparison.previousFootprint} kg CO2e
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    First Baseline Record
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown Chart (Requirement 6) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Emissions by Category</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 capitalize">
                  Highest Impact: {resultData.highestImpactCategory}
                </span>
              </div>

              {/* Stacked Percentage Bar */}
              <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${resultData.percentages?.transport || 0}%` }}
                  className="bg-sky-500 h-full transition-all"
                  title={`Transport: ${resultData.percentages?.transport}%`}
                ></div>
                <div
                  style={{ width: `${resultData.percentages?.electricity || 0}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Electricity: ${resultData.percentages?.electricity}%`}
                ></div>
                <div
                  style={{ width: `${resultData.percentages?.water || 0}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Water: ${resultData.percentages?.water}%`}
                ></div>
                <div
                  style={{ width: `${resultData.percentages?.food || 0}%` }}
                  className="bg-emerald-600 h-full transition-all"
                  title={`Food: ${resultData.percentages?.food}%`}
                ></div>
                <div
                  style={{ width: `${resultData.percentages?.waste || 0}%` }}
                  className="bg-teal-700 h-full transition-all"
                  title={`Waste: ${resultData.percentages?.waste}%`}
                ></div>
              </div>

              {/* Category Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200">
                  <div className="flex items-center space-x-1.5 text-sky-700 text-xs font-bold">
                    <Car className="w-3.5 h-3.5" />
                    <span>Transport</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {resultData.breakdown?.transport} <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-sky-700 font-bold">{resultData.percentages?.transport}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Electricity</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {resultData.breakdown?.electricity} <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-bold">{resultData.percentages?.electricity}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center space-x-1.5 text-blue-700 text-xs font-bold">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Water</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {resultData.breakdown?.water} <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-bold">{resultData.percentages?.water}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center space-x-1.5 text-emerald-700 text-xs font-bold">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Food</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {resultData.breakdown?.food} <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold">{resultData.percentages?.food}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200">
                  <div className="flex items-center space-x-1.5 text-teal-700 text-xs font-bold">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Waste</span>
                  </div>
                  <div className="mt-2 text-base font-black text-slate-900">
                    {resultData.breakdown?.waste} <span className="text-[10px] font-normal text-slate-500">kg</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-bold">{resultData.percentages?.waste}%</div>
                </div>
              </div>
            </div>

            {/* Reduction Suggestions (Requirement 6) */}
            {resultData.suggestions && resultData.suggestions.length > 0 && (
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>Personalized Campus Reduction Opportunities</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {resultData.suggestions.map((sug, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs text-xs">
                      <div className="font-bold text-slate-900">{sug.title}</div>
                      <p className="text-[11px] text-slate-600 mt-1">{sug.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Methodology & Disclaimer Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Methodology:</strong> {resultData.methodologyVersion || 'v1.0-DEFRA-EPA-2026'}.{' '}
                {resultData.disclaimer ||
                  'Estimated Carbon Footprint is modeled from student inputs and standard GHG factors.'}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveView('calculator');
                  setCurrentStep(1);
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Recalculate Inputs
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition"
              >
                <span>View on Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 3: CALCULATION HISTORY -------------------- */}
      {activeView === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Calculation History</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect your previous footprint assessments and emissions trajectory over time.
              </p>
            </div>
            <button
              onClick={() => setActiveView('calculator')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
            >
              + New Assessment
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
          ) : historyList && historyList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Footprint (kg CO2e)</th>
                    <th className="py-3 px-3">Highest Impact</th>
                    <th className="py-3 px-3">Change</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-medium text-slate-800">
                        {new Date(item.calculatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        {item.totalWeeklyKgCO2e} kg
                      </td>
                      <td className="py-3.5 px-3 capitalize text-slate-600">
                        {item.highestImpactCategory}
                      </td>
                      <td className="py-3.5 px-3">
                        {item.percentChange !== null ? (
                          <span
                            className={`font-bold flex items-center space-x-1 ${
                              item.percentChange <= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.percentChange <= 0 ? (
                              <TrendingDown className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            <span>{item.percentChange > 0 ? '+' : ''}{item.percentChange}%</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Baseline</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold transition"
                        >
                          View Breakdown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No historical calculations found. Complete your first assessment above!
            </div>
          )}

          {/* Detailed Modal/Drawer for Selected Historical Item */}
          {selectedHistoryItem && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900">
                    Historical Assessment:{' '}
                    {new Date(selectedHistoryItem.calculatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-center py-2">
                  <div className="text-3xl font-black text-slate-900">
                    {selectedHistoryItem.totalWeeklyKgCO2e} <span className="text-xs font-normal text-slate-500">kg CO2e / wk</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Annual: ~{selectedHistoryItem.annualEstimateKgCO2e} kg CO2e / year
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-sky-50 rounded-xl">
                    <span className="text-slate-500 block">Transport</span>
                    <strong>{selectedHistoryItem.breakdown?.transport} kg</strong>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl">
                    <span className="text-slate-500 block">Electricity</span>
                    <strong>{selectedHistoryItem.breakdown?.electricity} kg</strong>
                  </div>
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <span className="text-slate-500 block">Water</span>
                    <strong>{selectedHistoryItem.breakdown?.water} kg</strong>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <span className="text-slate-500 block">Food</span>
                    <strong>{selectedHistoryItem.breakdown?.food} kg</strong>
                  </div>
                  <div className="p-2.5 bg-teal-50 rounded-xl col-span-2">
                    <span className="text-slate-500 block">Waste</span>
                    <strong>{selectedHistoryItem.breakdown?.waste} kg</strong>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarbonCalculatorPage;
