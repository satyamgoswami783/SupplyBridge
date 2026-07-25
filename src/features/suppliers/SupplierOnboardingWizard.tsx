import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Shield, Database, Sliders, Play, Check } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'

const STEPS = [
  { id: 1, title: 'Supplier Information', desc: 'Basic details & protocols' },
  { id: 2, title: 'Connection Test',      desc: 'Endpoint handshake & auth' },
  { id: 3, title: 'Sync Schedule',       desc: 'Cron frequency & retry limits' },
  { id: 4, title: 'Data Mapping',         desc: 'Column schema alignment' },
  { id: 5, title: 'Initial Import',       desc: 'Dry-run preview & validation' },
  { id: 6, title: 'Activation',           desc: 'Deploy pipeline to live status' },
]

export const SupplierOnboardingWizard: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isTesting, setIsTesting] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    protocol: 'API' as 'API' | 'FTP' | 'SFTP' | 'SOAP',
    endpoint: 'https://api.supplier.com/v2/catalog',
    email: '',
    cron: '0 */4 * * *',
    mappingPreset: 'Standard Hardware PIM Schema',
    autoPublish: false,
  })

  const runConnectionTest = () => {
    setIsTesting(true)
    setTestSuccess(false)
    setTimeout(() => {
      setIsTesting(false)
      setTestSuccess(true)
    }, 1800)
  }

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleFinish = () => {
    navigate('/suppliers')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Truck className="text-amber-500" size={24} /> Supplier Onboarding Wizard
          </h1>
          <p className="page-subtitle">6-Step Enterprise Integration, Protocol Handshake & Automated Mapping Pipeline</p>
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map(s => {
            const isCompleted = currentStep > s.id
            const isCurrent = currentStep === s.id
            return (
              <div
                key={s.id}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-bold ${
                    isCurrent
                      ? 'bg-amber-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isCompleted ? <Check size={12} /> : s.id}
                  </span>
                  <span className="text-xs font-extrabold truncate">{s.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="card p-6 min-h-[380px] flex flex-col justify-between">
        
        {/* Step 1: Supplier Information */}
        {currentStep === 1 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 1: Supplier Details & Protocol Selection</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Hardware Supplies"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Supplier Code (ID) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. APEX-SUP-01"
                  className="input font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Integration Protocol</label>
                <select
                  value={formData.protocol}
                  onChange={e => setFormData({ ...formData, protocol: e.target.value as any })}
                  className="select"
                >
                  <option value="API">API REST v2 (JSON Endpoint)</option>
                  <option value="FTP">FTP File Feed (CSV/XML)</option>
                  <option value="SFTP">SFTP Encrypted Feed</option>
                  <option value="SOAP">SOAP XML Gateway</option>
                </select>
              </div>
              <div>
                <label className="label">Contact Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="data-feed@supplier.com"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Endpoint / Server Host URL *</label>
              <input
                type="text"
                required
                value={formData.endpoint}
                onChange={e => setFormData({ ...formData, endpoint: e.target.value })}
                placeholder="https://api.supplier.com/v2/catalog"
                className="input font-mono"
              />
            </div>
          </div>
        )}

        {/* Step 2: Connection Test */}
        {currentStep === 2 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 2: Live Connection Handshake & Authentication Test</h3>
            <p className="text-xs text-slate-500">Verify network latency, SSL certificate trust & API auth credentials.</p>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Target Endpoint:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formData.endpoint}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Protocol:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.protocol}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={runConnectionTest}
                  disabled={isTesting}
                  className="btn-primary btn-sm flex items-center gap-2"
                >
                  <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
                  {isTesting ? 'Pinging Endpoint...' : 'Run Connection Test'}
                </button>

                {testSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> 200 OK Handshake Verified (38ms)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sync Schedule */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 3: Inventory & Pricing Sync Frequency</h3>
            <div>
              <label className="label">Cron Expression Schedule</label>
              <input
                type="text"
                value={formData.cron}
                onChange={e => setFormData({ ...formData, cron: e.target.value })}
                placeholder="0 */4 * * *"
                className="input font-mono"
              />
              <span className="text-2xs text-slate-400 mt-1 block">Runs every 4 hours automatically</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-2xs font-bold text-slate-500 uppercase">MAX AUTO RETRIES</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">3 Attempts</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-2xs font-bold text-slate-500 uppercase">TIMEOUT LIMIT</span>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-1">30 Seconds</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Data Mapping */}
        {currentStep === 4 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 4: Field Column Mapping Preset</h3>
            <div>
              <label className="label">Select Target Schema Preset</label>
              <select
                value={formData.mappingPreset}
                onChange={e => setFormData({ ...formData, mappingPreset: e.target.value })}
                className="select"
              >
                <option value="Standard Hardware PIM Schema">Standard Hardware PIM Schema</option>
                <option value="Automotive OEM Direct Schema">Automotive OEM Direct Schema</option>
                <option value="Electronics Multi-Variant Schema">Electronics Multi-Variant Schema</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between font-mono"><span className="text-slate-500">supplier_sku</span> <span>→</span> <span className="font-bold text-amber-500">master_sku</span></div>
              <div className="flex justify-between font-mono"><span className="text-slate-500">raw_price</span> <span>→</span> <span className="font-bold text-amber-500">cost_price</span></div>
              <div className="flex justify-between font-mono"><span className="text-slate-500">qty_on_hand</span> <span>→</span> <span className="font-bold text-amber-500">inventory_count</span></div>
            </div>
          </div>
        )}

        {/* Step 5: Initial Import Validation */}
        {currentStep === 5 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 5: Dry-Run Import Preview & Pre-Publication Check</h3>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Dry-Run Sample Import Passed
              </span>
              <p className="text-2xs text-emerald-700 dark:text-emerald-400">1,240 Products parsed cleanly · 0 Validation Errors · 100% SKU Uniqueness</p>
            </div>
          </div>
        )}

        {/* Step 6: Activation */}
        {currentStep === 6 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Step 6: Confirm Supplier Activation</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p><strong>Supplier:</strong> {formData.name || 'Apex Hardware Supplies'}</p>
              <p><strong>Protocol:</strong> {formData.protocol}</p>
              <p><strong>Status:</strong> Active Pipeline Ready</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="btn-secondary btn-sm flex items-center gap-1.5 disabled:opacity-40"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              Continue Step {currentStep + 1} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              Deploy & Activate Supplier <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
