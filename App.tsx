
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyzeBid } from './services/geminiService';
import type { Project, Bidder, BACMember, GroundingChunk } from './types';
import { PlusIcon, TrashIcon, DocumentArrowUpIcon, ChevronRightIcon } from './components/Icons';

// MOCK DATA
const MOCK_DPWH_PROJECTS: Project[] = [
  { id: 'proj-001', name: 'Rehabilitation of National Road', description: 'Asphalt overlay and reblocking of the Maharlika Highway, Sta. Rosa - Calamba Section.', budget: 150000000, location: 'Laguna' },
  { id: 'proj-002', name: 'Construction of a 4-Storey School Building', description: 'Construction of a 20-classroom building for Batangas National High School.', budget: 85000000, location: 'Batangas' },
  { id: 'proj-003', name: 'Flood Control Project for Pasig River', description: 'Dredging and construction of retaining walls along the Pasig Riverbanks in Manila.', budget: 320000000, location: 'Manila' },
  { id: 'proj-004', name: 'Farm-to-Market Road Construction', description: 'Construction of a 10km concrete road in Sariaya, Quezon.', budget: 55000000, location: 'Quezon' },
];

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [bidders, setBidders] = useState<Bidder[]>([
    { id: `bidder-${Date.now()}`, name: '', amount: '', inclusions: '' }
  ]);
  const [winningBidderName, setWinningBidderName] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [bacMembers, setBacMembers] = useState<BACMember[]>([
    { id: `bac-${Date.now()}`, name: '', designation: '' }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = () => {
    setIsLoading(true);
    setLoadingMessage('Analyzing General Appropriations Act PDF...');
    setTimeout(() => {
      setProjects(MOCK_DPWH_PROJECTS);
      setFileUploaded(true);
      setIsLoading(false);
      setLoadingMessage('');
      setStep(2);
    }, 1500);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setStep(3);
  };

  const handleBidderChange = (id: string, field: keyof Omit<Bidder, 'id'>, value: string) => {
    setBidders(bidders.map(b => b.id === id ? { ...b, [field]: value } : b));
  };
  
  const addBidder = () => {
    setBidders([...bidders, { id: `bidder-${Date.now()}`, name: '', amount: '', inclusions: '' }]);
  };
  
  const removeBidder = (id: string) => {
    const bidderToRemove = bidders.find(b => b.id === id);
    if (bidderToRemove && winningBidderName === bidderToRemove.name) {
      setWinningBidderName('');
    }
    setBidders(bidders.filter(b => b.id !== id));
  };

  const handleBACChange = (id: string, field: keyof Omit<BACMember, 'id'>, value: string) => {
    setBacMembers(bacMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  
  const addBACMember = () => {
    setBacMembers([...bacMembers, { id: `bac-${Date.now()}`, name: '', designation: '' }]);
  };

  const removeBACMember = (id: string) => {
    setBacMembers(bacMembers.filter(m => m.id !== id));
  };
  
  const isFormValid = useMemo(() => {
    return selectedProject &&
           bidders.every(b => b.name && b.amount && Number(b.amount) > 0) &&
           winningBidderName &&
           reasoning &&
           bacMembers.every(m => m.name && m.designation);
  }, [selectedProject, bidders, winningBidderName, reasoning, bacMembers]);

  const handleAnalyze = useCallback(async () => {
    if (!isFormValid || !selectedProject) return;
    
    setIsLoading(true);
    setError(null);
    setAnalysisReport('');
    setSources([]);

    const analysisSteps = [
        "Initializing forensic analysis protocols...",
        "Cross-referencing BAC members with bidder directorates...",
        "Scanning public records for conflicts of interest...",
        "Analyzing historical bidding patterns for collusion...",
        "Reviewing bidder performance on previous government projects...",
        "Checking social media and news for undisclosed connections...",
        "Simulating SALN pattern analysis for involved officials...",
        "Consolidating findings and generating final report..."
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
        setLoadingMessage(analysisSteps[stepIndex]);
        stepIndex = (stepIndex + 1) % analysisSteps.length;
    }, 2500);

    try {
        const numericBidders = bidders.map(b => ({...b, amount: Number(b.amount)}));
        const result = await analyzeBid(selectedProject, numericBidders, winningBidderName, reasoning, bacMembers);
        setAnalysisReport(result.report);
        setSources(result.sources);
        setStep(4);
    } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
    } finally {
        clearInterval(interval);
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [isFormValid, selectedProject, bidders, winningBidderName, reasoning, bacMembers]);


  const renderFormattedReport = (report: string) => {
    return report.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="text-xl font-bold text-brand-blue mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
         return <h4 key={index} className="text-lg font-semibold text-brand-gray mt-3 mb-1">{line}</h4>;
      }
      return <p key={index} className="my-1">{line}</p>;
    });
  };

  const chartData = useMemo(() => {
    return bidders
      .filter(b => b.name && b.amount)
      .map(b => ({
        name: b.name,
        'Bid Amount': Number(b.amount),
        'Approved Budget': selectedProject?.budget,
      }));
  }, [bidders, selectedProject]);
  
  const Header = () => (
    <header className="bg-brand-blue shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Govt. Bid Guardian <span className="text-brand-accent">AI</span>
        </h1>
        <p className="text-white opacity-80">Ensuring Transparency in Public Procurement</p>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        
        {/* Step 1: File Upload */}
        <section className={`p-6 bg-white rounded-xl shadow-lg mb-8 transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
          <h2 className="text-2xl font-bold text-brand-gray mb-4 flex items-center">
            <span className="bg-brand-blue text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 text-lg">1</span>
            Upload General Appropriations Act (GAA)
          </h2>
          {!fileUploaded ? (
            <div className="border-2 border-dashed border-brand-lightgray rounded-lg p-8 text-center cursor-pointer hover:border-brand-blue hover:bg-blue-50 transition-colors" onClick={handleFileUpload}>
              <DocumentArrowUpIcon />
              <p className="mt-2 text-brand-gray font-semibold">Click to upload PDF</p>
              <p className="text-sm text-gray-500">The AI will extract DPWH projects from the document.</p>
            </div>
          ) : (
            <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>GAA Document processed successfully. Please select a project below.</span>
            </div>
          )}
        </section>

        {/* Step 2: Project Selection */}
        {step >= 2 && (
          <section className={`p-6 bg-white rounded-xl shadow-lg mb-8 transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
             <h2 className="text-2xl font-bold text-brand-gray mb-4 flex items-center">
                <span className="bg-brand-blue text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 text-lg">2</span>
                Select a DPWH Project
            </h2>
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project.id} onClick={() => handleSelectProject(project)}
                     className="p-4 border border-brand-lightgray rounded-lg hover:shadow-md hover:border-brand-blue transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-brand-blue group-hover:text-brand-lightblue">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                      <p className="text-sm font-semibold text-brand-gray mt-1">Budget: PHP {project.budget.toLocaleString()}</p>
                    </div>
                    <ChevronRightIcon />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 3: Bidding Details */}
        {step === 3 && selectedProject && (
          <section className="p-6 bg-white rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-brand-gray mb-1 flex items-center">
                <span className="bg-brand-blue text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 text-lg">3</span>
                Enter Bidding Details
            </h2>
            <p className="text-gray-600 mb-6 ml-11">For project: <span className="font-semibold text-brand-blue">{selectedProject.name}</span></p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                {/* Bidders Form */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-brand-gray mb-3">Bidders Information</h3>
                  {bidders.map((bidder, index) => (
                    <div key={bidder.id} className="p-4 border rounded-lg mb-3 bg-slate-50 relative">
                      <p className="font-semibold text-gray-700 mb-2">Bidder #{index + 1}</p>
                       {bidders.length > 1 && (
                         <button onClick={() => removeBidder(bidder.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><TrashIcon/></button>
                       )}
                      <div className="space-y-3">
                        <input type="text" placeholder="Name of Bidder" value={bidder.name} onChange={e => handleBidderChange(bidder.id, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                        <input type="number" placeholder="Bid Amount (PHP)" value={bidder.amount} onChange={e => handleBidderChange(bidder.id, 'amount', e.target.value)} className="w-full p-2 border rounded-md"/>
                        <textarea placeholder="Specific inclusions in the bid..." value={bidder.inclusions} onChange={e => handleBidderChange(bidder.id, 'inclusions', e.target.value)} className="w-full p-2 border rounded-md h-24"></textarea>
                      </div>
                    </div>
                  ))}
                  <button onClick={addBidder} className="flex items-center gap-1 text-brand-blue font-semibold hover:text-brand-lightblue"><PlusIcon/> Add Bidder</button>
                </div>
                
                {/* BAC Members Form */}
                <div>
                  <h3 className="text-xl font-semibold text-brand-gray mb-3">Bids and Awards Committee (BAC)</h3>
                   {bacMembers.map((member, index) => (
                    <div key={member.id} className="p-4 border rounded-lg mb-3 bg-slate-50 relative">
                      <p className="font-semibold text-gray-700 mb-2">Member #{index + 1}</p>
                      {bacMembers.length > 1 && (
                        <button onClick={() => removeBACMember(member.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><TrashIcon/></button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Full Name" value={member.name} onChange={e => handleBACChange(member.id, 'name', e.target.value)} className="w-full p-2 border rounded-md"/>
                        <input type="text" placeholder="Designation" value={member.designation} onChange={e => handleBACChange(member.id, 'designation', e.target.value)} className="w-full p-2 border rounded-md"/>
                      </div>
                    </div>
                  ))}
                  <button onClick={addBACMember} className="flex items-center gap-1 text-brand-blue font-semibold hover:text-brand-lightblue"><PlusIcon/> Add BAC Member</button>
                </div>

              </div>
              
              <div>
                 {/* Selection Details */}
                 <div className="mb-6">
                    <h3 className="text-xl font-semibold text-brand-gray mb-3">Selection Details</h3>
                    <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Winning Bidder</label>
                            <select value={winningBidderName} onChange={e => setWinningBidderName(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="">Select the winning bidder</option>
                                {bidders.filter(b => b.name).map(b => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reasoning for Selection</label>
                            <textarea placeholder="Explain the rationale behind choosing the winning bidder..." value={reasoning} onChange={e => setReasoning(e.target.value)} className="w-full p-2 border rounded-md h-32"></textarea>
                        </div>
                    </div>
                 </div>

                {/* Bid Comparison Chart */}
                <div className="h-80">
                  <h3 className="text-xl font-semibold text-brand-gray mb-3">Bid Comparison</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} interval={0} />
                      <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                      <Tooltip formatter={(value) => `PHP ${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Bid Amount" fill="#1976D2" />
                      <Bar dataKey="Approved Budget" fill="#FFC107" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

             <div className="mt-8 text-center">
               <button onClick={handleAnalyze} disabled={!isFormValid || isLoading} 
                className="bg-brand-accent text-brand-gray font-bold py-3 px-8 rounded-lg shadow-md hover:bg-yellow-500 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:scale-100">
                 {isLoading ? 'Analyzing...' : 'Analyze Bid with AI'}
               </button>
             </div>
          </section>
        )}

        {(isLoading && step !== 4) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mb-4 animate-spin" style={{borderTopColor: '#FFC107'}}></div>
              <p className="text-white text-lg font-semibold">{loadingMessage}</p>
            </div>
        )}
        
        {/* Step 4: Analysis Report */}
        {step === 4 && (
             <section className="p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-brand-gray mb-4 flex items-center">
                    <span className="bg-brand-blue text-white rounded-full h-8 w-8 flex items-center justify-center mr-3 text-lg">4</span>
                    AI Analysis Report
                </h2>
                {error && <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>}
                
                {analysisReport && (
                    <div className="prose max-w-none p-4 border rounded-md bg-slate-50">
                        {renderFormattedReport(analysisReport)}
                    </div>
                )}
                 {sources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-brand-gray mb-2">Sources Found by AI</h3>
                    <ul className="space-y-2">
                      {sources.map((source, index) => (
                        <li key={index} className="text-sm">
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
             </section>
        )}

      </main>
    </div>
  );
};

export default App;
