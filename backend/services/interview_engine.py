"""
Agentic Interview Engine - The AI Brain
========================================
Orchestrates real-time AI interviews using:
- Deepgram Nova-2 for Speech-to-Text
- Google Gemini 1.5 Flash for reasoning
- Google Cloud TTS (Chirp) for Text-to-Speech

Features:
- Real-time conversation management
- Code analysis and feedback
- Behavioral assessment
- Proctoring integration
- Metrics calculation
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Agentic Interview Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ============================================
# DATA MODELS
# ============================================

class InterviewPhase(str, Enum):
    INTRO = "intro"
    PROBLEM_PRESENTATION = "problem_presentation"
    CLARIFICATION = "clarification"
    APPROACH_DISCUSSION = "approach_discussion"
    CODING = "coding"
    TESTING = "testing"
    OPTIMIZATION = "optimization"
    WRAP_UP = "wrap_up"

class MessageRole(str, Enum):
    SYSTEM = "system"
    INTERVIEWER = "interviewer"
    CANDIDATE = "candidate"

@dataclass
class InterviewMessage:
    role: MessageRole
    content: str
    timestamp: datetime
    metadata: Optional[Dict] = None

@dataclass
class CodeSubmission:
    code: str
    language: str
    timestamp: datetime
    test_results: Optional[Dict] = None
    analysis: Optional[Dict] = None

@dataclass
class InterviewMetrics:
    # Technical (40%)
    correctness_score: float = 0.0
    time_complexity_score: float = 0.0
    space_complexity_score: float = 0.0
    edge_cases_score: float = 0.0
    
    # Code Quality (20%)
    code_readability_score: float = 0.0
    code_structure_score: float = 0.0
    naming_conventions_score: float = 0.0
    
    # Communication (20%)
    explanation_clarity_score: float = 0.0
    hints_response_score: float = 0.0
    questions_quality_score: float = 0.0
    
    # Behavioral (20%)
    problem_approach_score: float = 0.0
    confidence_score: float = 0.0
    collaboration_score: float = 0.0
    
    # Proctoring
    cheating_probability: float = 0.0
    tab_switches: int = 0
    copy_pastes: int = 0
    voice_anomalies: int = 0

class InterviewSession:
    """Manages a single interview session"""
    
    def __init__(
        self,
        session_id: str,
        candidate_id: str,
        problem: Dict,
        job_id: Optional[str] = None,
        session_type: str = "practice"
    ):
        self.session_id = session_id
        self.candidate_id = candidate_id
        self.problem = problem
        self.job_id = job_id
        self.session_type = session_type
        
        self.phase = InterviewPhase.INTRO
        self.messages: List[InterviewMessage] = []
        self.code_submissions: List[CodeSubmission] = []
        self.metrics = InterviewMetrics()
        
        self.started_at = datetime.utcnow()
        self.ended_at: Optional[datetime] = None
        
        # AI Model
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat = None
        
        # Proctoring data
        self.proctoring_events: List[Dict] = []
        
    async def initialize(self):
        """Initialize the interview session with context"""
        system_prompt = self._build_system_prompt()
        
        self.chat = self.model.start_chat(history=[])
        
        # Prime the AI with the system context
        await self._send_to_ai(system_prompt, is_system=True)
        
        logger.info(f"Session {self.session_id} initialized for problem: {self.problem.get('title')}")
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt for the AI interviewer"""
        return f"""You are an expert technical interviewer conducting a coding interview. Your name is Aria.

INTERVIEW CONTEXT:
- Problem: {self.problem.get('title')}
- Difficulty: {self.problem.get('difficulty')}
- Expected Time Complexity: {self.problem.get('time_complexity', 'Not specified')}
- Expected Space Complexity: {self.problem.get('space_complexity', 'Not specified')}

PROBLEM DESCRIPTION:
{self.problem.get('description', 'No description available')}

EXAMPLES:
{json.dumps(self.problem.get('examples', []), indent=2)}

TEST CASES (Hidden from candidate):
{json.dumps(self.problem.get('test_cases', []), indent=2)}

INTERVIEW GUIDELINES:
1. Be professional, encouraging, and helpful
2. Start with a brief introduction and explain the interview format
3. Present the problem clearly and ask if they have questions
4. Guide them through their thought process with Socratic questioning
5. Provide hints if they're stuck, but let them think first
6. Evaluate their approach before they start coding
7. Review their code and discuss optimizations
8. Keep responses concise (2-4 sentences for voice output)

PHASE MANAGEMENT:
- Current Phase: {self.phase.value}
- Move through phases naturally based on candidate progress
- Signal phase transitions with [PHASE: <phase_name>]

EVALUATION CRITERIA (Internal - Don't share with candidate):
- Technical: Solution correctness, complexity analysis
- Code Quality: Clean code, good naming, modularity
- Communication: Clear explanations, good questions
- Problem Solving: Approach methodology, handling edge cases

RESPONSE FORMAT:
- Keep responses conversational and natural
- Use simple language suitable for text-to-speech
- Include [HINT] tag when giving hints
- Include [FEEDBACK] tag for code feedback
- Include [SCORE_UPDATE: category=value] for internal scoring

Begin by introducing yourself warmly and explaining the interview format."""
    
    async def _send_to_ai(self, message: str, is_system: bool = False) -> str:
        """Send message to Gemini and get response"""
        try:
            response = await asyncio.to_thread(
                self.chat.send_message,
                message
            )
            
            return response.text
        except Exception as e:
            logger.error(f"AI error: {e}")
            return "I apologize, I'm having a moment. Could you repeat that?"
    
    async def process_candidate_message(self, transcript: str) -> Dict:
        """Process candidate's spoken message and generate AI response"""
        # Store candidate message
        self.messages.append(InterviewMessage(
            role=MessageRole.CANDIDATE,
            content=transcript,
            timestamp=datetime.utcnow()
        ))
        
        # Add context about current state
        context = f"""
[Candidate said]: {transcript}

[Current Phase]: {self.phase.value}
[Code Editor Status]: {'Has code' if self.code_submissions else 'Empty'}
[Latest Code]: {self.code_submissions[-1].code[:500] if self.code_submissions else 'None'}

Respond naturally to the candidate. Keep it conversational and brief for voice output."""
        
        # Get AI response
        ai_response = await self._send_to_ai(context)
        
        # Parse response for metadata
        parsed = self._parse_ai_response(ai_response)
        
        # Store AI message
        self.messages.append(InterviewMessage(
            role=MessageRole.INTERVIEWER,
            content=parsed['clean_text'],
            timestamp=datetime.utcnow(),
            metadata=parsed['metadata']
        ))
        
        # Update phase if signaled
        if parsed['metadata'].get('phase_change'):
            self.phase = InterviewPhase(parsed['metadata']['phase_change'])
        
        # Update scores if provided
        if parsed['metadata'].get('score_updates'):
            self._apply_score_updates(parsed['metadata']['score_updates'])
        
        return {
            'text': parsed['clean_text'],
            'phase': self.phase.value,
            'metadata': parsed['metadata']
        }
    
    def _parse_ai_response(self, response: str) -> Dict:
        """Parse AI response for metadata tags"""
        import re
        
        metadata = {
            'hints': [],
            'feedback': [],
            'score_updates': {},
            'phase_change': None
        }
        
        # Extract hints
        hints = re.findall(r'\[HINT\](.*?)(?=\[|$)', response, re.DOTALL)
        metadata['hints'] = [h.strip() for h in hints]
        
        # Extract feedback
        feedback = re.findall(r'\[FEEDBACK\](.*?)(?=\[|$)', response, re.DOTALL)
        metadata['feedback'] = [f.strip() for f in feedback]
        
        # Extract score updates
        scores = re.findall(r'\[SCORE_UPDATE:\s*(\w+)=(\d+(?:\.\d+)?)\]', response)
        metadata['score_updates'] = {k: float(v) for k, v in scores}
        
        # Extract phase change
        phase_match = re.search(r'\[PHASE:\s*(\w+)\]', response)
        if phase_match:
            metadata['phase_change'] = phase_match.group(1)
        
        # Clean text (remove all metadata tags)
        clean_text = re.sub(r'\[(?:HINT|FEEDBACK|SCORE_UPDATE|PHASE)[^\]]*\]', '', response)
        clean_text = ' '.join(clean_text.split())  # Normalize whitespace
        
        return {
            'clean_text': clean_text.strip(),
            'metadata': metadata
        }
    
    def _apply_score_updates(self, updates: Dict[str, float]):
        """Apply score updates from AI analysis"""
        score_mapping = {
            'correctness': 'correctness_score',
            'time_complexity': 'time_complexity_score',
            'space_complexity': 'space_complexity_score',
            'edge_cases': 'edge_cases_score',
            'readability': 'code_readability_score',
            'structure': 'code_structure_score',
            'naming': 'naming_conventions_score',
            'explanation': 'explanation_clarity_score',
            'hints_response': 'hints_response_score',
            'questions': 'questions_quality_score',
            'approach': 'problem_approach_score',
            'confidence': 'confidence_score',
            'collaboration': 'collaboration_score'
        }
        
        for key, value in updates.items():
            if key in score_mapping:
                setattr(self.metrics, score_mapping[key], value)
    
    async def analyze_code(self, code: str, language: str) -> Dict:
        """Analyze submitted code"""
        submission = CodeSubmission(
            code=code,
            language=language,
            timestamp=datetime.utcnow()
        )
        
        # Run test cases (simplified - in production, use a secure sandbox)
        test_results = await self._run_tests(code, language)
        submission.test_results = test_results
        
        # AI analysis of code
        analysis_prompt = f"""Analyze this code submission for the problem "{self.problem.get('title')}":

```{language}
{code}
```

Test Results: {json.dumps(test_results)}

Provide analysis in the following JSON format:
{{
    "correctness": <0-100>,
    "time_complexity": "<O notation>",
    "time_complexity_score": <0-100>,
    "space_complexity": "<O notation>",
    "space_complexity_score": <0-100>,
    "code_quality": <0-100>,
    "issues": ["list of issues"],
    "suggestions": ["list of improvement suggestions"],
    "strengths": ["what they did well"]
}}

Return ONLY the JSON, no other text."""
        
        try:
            analysis_response = await self._send_to_ai(analysis_prompt)
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', analysis_response, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                submission.analysis = analysis
                
                # Update metrics
                self.metrics.correctness_score = analysis.get('correctness', 0)
                self.metrics.time_complexity_score = analysis.get('time_complexity_score', 0)
                self.metrics.space_complexity_score = analysis.get('space_complexity_score', 0)
                self.metrics.code_readability_score = analysis.get('code_quality', 0)
                
        except Exception as e:
            logger.error(f"Code analysis error: {e}")
            submission.analysis = {"error": str(e)}
        
        self.code_submissions.append(submission)
        
        return {
            'test_results': test_results,
            'analysis': submission.analysis
        }
    
    async def _run_tests(self, code: str, language: str) -> Dict:
        """Run test cases against submitted code"""
        # In production, this should use a secure sandbox (Docker, AWS Lambda, etc.)
        # For now, return mock results
        test_cases = self.problem.get('test_cases', [])
        
        results = {
            'passed': 0,
            'failed': 0,
            'total': len(test_cases),
            'details': []
        }
        
        # Mock test execution
        for i, tc in enumerate(test_cases[:5]):  # Limit visible tests
            # This is a placeholder - real implementation needs sandboxed execution
            passed = True  # Mock: assume passing
            results['details'].append({
                'test_case': i + 1,
                'input': tc.get('input', 'hidden') if not tc.get('hidden') else 'hidden',
                'expected': tc.get('output', 'hidden') if not tc.get('hidden') else 'hidden',
                'passed': passed
            })
            if passed:
                results['passed'] += 1
            else:
                results['failed'] += 1
        
        return results
    
    def record_proctoring_event(self, event_type: str, data: Dict):
        """Record a proctoring event"""
        event = {
            'type': event_type,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data
        }
        self.proctoring_events.append(event)
        
        # Update metrics
        if event_type == 'tab_switch':
            self.metrics.tab_switches += 1
        elif event_type == 'copy_paste':
            self.metrics.copy_pastes += 1
        elif event_type == 'voice_anomaly':
            self.metrics.voice_anomalies += 1
        
        # Update cheating probability
        self._calculate_cheating_probability()
    
    def _calculate_cheating_probability(self):
        """Calculate cheating probability based on proctoring events"""
        base_probability = 0.0
        
        # Tab switches
        if self.metrics.tab_switches > 0:
            base_probability += min(self.metrics.tab_switches * 10, 40)
        
        # Copy/paste events
        if self.metrics.copy_pastes > 2:
            base_probability += min((self.metrics.copy_pastes - 2) * 15, 30)
        
        # Voice anomalies
        if self.metrics.voice_anomalies > 0:
            base_probability += min(self.metrics.voice_anomalies * 20, 30)
        
        self.metrics.cheating_probability = min(base_probability, 100)
    
    def calculate_final_scores(self) -> Dict:
        """Calculate weighted final scores"""
        # Technical (40%)
        technical_score = (
            self.metrics.correctness_score * 0.4 +
            self.metrics.time_complexity_score * 0.3 +
            self.metrics.space_complexity_score * 0.2 +
            self.metrics.edge_cases_score * 0.1
        )
        
        # Code Quality (20%)
        code_quality_score = (
            self.metrics.code_readability_score * 0.4 +
            self.metrics.code_structure_score * 0.35 +
            self.metrics.naming_conventions_score * 0.25
        )
        
        # Communication (20%)
        communication_score = (
            self.metrics.explanation_clarity_score * 0.5 +
            self.metrics.hints_response_score * 0.25 +
            self.metrics.questions_quality_score * 0.25
        )
        
        # Behavioral (20%)
        behavioral_score = (
            self.metrics.problem_approach_score * 0.4 +
            self.metrics.confidence_score * 0.3 +
            self.metrics.collaboration_score * 0.3
        )
        
        # Apply cheating penalty
        cheating_penalty = 0
        if self.metrics.cheating_probability > 50:
            cheating_penalty = (self.metrics.cheating_probability - 50) * 2
        
        # Total score
        total_score = (
            technical_score * 0.4 +
            code_quality_score * 0.2 +
            communication_score * 0.2 +
            behavioral_score * 0.2 -
            cheating_penalty
        )
        
        total_score = max(0, min(100, total_score))
        
        return {
            'total': round(total_score, 1),
            'technical': round(technical_score, 1),
            'code_quality': round(code_quality_score, 1),
            'communication': round(communication_score, 1),
            'behavioral': round(behavioral_score, 1),
            'cheating_probability': round(self.metrics.cheating_probability, 1),
            'detailed_metrics': asdict(self.metrics)
        }
    
    async def generate_feedback(self) -> Dict:
        """Generate comprehensive AI feedback for the candidate"""
        scores = self.calculate_final_scores()
        
        feedback_prompt = f"""Based on this technical interview, generate comprehensive feedback:

PROBLEM: {self.problem.get('title')}
FINAL CODE:
```
{self.code_submissions[-1].code if self.code_submissions else 'No code submitted'}
```

SCORES:
- Total: {scores['total']}/100
- Technical: {scores['technical']}/100
- Code Quality: {scores['code_quality']}/100
- Communication: {scores['communication']}/100
- Behavioral: {scores['behavioral']}/100

CONVERSATION SUMMARY:
{self._summarize_conversation()}

Generate feedback in JSON format:
{{
    "overall_assessment": "2-3 sentence summary",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2", "area 3"],
    "specific_recommendations": ["recommendation 1", "recommendation 2"],
    "resources_to_study": ["topic 1", "topic 2"],
    "interview_ready": true/false,
    "recommended_practice": "what to focus on next"
}}

Return ONLY the JSON."""
        
        try:
            response = await self._send_to_ai(feedback_prompt)
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception as e:
            logger.error(f"Feedback generation error: {e}")
        
        return {
            "overall_assessment": "Interview completed. Review your performance in the detailed metrics.",
            "strengths": [],
            "areas_for_improvement": [],
            "specific_recommendations": [],
            "resources_to_study": [],
            "interview_ready": scores['total'] >= 70,
            "recommended_practice": "Continue practicing similar problems."
        }
    
    def _summarize_conversation(self) -> str:
        """Create a brief summary of the conversation"""
        summary_parts = []
        for msg in self.messages[-20:]:  # Last 20 messages
            role = "Candidate" if msg.role == MessageRole.CANDIDATE else "Interviewer"
            content = msg.content[:100] + "..." if len(msg.content) > 100 else msg.content
            summary_parts.append(f"{role}: {content}")
        return "\n".join(summary_parts)
    
    async def end_session(self) -> Dict:
        """End the interview session and compile results"""
        self.ended_at = datetime.utcnow()
        
        scores = self.calculate_final_scores()
        feedback = await self.generate_feedback()
        
        duration = (self.ended_at - self.started_at).total_seconds()
        
        return {
            'session_id': self.session_id,
            'candidate_id': self.candidate_id,
            'problem_id': self.problem.get('id'),
            'job_id': self.job_id,
            'session_type': self.session_type,
            'started_at': self.started_at.isoformat(),
            'ended_at': self.ended_at.isoformat(),
            'duration_seconds': int(duration),
            'scores': scores,
            'feedback': feedback,
            'final_code': self.code_submissions[-1].code if self.code_submissions else None,
            'code_language': self.code_submissions[-1].language if self.code_submissions else None,
            'test_results': self.code_submissions[-1].test_results if self.code_submissions else None,
            'conversation_history': [
                {
                    'role': msg.role.value,
                    'content': msg.content,
                    'timestamp': msg.timestamp.isoformat()
                }
                for msg in self.messages
            ],
            'proctoring_events': self.proctoring_events,
            'cheating_flag': self.metrics.cheating_probability > 50
        }


# ============================================
# SESSION MANAGER
# ============================================

class SessionManager:
    """Manages all active interview sessions"""
    
    def __init__(self):
        self.sessions: Dict[str, InterviewSession] = {}
    
    async def create_session(
        self,
        candidate_id: str,
        problem: Dict,
        job_id: Optional[str] = None,
        session_type: str = "practice"
    ) -> InterviewSession:
        """Create a new interview session"""
        session_id = str(uuid.uuid4())
        
        session = InterviewSession(
            session_id=session_id,
            candidate_id=candidate_id,
            problem=problem,
            job_id=job_id,
            session_type=session_type
        )
        
        await session.initialize()
        self.sessions[session_id] = session
        
        return session
    
    def get_session(self, session_id: str) -> Optional[InterviewSession]:
        """Get an existing session"""
        return self.sessions.get(session_id)
    
    async def end_session(self, session_id: str) -> Optional[Dict]:
        """End a session and get results"""
        session = self.sessions.get(session_id)
        if session:
            results = await session.end_session()
            del self.sessions[session_id]
            return results
        return None


# Global session manager
session_manager = SessionManager()


# ============================================
# API ENDPOINTS
# ============================================

class StartSessionRequest(BaseModel):
    candidate_id: str
    problem_id: str
    job_id: Optional[str] = None
    session_type: str = "practice"

class MessageRequest(BaseModel):
    session_id: str
    transcript: str

class CodeRequest(BaseModel):
    session_id: str
    code: str
    language: str

class ProctoringEvent(BaseModel):
    session_id: str
    event_type: str
    data: Dict[str, Any]


@app.post("/api/interview/start")
async def start_interview(request: StartSessionRequest):
    """Start a new interview session"""
    # In production, fetch problem from database
    # For now, use a mock problem
    mock_problem = {
        'id': request.problem_id,
        'title': 'Two Sum',
        'difficulty': 'Easy',
        'description': '''Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.''',
        'examples': [
            {'input': 'nums = [2,7,11,15], target = 9', 'output': '[0,1]', 'explanation': 'Because nums[0] + nums[1] == 9'},
            {'input': 'nums = [3,2,4], target = 6', 'output': '[1,2]'}
        ],
        'test_cases': [
            {'input': {'nums': [2,7,11,15], 'target': 9}, 'output': [0,1], 'hidden': False},
            {'input': {'nums': [3,2,4], 'target': 6}, 'output': [1,2], 'hidden': False},
            {'input': {'nums': [3,3], 'target': 6}, 'output': [0,1], 'hidden': True}
        ],
        'time_complexity': 'O(n)',
        'space_complexity': 'O(n)'
    }
    
    session = await session_manager.create_session(
        candidate_id=request.candidate_id,
        problem=mock_problem,
        job_id=request.job_id,
        session_type=request.session_type
    )
    
    # Get initial greeting from AI
    initial_response = await session.process_candidate_message("[Session started - Please introduce yourself]")
    
    return {
        'session_id': session.session_id,
        'problem': {
            'title': mock_problem['title'],
            'difficulty': mock_problem['difficulty'],
            'description': mock_problem['description'],
            'examples': mock_problem['examples']
        },
        'initial_message': initial_response['text']
    }


@app.post("/api/interview/message")
async def process_message(request: MessageRequest):
    """Process candidate's message and get AI response"""
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    response = await session.process_candidate_message(request.transcript)
    
    return {
        'response': response['text'],
        'phase': response['phase'],
        'hints_given': len(response['metadata'].get('hints', []))
    }


@app.post("/api/interview/code")
async def submit_code(request: CodeRequest):
    """Submit code for analysis"""
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    analysis = await session.analyze_code(request.code, request.language)
    
    return {
        'test_results': analysis['test_results'],
        'analysis': analysis['analysis']
    }


@app.post("/api/interview/proctoring")
async def record_proctoring(request: ProctoringEvent):
    """Record a proctoring event"""
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.record_proctoring_event(request.event_type, request.data)
    
    return {'recorded': True}


@app.post("/api/interview/end")
async def end_interview(session_id: str):
    """End the interview and get results"""
    results = await session_manager.end_session(session_id)
    if not results:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return results


@app.get("/api/interview/status/{session_id}")
async def get_session_status(session_id: str):
    """Get current session status"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        'session_id': session_id,
        'phase': session.phase.value,
        'duration': (datetime.utcnow() - session.started_at).total_seconds(),
        'message_count': len(session.messages),
        'code_submissions': len(session.code_submissions),
        'current_scores': session.calculate_final_scores()
    }


# ============================================
# WEBSOCKET FOR REAL-TIME COMMUNICATION
# ============================================

@app.websocket("/ws/interview/{session_id}")
async def websocket_interview(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time interview communication"""
    await websocket.accept()
    
    session = session_manager.get_session(session_id)
    if not session:
        await websocket.close(code=4004, reason="Session not found")
        return
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get('type')
            
            if message_type == 'transcript':
                # Process spoken message
                response = await session.process_candidate_message(data.get('text', ''))
                await websocket.send_json({
                    'type': 'ai_response',
                    'text': response['text'],
                    'phase': response['phase']
                })
            
            elif message_type == 'code_update':
                # Analyze code
                analysis = await session.analyze_code(
                    data.get('code', ''),
                    data.get('language', 'python')
                )
                await websocket.send_json({
                    'type': 'code_analysis',
                    'results': analysis
                })
            
            elif message_type == 'proctoring':
                # Record proctoring event
                session.record_proctoring_event(
                    data.get('event_type', 'unknown'),
                    data.get('data', {})
                )
            
            elif message_type == 'end':
                # End session
                results = await session.end_session()
                await websocket.send_json({
                    'type': 'session_ended',
                    'results': results
                })
                break
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_sessions": len(session_manager.sessions),
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
