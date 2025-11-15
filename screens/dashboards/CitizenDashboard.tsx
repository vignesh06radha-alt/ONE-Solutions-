
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext, IAppContext } from '../../contexts/AppContext';
// FIX: Import ProblemStatus to use enum values instead of strings for type safety.
import { Problem, Reward, UserRole, ProblemStatus } from '../../types';
import Card from '../../components/Card';
import { PlusCircle, Gift, List, ArrowRight, AlertTriangle, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import AILoadingIndicator from '../../components/AILoadingIndicator';
import AIAnalysisResult from './shared/AIAnalysisResult';
import MyReports from './shared/MyReports';
import EmergencyInfo from '../../components/EmergencyInfo';
import NotificationCenter from '../../components/NotificationCenter';

interface CitizenDashboardProps {
  view: string;
  setView: (view: string) => void;
}

const ReportProblemForm: React.FC<{ onReportSubmitted: () => void }> = ({ onReportSubmitted }) => {
    const { user, AIService } = useContext(AppContext) as IAppContext;
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error("Description is required.");
            return;
        }
        if (!location.trim()) {
            toast.error("Location is required.");
            return;
        }
        setIsSubmitting(true);
        setAnalysisResult(null);

        // Parse location for internal use (if needed)
        const locationCoords = { 
            lat: 34.0522 + (Math.random() - 0.5) * 0.1, 
            lng: -118.2437 + (Math.random() - 0.5) * 0.1 
        };

        const newProblem: Partial<Problem> = {
            id: uuidv4(),
            userId: user!.id,
            reporterName: user!.name,
            description,
            image: image || `https://picsum.photos/seed/${uuidv4()}/400/300`,
            location: locationCoords,
            timestamp: new Date().toISOString(),
            aiProcessingStatus: 'processing',
        };

        // Send to n8n webhook - POST request with JSON payload
        const n8nWebhookUrl = 'https://uncharitable-unparenthesized-shaunta.ngrok-free.dev';
        
        // Prepare JSON payload with problem and location as text (strictly text format)
        const n8nPayload = {
            problem: description.trim(),
            location: location.trim()
        };

        console.log('🚀 ===== STARTING N8N WEBHOOK REQUEST =====');
        console.log('📍 URL:', n8nWebhookUrl);
        console.log('📦 Payload:', JSON.stringify(n8nPayload, null, 2));
        console.log('📦 Payload type:', typeof n8nPayload);
        console.log('📦 Payload keys:', Object.keys(n8nPayload));

        // POST to n8n webhook - MUST HAPPEN BEFORE ANYTHING ELSE
        let webhookSent = false;
        let webhookError = null;
        
        try {
            console.log('⏳ Making POST request NOW...');
            
            const fetchPromise = fetch(n8nWebhookUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(n8nPayload),
            });
            
            console.log('📡 Fetch promise created, awaiting response...');
            
            const n8nRes = await fetchPromise;
            
            console.log('✅ Fetch completed!');
            console.log('📊 Response status:', n8nRes.status);
            console.log('📊 Response ok:', n8nRes.ok);
            console.log('📊 Response headers:', Object.fromEntries(n8nRes.headers.entries()));
            
            const responseText = await n8nRes.text();
            console.log('📄 Response body:', responseText);
            
            if (n8nRes.ok) {
                webhookSent = true;
                console.log('✅✅✅ SUCCESS: Data sent to n8n webhook successfully!');
                toast.success("✅ Successfully sent to n8n webhook!");
            } else {
                webhookError = `HTTP ${n8nRes.status}: ${responseText}`;
                console.error('❌ Webhook returned error status:', n8nRes.status, responseText);
                toast.error(`Webhook error: ${n8nRes.status}`);
            }
        } catch (fetchError: any) {
            webhookError = fetchError.message || fetchError.toString();
            console.error('❌❌❌ FETCH ERROR:', {
                name: fetchError.name,
                message: fetchError.message,
                stack: fetchError.stack,
                error: fetchError
            });
            
            // Show error to user
            toast.error(`Failed to send to webhook: ${fetchError.message || 'Network error'}`);
            
            // Check if it's a CORS error
            if (fetchError.name === 'TypeError' || fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('CORS')) {
                console.error('🚫 CORS or Network error detected!');
                console.error('💡 This might be due to:');
                console.error('   1. CORS not enabled on n8n/ngrok');
                console.error('   2. Network connectivity issues');
                console.error('   3. ngrok tunnel not active');
            }
            
            // Don't throw - we'll still save the problem locally
        }
        
        console.log('🏁 Webhook attempt completed. Sent:', webhookSent, 'Error:', webhookError);
        
        // Continue with saving the problem regardless of webhook status
        try {

            // Save problem with pending status (will be updated when n8n processes it)
            const fullProblem: Problem = {
                ...newProblem,
                status: ProblemStatus.Pending,
                aiProcessingStatus: webhookSent ? 'processing' : 'pending',
            } as Problem;
            
            const problemList = await window.storage.get('problems:list') || [];
            await window.storage.set('problems:list', [...problemList, fullProblem.id], true);
            await window.storage.set(`problem:${fullProblem.id}`, fullProblem, true);

            // Show success message with webhook status
            if (webhookSent) {
                toast.success("✅ Problem submitted and sent to n8n webhook! Your report is being analyzed by AI.");
            } else if (webhookError) {
                toast.success("⚠️ Problem saved locally. Webhook error: " + webhookError);
            } else {
                toast.success("Problem submitted! Your report is being processed.");
            }
            
            // Reset form
            setDescription('');
            setLocation('');
            setImage(null);
            
            // Show submission confirmation
            setAnalysisResult({
                submitted: true,
                webhookSent: webhookSent,
                webhookError: webhookError,
                message: webhookSent 
                    ? "Your problem has been successfully sent to n8n webhook and is being analyzed by AI."
                    : "Your problem has been saved. " + (webhookError ? `Webhook error: ${webhookError}` : "Webhook connection failed.")
            } as any);
            
            onReportSubmitted();
        } catch (error: any) {
            console.error("❌ Problem saving error:", error);
            
            // Even if everything fails, try to save the problem locally
            try {
                const failedProblem: Problem = {
                    ...newProblem, 
                    status: ProblemStatus.Pending, 
                    aiProcessingStatus: 'failed'
                } as Problem;
                
                const problemList = await window.storage.get('problems:list') || [];
                await window.storage.set('problems:list', [...problemList, failedProblem.id], true);
                await window.storage.set(`problem:${failedProblem.id}`, failedProblem, true);
            } catch (saveError) {
                console.error("Failed to save problem:", saveError);
            }

            toast.error("Error saving problem: " + (error.message || 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (analysisResult) {
        // Check if this is a submission confirmation
        if ((analysisResult as any).submitted) {
            return (
                <div className="animate-fadeIn">
                    <Card className="bg-gradient-to-br from-green-900/20 via-gray-900 to-gray-800 border-green-500/30 shadow-2xl">
                        <div className="mb-6 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative">
                                    <span className="text-6xl animate-bounce">✅</span>
                                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl animate-pulse"></div>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                                Problem Submitted Successfully!
                            </h2>
                            <p className="text-gray-300 text-lg mb-2">
                                Your report has been submitted for AI analysis and sorting for reward allocation.
                            </p>
                            <p className="text-gray-400 text-sm">
                                The AI agent is processing your report. You will be notified once the analysis is complete and credits are allocated.
                            </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20 mb-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">🤖</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-2">What happens next?</h3>
                                    <ul className="space-y-2 text-gray-300 text-sm">
                                        <li className="flex items-start">
                                            <span className="mr-2">1️⃣</span>
                                            <span>AI is analyzing your problem report</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">2️⃣</span>
                                            <span>Problem is being categorized and prioritized</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">3️⃣</span>
                                            <span>Reward allocation is being calculated</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">4️⃣</span>
                                            <span>You'll receive credits once processing is complete</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setAnalysisResult(null);
                                setDescription('');
                                setLocation('');
                                setImage(null);
                            }} 
                            className="w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="mr-2">➕</span>
                            Report Another Problem
                        </button>
                    </Card>
                </div>
            );
        }
        
        // Original analysis result display (for backward compatibility)
        return (
            <div className="animate-fadeIn">
                <Card className="bg-gradient-to-br from-green-900/20 via-gray-900 to-gray-800 border-green-500/30 shadow-2xl">
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <span className="text-4xl mr-3 animate-bounce">✅</span>
                            <h2 className="text-2xl font-bold text-white">AI Analysis Complete</h2>
                        </div>
                        <p className="text-gray-400 text-sm">Your problem has been analyzed and credits have been awarded!</p>
                    </div>
                    <div className="animate-slideUp">
                        <AIAnalysisResult analysis={analysisResult} />
                    </div>
                    <button 
                        onClick={() => setAnalysisResult(null)} 
                        className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-400 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-green-300 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="mr-2">➕</span>
                        Report Another Problem
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-green-500/20 shadow-2xl animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <span className="mr-3 text-3xl">🤖</span>
                    Report to AI Agent
                </h2>
                <p className="text-gray-400 text-sm">Describe the problem and our AI will analyze it instantly</p>
            </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-200 mb-2">
                        Describe the issue <span className="text-green-400">*</span>
                    </label>
                    <textarea 
                        id="description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={5} 
                        className="mt-1 block w-full rounded-lg border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm shadow-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 text-gray-100 placeholder-gray-500 p-4 resize-none" 
                        placeholder="Example: Large pothole on Main Street causing traffic issues..." 
                        required 
                    />
                    <p className="mt-2 text-xs text-gray-500">💡 Tip: More details help the AI provide better analysis</p>
                </div>
                <div className="animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-200 mb-2">
                        Location <span className="text-green-400">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)} 
                        className="mt-1 block w-full rounded-lg border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm shadow-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 text-gray-100 placeholder-gray-500 p-4" 
                        placeholder="Example: Main Street, near Oak Avenue intersection, Los Angeles, CA" 
                        required 
                    />
                    <p className="mt-2 text-xs text-gray-500">📍 Enter the location where the problem is occurring</p>
                </div>
                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <label htmlFor="image" className="block text-sm font-semibold text-gray-200 mb-2">
                        Upload Image <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                        <input 
                            type="file" 
                            id="image" 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-500/20 file:to-green-400/10 file:text-green-400 hover:file:from-green-500/30 hover:file:to-green-400/20 file:transition-all file:duration-300 file:cursor-pointer cursor-pointer"
                        />
                    </div>
                    {image && (
                        <div className="mt-4 relative group animate-fadeIn">
                            <img 
                                src={image} 
                                alt="Preview" 
                                className="rounded-xl max-h-64 w-full object-cover border-2 border-green-500/30 shadow-xl transform group-hover:scale-[1.02] transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    )}
                </div>
                 {isSubmitting ? (
                    <div className="animate-fadeIn">
                        <AILoadingIndicator />
                    </div>
                 ) : (
                    <button 
                        type="submit" 
                        className="w-full flex justify-center items-center bg-gradient-to-r from-green-500 via-green-400 to-green-500 text-black font-bold py-4 px-6 rounded-xl hover:from-green-400 hover:via-green-300 hover:to-green-400 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-green-500/50 transform hover:scale-[1.02] active:scale-[0.98] animate-slideUp" 
                        style={{ animationDelay: '0.3s' }}
                        disabled={isSubmitting}
                    >
                        <span className="mr-2 text-xl">🚀</span>
                        Submit for AI Analysis
                        <span className="ml-2">→</span>
                    </button>
                 )}
            </form>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </Card>
    );
};

const RewardsMarketplace: React.FC = () => {
    const { user } = useContext(AppContext) as IAppContext;
    const [rewards, setRewards] = useState<any[]>([]);
    const [userCredits, setUserCredits] = useState<number>(user?.credits || 0);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchRewards();
        fetchUserCredits();
    }, []);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            // Try backend API first, fallback to mock data
            try {
                const response = await fetch('http://localhost:3001/api/rewards/list', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setRewards(data.data?.rewards || []);
                } else {
                    throw new Error('Backend not available');
                }
            } catch (error) {
                // Fallback to mock data
                console.log('Using mock rewards data');
                const mockRewards = await window.storage.get('rewards:catalog');
                setRewards(mockRewards || []);
            }
        } catch (error) {
            console.error('Error fetching rewards:', error);
            toast.error('Failed to load rewards');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserCredits = async () => {
        try {
            const currentUser = await window.storage.get(`user:${user!.id}`);
            if (currentUser) {
                setUserCredits(currentUser.credits || 0);
            }
        } catch (error) {
            console.error('Error fetching user credits:', error);
        }
    };

    const handleRedeem = async (reward: any) => {
        // Handle both old format (cost) and new format (creditsRequired)
        const creditsNeeded = reward.creditsRequired || reward.cost || 0;
        const rewardId = reward.rewardId || reward.id;
        
        if (userCredits < creditsNeeded) {
            toast.error(`Not enough credits! You need ${creditsNeeded} credits.`);
            return;
        }

        setRedeeming(rewardId);
        try {
            // Try backend API first
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('http://localhost:3001/api/rewards/redeem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || ''}`,
                    },
                    body: JSON.stringify({ rewardId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const redemptionCode = data.data?.redemption?.rewardDetails?.rewardCode;
                    const successMessage = redemptionCode 
                        ? `Successfully redeemed! Your code: ${redemptionCode}`
                        : 'Successfully redeemed!';
                    toast.success(successMessage, { duration: 5000 });
                    // Update user credits
                    const newCredits = userCredits - creditsNeeded;
                    setUserCredits(newCredits);
                    const currentUser = await window.storage.get(`user:${user!.id}`);
                    if (currentUser) {
                        currentUser.credits = newCredits;
                        await window.storage.set(`user:${user!.id}`, currentUser, false);
                    }
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Backend redemption failed');
                }
            } catch (apiError: any) {
                // Fallback to mock redemption
                console.log('Using mock redemption:', apiError.message);
                const currentUser = await window.storage.get(`user:${user!.id}`);
                const currentCredits = currentUser?.credits || 0;
                if (currentCredits < creditsNeeded) {
                    toast.error("Not enough credits!");
                    return;
                }
                currentUser.credits = currentCredits - creditsNeeded;
                await window.storage.set(`user:${user!.id}`, currentUser, false);
                setUserCredits(currentUser.credits);
                toast.success(`You redeemed "${reward.description || reward.title}"!`);
            }
        } catch (error) {
            console.error('Error redeeming reward:', error);
            toast.error('Failed to redeem reward. Please try again.');
        } finally {
            setRedeeming(null);
        }
    };

    const categories = [
        { id: 'all', label: 'All Rewards', icon: '🎁' },
        { id: 'transport', label: 'Transport', icon: '🚌' },
        { id: 'commodity', label: 'Commodities', icon: '🛒' },
        { id: 'partner', label: 'Partner Offers', icon: '🤝' },
    ];

    const filteredRewards = selectedCategory === 'all' 
        ? rewards 
        : rewards.filter(r => {
            const rewardType = r.type || (r.id?.includes('transport') ? 'transport' : 
                                        r.id?.includes('commodity') ? 'commodity' : 
                                        r.id?.includes('partner') ? 'partner' : null);
            return rewardType === selectedCategory;
        });

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'transport': return '🚌';
            case 'commodity': return '🛒';
            case 'partner': return '🤝';
            default: return '🎁';
        }
    };

    if (loading) {
        return (
            <Card title="Rewards Marketplace">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Loading rewards...</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn w-full">
            {/* Header with Credits Display */}
            <Card className="bg-gradient-to-r from-gray-900/95 via-gray-800/90 to-gray-900/95 border-green-500/30 shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slideRight">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                            Rewards Marketplace
                        </h2>
                        <p className="text-gray-300 mt-1 text-base">Redeem your One Credits for amazing discounts and offers</p>
                    </div>
                    <div className="text-center md:text-right bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl p-6 border border-green-500/30 shadow-lg transform hover:scale-105 transition-transform duration-300 w-full md:w-auto">
                        <p className="text-sm text-gray-300 mb-1">Your Balance</p>
                        <p className="text-5xl font-bold text-green-400 animate-pulse" style={{ textShadow: '0 0 20px rgba(52, 211, 153, 0.5)' }}>
                            {userCredits}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">One Credits</p>
                    </div>
                </div>
            </Card>

            {/* Category Filter */}
            <Card className="bg-gradient-to-r from-gray-900/90 to-gray-800/90">
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat, index) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                                selectedCategory === cat.id
                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-lg shadow-yellow-400/50 scale-105'
                                    : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:border-yellow-400/50 border-2 border-transparent'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span className="mr-2 text-lg">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Rewards Grid */}
            <Card title={`Available Rewards (${filteredRewards.length})`}>
                {filteredRewards.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No rewards available in this category</p>
                        <p className="text-gray-500 text-sm mt-2">Check back later for new offers!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRewards.map((reward, index) => {
                            const creditsNeeded = reward.creditsRequired || reward.cost || 0;
                            const rewardId = reward.rewardId || reward.id;
                            const canAfford = userCredits >= creditsNeeded;
                            const rewardType = reward.type || (reward.id?.includes('transport') ? 'transport' : 
                                             reward.id?.includes('commodity') ? 'commodity' : 'partner');
                            
                            return (
                                <div
                                    key={rewardId}
                                    className={`p-6 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border-2 rounded-xl flex flex-col transform transition-all duration-500 ${
                                        canAfford
                                            ? 'border-gray-700 hover:border-yellow-400/70 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(234,179,8,0.3)] hover:scale-105'
                                            : 'border-gray-900 opacity-60'
                                    }`}
                                    style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-yellow-400/10 rounded-lg">
                                            <span className="text-3xl">{getRewardIcon(rewardType)}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-yellow-400">{creditsNeeded}</p>
                                            <p className="text-xs text-gray-500">credits</p>
                                        </div>
                                    </div>
                                    
                                    <h4 className="font-semibold text-lg text-white mb-2">
                                        {reward.description || reward.title}
                                    </h4>
                                    
                                    {reward.partnersData?.partnerName && (
                                        <p className="text-xs text-gray-400 mb-2">
                                            by {reward.partnersData.partnerName}
                                        </p>
                                    )}
                                    
                                    {reward.partnersData?.validity && (
                                        <p className="text-xs text-gray-500 mb-2">
                                            Valid for: {reward.partnersData.validity}
                                        </p>
                                    )}
                                    
                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => handleRedeem(reward)}
                                            disabled={!canAfford || redeeming === rewardId}
                                            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${
                                                canAfford
                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {redeeming === rewardId ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                                    Processing...
                                                </span>
                                            ) : canAfford ? (
                                                'Redeem Now'
                                            ) : (
                                                'Insufficient Credits'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ view, setView }) => {
  const { user } = useContext(AppContext) as IAppContext;
  const [localUser, setLocalUser] = useState(user);

  const refreshUserData = useCallback(async () => {
        if(user) {
            const updatedUser = await window.storage.get(`user:${user.id}`);
            setLocalUser(updatedUser);
        }
  }, [user]);

  useEffect(() => {
    refreshUserData();
  }, [view, refreshUserData]);

  const MainDashboard = () => (
    <div className="space-y-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4">
                <h4 className="text-xl font-semibold text-gray-200">Welcome, {localUser?.name}</h4>
                <p className="text-gray-400">Your actions are making a real difference. Report problems to earn credits and help us build a better community together.</p>
                <div className="flex items-start space-x-6 pt-4">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-green-400 my-2">{localUser?.credits || 0}</p>
                        <h4 className="font-semibold text-gray-400">My One Credits</h4>
                    </div>
                     <div className="flex flex-col space-y-3">
                        <button 
                            onClick={() => setView('report')} 
                            className="flex items-center justify-between text-lg font-semibold text-green-400 hover:text-green-300 transition-all duration-300 group bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-green-500/50 transform hover:translate-x-2 w-full"
                        >
                            <span className="flex items-center">
                                <span className="mr-2 text-xl">🤖</span>
                                Report to AI Agent
                            </span>
                            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setView('rewards')} 
                            className="flex items-center justify-between text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition-all duration-300 group bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-yellow-500/50 transform hover:translate-x-2 w-full"
                        >
                            <span className="flex items-center">
                                <span className="mr-2 text-xl">🎁</span>
                                Browse Rewards
                            </span>
                            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setView('emergency')} 
                            className="flex items-center justify-between text-lg font-semibold text-red-400 hover:text-red-300 transition-all duration-300 group bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-red-500/50 transform hover:translate-x-2 w-full"
                        >
                            <span className="flex items-center">
                                <span className="mr-2 text-xl">🚨</span>
                                Report Emergency
                            </span>
                            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setView('alerts')} 
                            className="flex items-center justify-between text-lg font-semibold text-blue-400 hover:text-blue-300 transition-all duration-300 group bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-blue-500/50 transform hover:translate-x-2 w-full"
                        >
                            <span className="flex items-center">
                                <span className="mr-2 text-xl">🔔</span>
                                Disaster Alerts
                            </span>
                            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </Card>
             <Card 
                className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border-green-500/30 hover:bg-green-500/30 transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]" 
                onClick={() => setView('my-reports')}
                style={{ animationDelay: '0.1s' }}
            >
                <div className="relative">
                    <List className="h-14 w-14 mb-3 text-green-400 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">My Reports</h4>
                <p className="text-gray-400 text-sm">Track the status of your submissions.</p>
            </Card>
            <Card 
                className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent border-red-500/30 hover:bg-red-500/30 transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]" 
                onClick={() => setView('emergency')}
                style={{ animationDelay: '0.2s' }}
            >
                <div className="relative">
                    <AlertTriangle className="h-14 w-14 mb-3 text-red-400 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">Emergency</h4>
                <p className="text-gray-400 text-sm">Report urgent situations.</p>
            </Card>
            <Card 
                className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/30 hover:bg-blue-500/30 transition-all duration-500 cursor-pointer group transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
                onClick={() => setView('alerts')}
                style={{ animationDelay: '0.3s' }}
            >
                <div className="relative">
                    <Bell className="h-14 w-14 mb-3 text-blue-400 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Alerts</h4>
                <p className="text-gray-400 text-sm">Disaster & emergency updates.</p>
            </Card>
        </div>
        
        {/* Rewards Section - Prominent Display */}
        <Card className="bg-gradient-to-r from-yellow-500/10 via-yellow-400/5 to-yellow-500/10 border-yellow-500/30 shadow-2xl animate-scaleIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6 animate-slideRight">
                <div>
                    <h3 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <Gift className="mr-3 h-8 w-8 text-yellow-400 animate-pulse" />
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                            Rewards Marketplace
                        </span>
                    </h3>
                    <p className="text-gray-300">Redeem your One Credits for discounts on bus rides, commodities, and partner offers</p>
                </div>
                <button 
                    onClick={() => setView('rewards')}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-200 transition-all duration-300 flex items-center shadow-lg hover:shadow-yellow-400/50 transform hover:scale-105 active:scale-95"
                >
                    Browse All Rewards
                    <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                    className="p-5 bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border-2 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] group cursor-pointer"
                    onClick={() => setView('rewards')}
                    style={{ animationDelay: '0.5s' }}
                >
                    <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🚌</span>
                        <h4 className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors">Transport Discounts</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Get discounts on bus rides, train tickets, and more</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setView('rewards'); }}
                        className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 flex items-center group-hover:translate-x-2 transition-transform"
                    >
                        View Offers <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                </div>
                <div 
                    className="p-5 bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border-2 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] group cursor-pointer"
                    onClick={() => setView('rewards')}
                    style={{ animationDelay: '0.6s' }}
                >
                    <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🛒</span>
                        <h4 className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors">Commodities</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Discounts on groceries, household items, and daily essentials</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setView('rewards'); }}
                        className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 flex items-center group-hover:translate-x-2 transition-transform"
                    >
                        View Offers <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                </div>
                <div 
                    className="p-5 bg-gradient-to-br from-gray-900/80 to-gray-800/60 rounded-xl border-2 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] group cursor-pointer"
                    onClick={() => setView('rewards')}
                    style={{ animationDelay: '0.7s' }}
                >
                    <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🤝</span>
                        <h4 className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors">Partner Offers</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">Exclusive deals from our partner organizations</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setView('rewards'); }}
                        className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 flex items-center group-hover:translate-x-2 transition-transform"
                    >
                        View Offers <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                </div>
            </div>
        </Card>
        
        <MyReports limit={3} />
    </div>
  );

  switch (view) {
    case 'dashboard':
      return <MainDashboard />;
    case 'report':
      return <ReportProblemForm onReportSubmitted={refreshUserData} />;
    case 'my-reports':
      return <MyReports />;
    case 'rewards':
        return <RewardsMarketplace />;
    case 'emergency':
        return <EmergencyInfo userId={localUser?.id || ''} />;
    case 'alerts':
        return <NotificationCenter userId={localUser?.id || ''} />;
    default:
      return <MainDashboard />;
  }
};

export default CitizenDashboard;