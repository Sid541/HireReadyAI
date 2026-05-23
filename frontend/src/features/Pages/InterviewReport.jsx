import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import html2pdf from 'html2pdf.js';
import { 
    Download, 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Lightbulb, 
    MessageSquare, 
    Trophy,
    TrendingUp
} from 'lucide-react';
import "./InterviewReport.scss"

const InterviewReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const reportRef = useRef(null);

    // Retrieve data safely from router navigation parameters
    const report = location.state?.reportData;
    const meta = location.state?.meta;

    // Handle empty state if users navigate to the URL directly without context records
    if (!report) {
        return (
            <main className="dashboard-layout">
                <div className="empty-state-card">
                    <XCircle size={48} style={{ color: '#e1034d', marginBottom: '1rem' }} />
                    <h2>No Report Context Located</h2>
                    <p>To view metrics evaluation diagnostics, please initiate and complete an automated interview simulation sequence first.</p>
                    <button className="button primary-button" onClick={() => navigate('/interview')}>
                        <ArrowLeft size={16} /> Return to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    const handleExportPDFReport = () => {
    const element = reportRef.current;
    
    const options = {
        margin: [0.3, 0.3, 0.3, 0.3], // Adds explicitly defined page boundaries
        filename: `AI_Evaluation_Report_${meta?.jobRole ? meta.jobRole.replace(/\s+/g, '_') : 'Mern_Stack_Developer'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            logging: false,
            letterRendering: true, // Optimizes text mapping inside flexible layouts
            scrollX: 0,
            scrollY: 0
            
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] } // Prevents text cutting off mid-sentence across pages
    };

    // Use the promise chain to guarantee execution context remains bound to the elements
    html2pdf().set(options).from(element).toContainer().toCanvas().toImg().toPdf().save();
};

    return (
        <main className="dashboard-layout report-workspace-wrapper">
            <div className="top-utility-navigation">
                <button className="back-btn" onClick={() => navigate('/interview')}>
                    <ArrowLeft size={16} /> <span>Configure New Session</span>
                </button>
                <button className="button primary-button download-pdf-btn" onClick={handleExportPDFReport}>
                    <Download size={16} /> <span>Download Enterprise PDF</span>
                </button>
            </div>

            <div ref={reportRef} className="premium-report-paper">
                {/* HERO STATS PANEL */}
                <div className="report-header-banner">
                    <div className="left-meta">
                        <span className="pill">OFFICIAL ASSESSMENT REPORT</span>
                        <h1>Technical Performance Metrics</h1>
                        <p>Target Framework Profiles: <strong>{meta?.jobRole}</strong> • Mode: {meta?.difficulty.toUpperCase()}</p>
                    </div>
                    <div className="right-score-radial">
                        <div className="radial-inner">
                            <span className="numeric">{report.overallScore}</span>
                            <span className="label">OVERALL GRADIENT</span>
                        </div>
                    </div>
                </div>

                {/* EXECUTIVE SUMMARY OVERVIEW TILES */}
                <div className="analytics-metrics-grid">
                    <div className="metric-tile tile-communication">
                        <div className="tile-title">
                            <MessageSquare size={18} />
                            <h3>Communication & Articulation Delivery</h3>
                        </div>
                        <p>{report.communicationRating}</p>
                    </div>

                    <div className="metric-tile tile-strengths">
                        <div className="tile-title" style={{ color: '#3fb950' }}>
                            <Trophy size={18} />
                            <h3>Demonstrated Core Technical Strengths</h3>
                        </div>
                        <p>{report.strengths}</p>
                    </div>

                    <div className="metric-tile tile-weaknesses">
                        <div className="tile-title" style={{ color: '#f97583' }}>
                            <XCircle size={18} />
                            <h3>Identified Concept Vulnerabilities</h3>
                        </div>
                        <p>{report.weaknesses}</p>
                    </div>
                </div>

                {/* TARGETED RECOMMENDATION BLOCKS */}
                <div className="action-items-section">
                    <div className="section-header-title">
                        <TrendingUp size={20} style={{ color: '#e1034d' }} />
                        <h2>Targeted Curated Action Items For Upskilling</h2>
                    </div>
                    <div className="action-cards-container">
                        {report.improvements?.map((item, idx) => (
                            <div key={idx} className="action-bullet-card">
                                <div className="bullet-num"><Lightbulb size={16} /></div>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAILED PER-QUESTION ASSESSMENT TIMELINE */}
                <div className="detailed-breakdown-timeline">
                    <div className="section-header-title">
                        <CheckCircle2 size={20} style={{ color: '#e1034d' }} />
                        <h2>Granular Question Analytics Breakdown</h2>
                    </div>

                    <div className="timeline-stream">
                        {report.perQuestionAnalysis?.map((item, idx) => (
                            <div key={idx} className="timeline-node-row">
                                <div className="node-sidebar">
                                    <div className="indicator-badge">{idx + 1}</div>
                                    <div className="connector-line" />
                                </div>
                                <div className="node-content-block">
                                    <div className="block-meta-hdr">
                                        <h4>Evaluation Matrix Module {idx + 1}</h4>
                                        <span className="block-score">Score Weight: <strong>{item.score}/100</strong></span>
                                    </div>
                                    <p className="evaluated-question">"{item.question}"</p>
                                    <div className="feedback-sub-callout">
                                        <p><strong>Gemini Pipeline Auditor Analysis:</strong> {item.feedback}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default InterviewReport;