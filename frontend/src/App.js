import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  FileText, Mic, Search, MapPin, Paperclip, ChevronDown, ChevronUp,
  ArrowLeft, Send, CheckCircle2, AlertTriangle, Shield,
  Globe2, Languages, Copy, Check, Loader2, MicOff,
  CircleDot, Plus, ChevronRight, Landmark, Lock, Zap, Timer,
  Sparkles, Star, Activity, Brain, HeartHandshake
} from "lucide-react";
import {
  IndiaMapSVG, AshokaChakraSVG, GovBuildingSVG,
  TypingIllustrationSVG, VoiceIllustrationSVG, TrackIllustrationSVG,
  ParticleField, EmblemRingSVG, WaveDivider, TricolorBar, DeptIconsField
} from "./Illustrations";
const UI_STRINGS = {
  English: {
    operatorPortal: "Operator Portal", heroTitle: "Operator Grievance Portal", heroSub: "Record & file citizen issues on their behalf",
    recordByTyping: "Record by Typing", recordByTypingSub: "Type what the citizen described", recordByVoice: "Record by Voice",
    recordByVoiceSub: "Let the citizen speak — you capture it", trackComplaint: "Track Complaint", trackComplaintSub: "Check status using Ticket ID",
    back: "← Back", citizenName: "Citizen Name (optional)", citizenPhone: "Citizen Phone (optional)",
    citizenNamePlaceholder: "e.g. Prince Kumar", citizenPhonePlaceholder: "e.g. 98765 43210", spokenLanguage: "Spoken Language",
    preAssignDept: "Pre-assign Department", letAIDecide: "Let AI Decide", autoDetect: "Auto Detect",
    citizenStatement: "Citizen's Statement", citizenStatementPlaceholder: "Describe what the citizen reported…", locationRequired: "Citizen Location",
    locationRequiredBadge: "* Required", fetchingLocation: "Fetching location…", locationCaptured: "Location Captured",
    tapToCapture: "Tap to Capture Citizen Location", locationMandatory: "Location is mandatory before filing.", attachEvidence: "Attach Evidence",
    startVoice: "Start Capturing Voice", stopVoice: "Stop Capture", capturingVoice: "CAPTURING CITIZEN VOICE…",
    filingRouting: "Filing & Routing…", captureToEnable: "Capture Location to Enable Filing", fileGrievance: "File Grievance on Behalf of Citizen",
    requiredBefore: "Required before filing", statementRecorded: "Citizen statement recorded", locationCapturedReq: "Citizen location captured",
    grievanceFiledSuccess: "Grievance Filed Successfully", grievanceFiledSuccessSub: "Recorded and routed. No further action required from the citizen.", ticketId: "Ticket ID",
    filedOn: "Filed On", department: "Department", priority: "Priority",
    language: "Language", complaintFiled: "Complaint Filed on Behalf", resolutionCommitted: "Resolution Committed By",
    copyTicketId: "Copy Ticket ID", copied: "Copied", fileAnother: "+ File Another Grievance",
    trackTitle: "Track Complaint", trackSub: "Enter your Ticket ID to check current status and history", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "Searching…", track: "Track", enterTicketId: "Please enter a ticket ID.",
    ticketNotFound: "Ticket not found. Please check the ID.", assignedTo: "Assigned To", escalationChain: "Escalation Chain",
    statusHistory: "Status History", languageVotes: "Language Detection Votes", citizenOriginalStatement: "Citizen's Original Statement",
    complaintOnRecord: "Complaint on Record", slaDeadline: "SLA Deadline", confidence: "Confidence",
    filed: "Filed:", recordByTypingFull: "Record by Typing", recordByVoiceFull: "Record by Voice",
    recordAndFile: "Record & file citizen issues on their behalf", allLanguages: "All 22 Scheduled Indian Languages + Auto", autoDetectLabel: "Auto Detect Language",
    autoDetectSub: "AI will identify the language",
  },
  Hindi: {
    operatorPortal: "ऑपरेटर पोर्टल", heroTitle: "ऑपरेटर शिकायत पोर्टल", heroSub: "नागरिकों की ओर से समस्याएं दर्ज करें",
    recordByTyping: "टाइप करके दर्ज करें", recordByTypingSub: "नागरिक ने जो बताया वो टाइप करें", recordByVoice: "आवाज़ से दर्ज करें",
    recordByVoiceSub: "नागरिक बोलें — आप रिकॉर्ड करें", trackComplaint: "शिकायत ट्रैक करें", trackComplaintSub: "टिकट ID से स्थिति जांचें",
    back: "← वापस", citizenName: "नागरिक का नाम (वैकल्पिक)", citizenPhone: "नागरिक का फ़ोन (वैकल्पिक)",
    citizenNamePlaceholder: "जैसे Prince Kumar", citizenPhonePlaceholder: "जैसे 98765 43210", spokenLanguage: "बोली जाने वाली भाषा",
    preAssignDept: "विभाग पूर्व-निर्धारित करें", letAIDecide: "AI तय करे", autoDetect: "AI स्वतः पहचानें",
    citizenStatement: "नागरिक का बयान", citizenStatementPlaceholder: "नागरिक ने जो बताया उसका विवरण दें…", locationRequired: "Location नागरिक का स्थान",
    locationRequiredBadge: "* आवश्यक", fetchingLocation: "Loading स्थान प्राप्त हो रहा है…", locationCaptured: "Done",
    tapToCapture: "Location नागरिक का स्थान कैप्चर करें", locationMandatory: "दर्ज करने से पहले स्थान अनिवार्य है।", attachEvidence: "Attachment साक्ष्य संलग्न करें",
    startVoice: "Voice आवाज़ कैप्चर शुरू करें", stopVoice: "Stop कैप्चर रोकें", capturingVoice: "नागरिक की आवाज़ रिकॉर्ड हो रही है…",
    filingRouting: "दर्ज और रूट किया जा रहा है…", captureToEnable: "Location दर्ज करने के लिए स्थान कैप्चर करें", fileGrievance: "नागरिक की ओर से शिकायत दर्ज करें",
    requiredBefore: "दर्ज करने से पहले आवश्यक", statementRecorded: "नागरिक का बयान दर्ज", locationCapturedReq: "नागरिक का स्थान कैप्चर किया गया",
    grievanceFiledSuccess: "शिकायत सफलतापूर्वक दर्ज हुई", grievanceFiledSuccessSub: "दर्ज और रूट किया गया। नागरिक को कोई और कार्रवाई आवश्यक नहीं।", ticketId: "टिकट ID",
    filedOn: "दर्ज तिथि", department: "Department विभाग", priority: "प्राथमिकता",
    language: "Language भाषा", complaintFiled: "Record दर्ज शिकायत", resolutionCommitted: "समाधान की प्रतिबद्धता",
    copyTicketId: "Copy टिकट ID कॉपी करें", copied: "Done कॉपी हो गया!", fileAnother: "+ और शिकायत दर्ज करें",
    trackTitle: "शिकायत ट्रैक करें", trackSub: "स्थिति जांचने के लिए टिकट ID दर्ज करें", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "खोज रहे हैं…", track: "Search ट्रैक करें", enterTicketId: "कृपया टिकट ID दर्ज करें।",
    ticketNotFound: "टिकट नहीं मिली। कृपया ID जांचें।", assignedTo: "Assigned नियुक्त", escalationChain: "Escalation एस्केलेशन श्रृंखला",
    statusHistory: "Copy स्थिति इतिहास", languageVotes: "Votes भाषा पहचान मत", citizenOriginalStatement: "नागरिक का मूल बयान",
    complaintOnRecord: "Record दर्ज शिकायत", slaDeadline: "SLA समय सीमा", confidence: "Search विश्वास",
    filed: "दर्ज:", recordByTypingFull: "टाइप करके दर्ज करें", recordByVoiceFull: "आवाज़ से दर्ज करें",
    recordAndFile: "नागरिकों की ओर से समस्याएं दर्ज करें", allLanguages: "सभी 22 अनुसूचित भारतीय भाषाएँ + स्वतः", autoDetectLabel: "AI भाषा स्वतः पहचानें",
    autoDetectSub: "AI भाषा पहचानेगी",
  },
  Telugu: {
    operatorPortal: "ఆపరేటర్ పోర్టల్", heroTitle: "ఆపరేటర్ ఫిర్యాదు పోర్టల్", heroSub: "పౌరుల తరఫున సమస్యలు నమోదు చేయండి",
    recordByTyping: "టైప్ చేసి నమోదు చేయండి", recordByTypingSub: "పౌరుడు చెప్పింది టైప్ చేయండి", recordByVoice: "వాయిస్ ద్వారా నమోదు",
    recordByVoiceSub: "పౌరుడు మాట్లాడనివ్వండి — మీరు రికార్డ్ చేయండి", trackComplaint: "ఫిర్యాదు ట్రాక్ చేయండి", trackComplaintSub: "టికెట్ ID తో స్థితి తనిఖీ చేయండి",
    back: "← వెనక్కి", citizenName: "పౌరుని పేరు (ఐచ్ఛికం)", citizenPhone: "పౌరుని ఫోన్ (ఐచ్ఛికం)",
    citizenNamePlaceholder: "ఉదా: Prince Kumar", citizenPhonePlaceholder: "ఉదా: 98765 43210", spokenLanguage: "మాట్లాడే భాష",
    preAssignDept: "విభాగం ముందుగా నిర్ణయించండి", letAIDecide: "AI నిర్ణయించనివ్వండి", autoDetect: "AI స్వయంచాలక గుర్తింపు",
    citizenStatement: "పౌరుని వివరణ", citizenStatementPlaceholder: "పౌరుడు నివేదించినది వివరించండి…", locationRequired: "Location పౌరుని స్థానం",
    locationRequiredBadge: "* అవసరం", fetchingLocation: "Loading స్థానం పొందుతోంది…", locationCaptured: "Done",
    tapToCapture: "Location పౌరుని స్థానం క్యాప్చర్ చేయండి", locationMandatory: "నమోదు చేయడానికి ముందు స్థానం తప్పనిసరి.", attachEvidence: "Attachment సాక్ష్యం జోడించండి",
    startVoice: "Voice వాయిస్ క్యాప్చర్ ప్రారంభించండి", stopVoice: "Stop క్యాప్చర్ ఆపండి", capturingVoice: "పౌరుని వాయిస్ రికార్డ్ అవుతోంది…",
    filingRouting: "నమోదు & రూటింగ్ జరుగుతోంది…", captureToEnable: "Location నమోదు చేయడానికి స్థానం క్యాప్చర్ చేయండి", fileGrievance: "పౌరుని తరఫున ఫిర్యాదు నమోదు చేయండి",
    requiredBefore: "నమోదు చేయడానికి ముందు అవసరం", statementRecorded: "పౌరుని వివరణ నమోదైంది", locationCapturedReq: "పౌరుని స్థానం క్యాప్చర్ అయింది",
    grievanceFiledSuccess: "ఫిర్యాదు విజయవంతంగా నమోదైంది", grievanceFiledSuccessSub: "నమోదు మరియు రూట్ అయింది. పౌరునికి మరింత చర్య అవసరం లేదు.", ticketId: "టికెట్ ID",
    filedOn: "నమోదు తేదీ", department: "Department విభాగం", priority: "ప్రాధాన్యత",
    language: "Language భాష", complaintFiled: "Record నమోదైన ఫిర్యాదు", resolutionCommitted: "పరిష్కార నిబద్ధత",
    copyTicketId: "Copy టికెట్ ID కాపీ చేయండి", copied: "Done కాపీ అయింది!", fileAnother: "+ మరో ఫిర్యాదు నమోదు చేయండి",
    trackTitle: "ఫిర్యాదు ట్రాక్ చేయండి", trackSub: "స్థితి తనిఖీ చేయడానికి టికెట్ ID నమోదు చేయండి", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "వెతుకుతోంది…", track: "Search ట్రాక్", enterTicketId: "దయచేసి టికెట్ ID నమోదు చేయండి.",
    ticketNotFound: "టికెట్ కనుగొనబడలేదు. దయచేసి ID తనిఖీ చేయండి.", assignedTo: "Assigned నియమించబడింది", escalationChain: "Escalation ఎస్కలేషన్ చైన్",
    statusHistory: "Copy స్థితి చరిత్ర", languageVotes: "Votes భాష గుర్తింపు ఓట్లు", citizenOriginalStatement: "పౌరుని అసలు వాక్యం",
    complaintOnRecord: "Record నమోదైన ఫిర్యాదు", slaDeadline: "SLA గడువు", confidence: "Search విశ్వాసం",
    filed: "నమోదు:", recordByTypingFull: "టైప్ చేసి నమోదు", recordByVoiceFull: "వాయిస్ ద్వారా నమోదు",
    recordAndFile: "పౌరుల తరఫున సమస్యలు నమోదు చేయండి", allLanguages: "అన్ని 22 షెడ్యూల్డ్ భారతీయ భాషలు + స్వయంచాలక", autoDetectLabel: "AI భాష స్వయంచాలకంగా గుర్తించండి",
    autoDetectSub: "AI భాషను గుర్తిస్తుంది",
  },
  Tamil: {
    operatorPortal: "ஆபரேட்டர் போர்டல்", heroTitle: "ஆபரேட்டர் குறை தீர்வு போர்டல்", heroSub: "குடிமக்கள் சார்பில் பிரச்சினைகளை பதிவு செய்யுங்கள்",
    recordByTyping: "தட்டச்சு செய்து பதிவு", recordByTypingSub: "குடிமகன் சொன்னதை தட்டச்சு செய்யுங்கள்", recordByVoice: "குரல் மூலம் பதிவு",
    recordByVoiceSub: "குடிமகன் பேசட்டும் — நீங்கள் பதிவு செய்யுங்கள்", trackComplaint: "புகாரை கண்காணிக்க", trackComplaintSub: "டிக்கெட் ID மூலம் நிலை சரிபார்க்கவும்",
    back: "← பின்னால்", citizenName: "குடிமகன் பெயர் (விரும்பினால்)", citizenPhone: "குடிமகன் தொலைபேசி (விரும்பினால்)",
    citizenNamePlaceholder: "எ.கா. Prince Kumar", citizenPhonePlaceholder: "எ.கா. 98765 43210", spokenLanguage: "பேசும் மொழி",
    preAssignDept: "துறையை முன்கூட்டியே நியமிக்கவும்", letAIDecide: "AI முடிவு செய்யட்டும்", autoDetect: "AI தானாக கண்டறி",
    citizenStatement: "குடிமகன் கூற்று", citizenStatementPlaceholder: "குடிமகன் தெரிவித்ததை விவரிக்கவும்…", locationRequired: "Location குடிமகன் இடம்",
    locationRequiredBadge: "* தேவை", fetchingLocation: "Loading இடம் பெறப்படுகிறது…", locationCaptured: "Done",
    tapToCapture: "Location குடிமகன் இடத்தை பதிவு செய்யவும்", locationMandatory: "பதிவு செய்வதற்கு முன் இடம் கட்டாயம்.", attachEvidence: "Attachment ஆதாரம் இணைக்கவும்",
    startVoice: "Voice குரல் பதிவு தொடங்கு", stopVoice: "Stop பதிவை நிறுத்து", capturingVoice: "குடிமகன் குரல் பதிவாகிறது…",
    filingRouting: "பதிவு மற்றும் திசைதிருப்பல்…", captureToEnable: "Location பதிவு செய்ய இடத்தை பதிவு செய்யவும்", fileGrievance: "குடிமகன் சார்பில் குறை பதிவு செய்யவும்",
    requiredBefore: "பதிவு செய்வதற்கு முன் தேவை", statementRecorded: "குடிமகன் கூற்று பதிவாயிற்று", locationCapturedReq: "குடிமகன் இடம் பதிவாயிற்று",
    grievanceFiledSuccess: "குறை வெற்றிகரமாக பதிவாயிற்று", grievanceFiledSuccessSub: "பதிவு மற்றும் திசைதிருப்பல் ஆயிற்று. குடிமகனுக்கு மேலும் நடவடிக்கை தேவையில்லை.", ticketId: "டிக்கெட் ID",
    filedOn: "பதிவு தேதி", department: "Department துறை", priority: "முன்னுரிமை",
    language: "Language மொழி", complaintFiled: "Record பதிவான புகார்", resolutionCommitted: "தீர்வு உறுதிமொழி",
    copyTicketId: "Copy டிக்கெட் ID நகலெடு", copied: "Done நகலெடுக்கப்பட்டது!", fileAnother: "+ மேலும் ஒரு குறை பதிவு",
    trackTitle: "புகாரை கண்காணிக்க", trackSub: "நிலை சரிபார்க்க டிக்கெட் ID உள்ளிடவும்", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "தேடுகிறது…", track: "Search கண்காணி", enterTicketId: "டிக்கெட் ID உள்ளிடவும்.",
    ticketNotFound: "டிக்கெட் கிடைக்கவில்லை. ID சரிபார்க்கவும்.", assignedTo: "Assigned நியமிக்கப்பட்டது", escalationChain: "Escalation அதிகரிப்பு சங்கிலி",
    statusHistory: "Copy நிலை வரலாறு", languageVotes: "Votes மொழி கண்டறிதல் வாக்குகள்", citizenOriginalStatement: "குடிமகனின் அசல் கூற்று",
    complaintOnRecord: "Record பதிவான புகார்", slaDeadline: "SLA காலக்கெடு", confidence: "Search நம்பகத்தன்மை",
    filed: "பதிவு:", recordByTypingFull: "தட்டச்சு மூலம் பதிவு", recordByVoiceFull: "குரல் மூலம் பதிவு",
    recordAndFile: "குடிமக்கள் சார்பில் பிரச்சினைகளை பதிவு செய்யுங்கள்", allLanguages: "அனைத்து 22 அட்டவணை இந்திய மொழிகள் + தானியங்கி", autoDetectLabel: "AI மொழியை தானாக கண்டறி",
    autoDetectSub: "AI மொழியை அடையாளம் காணும்",
  },
  Kannada: {
    operatorPortal: "ಆಪರೇಟರ್ ಪೋರ್ಟಲ್", heroTitle: "ಆಪರೇಟರ್ ದೂರು ಪೋರ್ಟಲ್", heroSub: "ನಾಗರಿಕರ ಪರವಾಗಿ ಸಮಸ್ಯೆಗಳನ್ನು ದಾಖಲಿಸಿ",
    recordByTyping: "ಟೈಪ್ ಮಾಡಿ ದಾಖಲಿಸಿ", recordByTypingSub: "ನಾಗರಿಕರು ಹೇಳಿದ್ದನ್ನು ಟೈಪ್ ಮಾಡಿ", recordByVoice: "ಧ್ವನಿ ಮೂಲಕ ದಾಖಲಿಸಿ",
    recordByVoiceSub: "ನಾಗರಿಕರು ಮಾತನಾಡಲಿ — ನೀವು ರೆಕಾರ್ಡ್ ಮಾಡಿ", trackComplaint: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", trackComplaintSub: "ಟಿಕೆಟ್ ID ಮೂಲಕ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
    back: "← ಹಿಂದೆ", citizenName: "ನಾಗರಿಕರ ಹೆಸರು (ಐಚ್ಛಿಕ)", citizenPhone: "ನಾಗರಿಕರ ಫೋನ್ (ಐಚ್ಛಿಕ)",
    citizenNamePlaceholder: "ಉದಾ: Prince Kumar", citizenPhonePlaceholder: "ಉದಾ: 98765 43210", spokenLanguage: "ಮಾತನಾಡುವ ಭಾಷೆ",
    preAssignDept: "ವಿಭಾಗ ಮುಂದಾಗಿ ನಿರ್ಧರಿಸಿ", letAIDecide: "AI ನಿರ್ಧರಿಸಲಿ", autoDetect: "AI ಸ್ವಯಂ ಪತ್ತೆ",
    citizenStatement: "ನಾಗರಿಕರ ಹೇಳಿಕೆ", citizenStatementPlaceholder: "ನಾಗರಿಕರು ವರದಿ ಮಾಡಿದ್ದನ್ನು ವಿವರಿಸಿ…", locationRequired: "Location ನಾಗರಿಕರ ಸ್ಥಳ",
    locationRequiredBadge: "* ಅಗತ್ಯ", fetchingLocation: "Loading ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ…", locationCaptured: "Done",
    tapToCapture: "Location ನಾಗರಿಕರ ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿ", locationMandatory: "ದಾಖಲಿಸಲು ಮೊದಲು ಸ್ಥಳ ಕಡ್ಡಾಯ.", attachEvidence: "Attachment ಸಾಕ್ಷ್ಯ ಲಗತ್ತಿಸಿ",
    startVoice: "Voice ಧ್ವನಿ ಕ್ಯಾಪ್ಚರ್ ಪ್ರಾರಂಭಿಸಿ", stopVoice: "Stop ಕ್ಯಾಪ್ಚರ್ ನಿಲ್ಲಿಸಿ", capturingVoice: "ನಾಗರಿಕರ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ…",
    filingRouting: "ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ…", captureToEnable: "Location ದಾಖಲಿಸಲು ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿ", fileGrievance: "ನಾಗರಿಕರ ಪರವಾಗಿ ದೂರು ದಾಖಲಿಸಿ",
    requiredBefore: "ದಾಖಲಿಸಲು ಮೊದಲು ಅಗತ್ಯ", statementRecorded: "ನಾಗರಿಕರ ಹೇಳಿಕೆ ದಾಖಲಾಗಿದೆ", locationCapturedReq: "ನಾಗರಿಕರ ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಆಗಿದೆ",
    grievanceFiledSuccess: "ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ", grievanceFiledSuccessSub: "ದಾಖಲಿಸಲಾಗಿದೆ ಮತ್ತು ರೂಟ್ ಮಾಡಲಾಗಿದೆ.", ticketId: "ಟಿಕೆಟ್ ID",
    filedOn: "ದಾಖಲಾದ ದಿನಾಂಕ", department: "Department ವಿಭಾಗ", priority: "ಆದ್ಯತೆ",
    language: "Language ಭಾಷೆ", complaintFiled: "Record ದಾಖಲಾದ ದೂರು", resolutionCommitted: "ಪರಿಹಾರ ಬದ್ಧತೆ",
    copyTicketId: "Copy ಟಿಕೆಟ್ ID ನಕಲಿಸಿ", copied: "Done ನಕಲಿಸಲಾಗಿದೆ!", fileAnother: "+ ಮತ್ತೊಂದು ದೂರು ದಾಖಲಿಸಿ",
    trackTitle: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", trackSub: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು ಟಿಕೆಟ್ ID ನಮೂದಿಸಿ", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "ಹುಡುಕಲಾಗುತ್ತಿದೆ…", track: "Search ಟ್ರ್ಯಾಕ್", enterTicketId: "ಟಿಕೆಟ್ ID ನಮೂದಿಸಿ.",
    ticketNotFound: "ಟಿಕೆಟ್ ಕಂಡುಬಂದಿಲ್ಲ. ID ಪರಿಶೀಲಿಸಿ.", assignedTo: "Assigned ನಿಯೋಜಿಸಲಾಗಿದೆ", escalationChain: "Escalation ಎಸ್ಕಲೇಶನ್ ಸರಪಳಿ",
    statusHistory: "Copy ಸ್ಥಿತಿ ಇತಿಹಾಸ", languageVotes: "Votes ಭಾಷಾ ಗುರುತಿಸುವಿಕೆ ಮತಗಳು", citizenOriginalStatement: "ನಾಗರಿಕರ ಮೂಲ ಹೇಳಿಕೆ",
    complaintOnRecord: "Record ದಾಖಲಾದ ದೂರು", slaDeadline: "SLA ಗಡುವು", confidence: "Search ವಿಶ್ವಾಸ",
    filed: "ದಾಖಲಾಗಿದೆ:", recordByTypingFull: "ಟೈಪ್ ಮೂಲಕ ದಾಖಲಿಸಿ", recordByVoiceFull: "ಧ್ವನಿ ಮೂಲಕ ದಾಖಲಿಸಿ",
    recordAndFile: "ನಾಗರಿಕರ ಪರವಾಗಿ ಸಮಸ್ಯೆಗಳನ್ನು ದಾಖಲಿಸಿ", allLanguages: "ಎಲ್ಲ 22 ಭಾರತೀಯ ಭಾಷೆಗಳು + ಸ್ವಯಂ", autoDetectLabel: "AI ಭಾಷೆಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆ ಮಾಡಿ",
    autoDetectSub: "AI ಭಾಷೆಯನ್ನು ಗುರುತಿಸುತ್ತದೆ",
  },
  Bengali: {
    operatorPortal: "অপারেটর পোর্টাল", heroTitle: "অপারেটর অভিযোগ পোর্টাল", heroSub: "নাগরিকদের পক্ষ থেকে সমস্যা নথিভুক্ত করুন",
    recordByTyping: "টাইপ করে নথিভুক্ত", recordByTypingSub: "নাগরিক যা বলেছেন তা টাইপ করুন", recordByVoice: "কণ্ঠস্বর দিয়ে নথিভুক্ত",
    recordByVoiceSub: "নাগরিককে কথা বলতে দিন — আপনি রেকর্ড করুন", trackComplaint: "অভিযোগ ট্র্যাক করুন", trackComplaintSub: "টিকিট ID দিয়ে অবস্থা পরীক্ষা করুন",
    back: "← পিছনে", citizenName: "নাগরিকের নাম (ঐচ্ছিক)", citizenPhone: "নাগরিকের ফোন (ঐচ্ছিক)",
    citizenNamePlaceholder: "যেমন Prince Kumar", citizenPhonePlaceholder: "যেমন 98765 43210", spokenLanguage: "কথ্য ভাষা",
    preAssignDept: "বিভাগ পূর্বনির্ধারণ করুন", letAIDecide: "AI সিদ্ধান্ত নিক", autoDetect: "AI স্বয়ংক্রিয় সনাক্ত",
    citizenStatement: "নাগরিকের বিবৃতি", citizenStatementPlaceholder: "নাগরিক কী জানিয়েছেন তা বর্ণনা করুন…", locationRequired: "Location নাগরিকের অবস্থান",
    locationRequiredBadge: "* প্রয়োজন", fetchingLocation: "Loading অবস্থান নেওয়া হচ্ছে…", locationCaptured: "Done",
    tapToCapture: "Location নাগরিকের অবস্থান ক্যাপচার করুন", locationMandatory: "নথিভুক্তির আগে অবস্থান আবশ্যক।", attachEvidence: "Attachment প্রমাণ সংযুক্ত করুন",
    startVoice: "Voice কণ্ঠস্বর ক্যাপচার শুরু করুন", stopVoice: "Stop ক্যাপচার বন্ধ করুন", capturingVoice: "নাগরিকের কণ্ঠস্বর রেকর্ড হচ্ছে…",
    filingRouting: "নথিভুক্ত ও রুট করা হচ্ছে…", captureToEnable: "Location নথিভুক্তি সক্ষম করতে অবস্থান ক্যাপচার করুন", fileGrievance: "নাগরিকের পক্ষে অভিযোগ দাখিল করুন",
    requiredBefore: "নথিভুক্তির আগে প্রয়োজন", statementRecorded: "নাগরিকের বিবৃতি নথিভুক্ত", locationCapturedReq: "নাগরিকের অবস্থান ক্যাপচার হয়েছে",
    grievanceFiledSuccess: "অভিযোগ সফলভাবে দাখিল হয়েছে", grievanceFiledSuccessSub: "নথিভুক্ত ও রুট করা হয়েছে। নাগরিকের আর কোনো পদক্ষেপ প্রয়োজন নেই।", ticketId: "টিকিট ID",
    filedOn: "দাখিলের তারিখ", department: "Department বিভাগ", priority: "অগ্রাধিকার",
    language: "Language ভাষা", complaintFiled: "Record দাখিলকৃত অভিযোগ", resolutionCommitted: "সমাধানের প্রতিশ্রুতি",
    copyTicketId: "Copy টিকিট ID কপি করুন", copied: "Done কপি হয়েছে!", fileAnother: "+ আরেকটি অভিযোগ দাখিল করুন",
    trackTitle: "অভিযোগ ট্র্যাক করুন", trackSub: "অবস্থা পরীক্ষা করতে টিকিট ID লিখুন", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "খোঁজা হচ্ছে…", track: "Search ট্র্যাক", enterTicketId: "টিকিট ID লিখুন।",
    ticketNotFound: "টিকিট পাওয়া যায়নি। ID পরীক্ষা করুন।", assignedTo: "Assigned নিযুক্ত", escalationChain: "Escalation এস্কেলেশন চেইন",
    statusHistory: "Copy অবস্থার ইতিহাস", languageVotes: "Votes ভাষা সনাক্তকরণ ভোট", citizenOriginalStatement: "নাগরিকের মূল বিবৃতি",
    complaintOnRecord: "Record নথিভুক্ত অভিযোগ", slaDeadline: "SLA সময়সীমা", confidence: "Search আস্থা",
    filed: "দাখিল:", recordByTypingFull: "টাইপ করে নথিভুক্ত", recordByVoiceFull: "কণ্ঠস্বর দিয়ে নথিভুক্ত",
    recordAndFile: "নাগরিকদের পক্ষ থেকে সমস্যা নথিভুক্ত করুন", allLanguages: "সমস্ত ২২টি তফসিলি ভারতীয় ভাষা + স্বয়ংক্রিয়", autoDetectLabel: "AI ভাষা স্বয়ংক্রিয়ভাবে সনাক্ত করুন",
    autoDetectSub: "AI ভাষা শনাক্ত করবে",
  },
  Marathi: {
    operatorPortal: "ऑपरेटर पोर्टल", heroTitle: "ऑपरेटर तक्रार पोर्टल", heroSub: "नागरिकांच्या वतीने समस्या नोंदवा",
    recordByTyping: "टाइप करून नोंदवा", recordByTypingSub: "नागरिकाने सांगितलेले टाइप करा", recordByVoice: "आवाजाने नोंदवा",
    recordByVoiceSub: "नागरिकाला बोलू द्या — तुम्ही रेकॉर्ड करा", trackComplaint: "तक्रार ट्रॅक करा", trackComplaintSub: "तिकीट ID ने स्थिती तपासा",
    back: "← मागे", citizenName: "नागरिकाचे नाव (पर्यायी)", citizenPhone: "नागरिकाचा फोन (पर्यायी)",
    citizenNamePlaceholder: "उदा. Prince Kumar", citizenPhonePlaceholder: "उदा. 98765 43210", spokenLanguage: "बोलली जाणारी भाषा",
    preAssignDept: "विभाग आधीच ठरवा", letAIDecide: "AI ठरवू द्या", autoDetect: "AI स्वयं ओळखा",
    citizenStatement: "नागरिकाचे निवेदन", citizenStatementPlaceholder: "नागरिकाने सांगितलेले वर्णन करा…", locationRequired: "Location नागरिकाचे स्थान",
    locationRequiredBadge: "* आवश्यक", fetchingLocation: "Loading स्थान मिळवत आहे…", locationCaptured: "Done",
    tapToCapture: "Location नागरिकाचे स्थान कॅप्चर करा", locationMandatory: "नोंदणीपूर्वी स्थान अनिवार्य आहे.", attachEvidence: "Attachment पुरावा जोडा",
    startVoice: "Voice आवाज कॅप्चर सुरू करा", stopVoice: "Stop कॅप्चर थांबवा", capturingVoice: "नागरिकाचा आवाज रेकॉर्ड होत आहे…",
    filingRouting: "नोंदवत आणि पाठवत आहे…", captureToEnable: "Location नोंदणीसाठी स्थान कॅप्चर करा", fileGrievance: "नागरिकाच्या वतीने तक्रार दाखल करा",
    requiredBefore: "नोंदणीपूर्वी आवश्यक", statementRecorded: "नागरिकाचे निवेदन नोंदवले", locationCapturedReq: "नागरिकाचे स्थान कॅप्चर झाले",
    grievanceFiledSuccess: "तक्रार यशस्वीरित्या दाखल", grievanceFiledSuccessSub: "नोंदवले आणि मार्गस्थ केले. नागरिकाला आणखी कारवाई आवश्यक नाही.", ticketId: "तिकीट ID",
    filedOn: "दाखल तारीख", department: "Department विभाग", priority: "प्राधान्य",
    language: "Language भाषा", complaintFiled: "Record दाखल तक्रार", resolutionCommitted: "निराकरण वचनबद्धता",
    copyTicketId: "Copy तिकीट ID कॉपी करा", copied: "Done कॉपी झाले!", fileAnother: "+ आणखी एक तक्रार दाखल करा",
    trackTitle: "तक्रार ट्रॅक करा", trackSub: "स्थिती तपासण्यासाठी तिकीट ID टाका", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "शोधत आहे…", track: "Search ट्रॅक", enterTicketId: "तिकीट ID टाका.",
    ticketNotFound: "तिकीट सापडले नाही. ID तपासा.", assignedTo: "Assigned नियुक्त", escalationChain: "Escalation एस्केलेशन साखळी",
    statusHistory: "Copy स्थिती इतिहास", languageVotes: "Votes भाषा ओळख मते", citizenOriginalStatement: "नागरिकाचे मूळ निवेदन",
    complaintOnRecord: "Record नोंदवलेली तक्रार", slaDeadline: "SLA अंतिम मुदत", confidence: "Search विश्वास",
    filed: "दाखल:", recordByTypingFull: "टाइप करून नोंदवा", recordByVoiceFull: "आवाजाने नोंदवा",
    recordAndFile: "नागरिकांच्या वतीने समस्या नोंदवा", allLanguages: "सर्व २२ अनुसूचित भारतीय भाषा + स्वयं", autoDetectLabel: "AI भाषा स्वयंचलितपणे ओळखा",
    autoDetectSub: "AI भाषा ओळखेल",
  },
  Odia: {
    operatorPortal: "ଅପରେଟର ପୋର୍ଟାଲ", heroTitle: "ଅପରେଟର ଅଭିଯୋଗ ପୋର୍ଟାଲ", heroSub: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ସମସ୍ୟା ଦାଖଲ କରନ୍ତୁ",
    recordByTyping: "ଟାଇପ୍ ଦ୍ୱାରା ଦାଖଲ", recordByTypingSub: "ନାଗରିକ ଯାହା ଜଣାଇଛନ୍ତି ଟାଇପ୍ କରନ୍ତୁ", recordByVoice: "ଭଏସ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordByVoiceSub: "ନାଗରିକଙ୍କୁ ବୋଲିବାକୁ ଦିଅନ୍ତୁ", trackComplaint: "ଅଭିଯୋଗ ଟ୍ରାକ୍ କରନ୍ତୁ", trackComplaintSub: "ଟିକେଟ ID ଦ୍ୱାରା ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ",
    back: "← ପଛକୁ", citizenName: "ନାଗରିକଙ୍କ ନାମ (ଐଚ୍ଛିକ)", citizenPhone: "ନାଗରିକଙ୍କ ଫୋନ୍ (ଐଚ୍ଛିକ)",
    citizenNamePlaceholder: "ଯଥା: Prince Kumar", citizenPhonePlaceholder: "ଯଥା: 98765 43210", spokenLanguage: "ବ୍ୟବହୃତ ଭାଷା",
    preAssignDept: "ବିଭାଗ ପୂର୍ବ ନିର୍ଦ୍ଧାରଣ", letAIDecide: "AI ସ୍ଥିର କରୁ", autoDetect: "AI ସ୍ୱୟଂ ଚିହ୍ନଟ",
    citizenStatement: "ନାଗରିକଙ୍କ ବିବୃତ୍ତି", citizenStatementPlaceholder: "ନାଗରିକ ଯାହା ଜଣାଇଛନ୍ତି ବର୍ଣ୍ଣନା କରନ୍ତୁ…", locationRequired: "Location ନାଗରିକଙ୍କ ଅବସ୍ଥାନ",
    locationRequiredBadge: "* ଆବଶ୍ୟକ", fetchingLocation: "Loading ଅବସ୍ଥାନ ଆଣୁଛି…", locationCaptured: "Done",
    tapToCapture: "Location ନାଗରିକଙ୍କ ଅବସ୍ଥାନ ଗ୍ରହଣ କରନ୍ତୁ", locationMandatory: "ଦାଖଲ ପୂର୍ବରୁ ଅବସ୍ଥାନ ବାଧ୍ୟତାମୂଳକ।", attachEvidence: "Attachment ସାକ୍ଷ୍ୟ ସଂଲଗ୍ନ କରନ୍ତୁ",
    startVoice: "Voice ଭଏସ୍ ଗ୍ରହଣ ଆରମ୍ଭ", stopVoice: "Stop ଗ୍ରହଣ ବନ୍ଦ", capturingVoice: "ନାଗରିକଙ୍କ ଭଏସ୍ ରେକର୍ଡ ହେଉଛି…",
    filingRouting: "ଦାଖଲ ହେଉଛି…", captureToEnable: "Location ଦାଖଲ ପାଇଁ ଅବସ୍ଥାନ ଗ୍ରହଣ କରନ୍ତୁ", fileGrievance: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ଅଭିଯୋଗ ଦାଖଲ",
    requiredBefore: "ଦାଖଲ ପୂର୍ବରୁ ଆବଶ୍ୟକ", statementRecorded: "ନାଗରିକଙ୍କ ବିବୃତ୍ତି ଦାଖଲ", locationCapturedReq: "ଅବସ୍ଥାନ ଗ୍ରହଣ ହୋଇଛି",
    grievanceFiledSuccess: "ଅଭିଯୋଗ ସଫଳତାର ସହ ଦାଖଲ", grievanceFiledSuccessSub: "ଦାଖଲ ଓ ରୁଟ୍ ହୋଇଛି। ନାଗରିକଙ୍କ ଆଉ କ୍ରିୟା ଆବଶ୍ୟକ ନୁହେଁ।", ticketId: "ଟିକେଟ ID",
    filedOn: "ଦାଖଲ ତାରିଖ", department: "Department ବିଭାଗ", priority: "ଅଗ୍ରାଧିକାର",
    language: "Language ଭାଷା", complaintFiled: "Record ଦାଖଲ ଅଭିଯୋଗ", resolutionCommitted: "ସମାଧାନ ପ୍ରତିଶ୍ରୁତି",
    copyTicketId: "Copy ଟିକେଟ ID ନକଲ", copied: "Done ନକଲ ହୋଇଛି!", fileAnother: "+ ଆଉ ଏକ ଅଭିଯୋଗ ଦାଖଲ",
    trackTitle: "ଅଭିଯୋଗ ଟ୍ରାକ୍", trackSub: "ଟିକେଟ ID ଦ୍ୱାରା ସ୍ଥିତି ଯାଞ୍ଚ", ticketPlaceholder: "JV-XXXXXXXX",
    searching: "ଖୋଜୁଛି…", track: "Search ଟ୍ରାକ୍", enterTicketId: "ଟିକେଟ ID ଦିଅନ୍ତୁ।",
    ticketNotFound: "ଟିକେଟ ମିଳିଲାନି। ID ଯାଞ୍ଚ କରନ୍ତୁ।", assignedTo: "Assigned ନ୍ୟସ୍ତ", escalationChain: "Escalation ଏସ୍କାଲେଶନ ଚେନ",
    statusHistory: "Copy ସ୍ଥିତି ଇତିହାସ", languageVotes: "Votes ଭାଷା ଚିହ୍ନଟ ଭୋଟ", citizenOriginalStatement: "ନାଗରିକଙ୍କ ମୂଳ ବିବୃତ୍ତି",
    complaintOnRecord: "Record ଦାଖଲ ଅଭିଯୋଗ", slaDeadline: "SLA ସୀମା", confidence: "Search ବିଶ୍ୱାସ",
    filed: "ଦାଖଲ:", recordByTypingFull: "ଟାଇପ୍ ଦ୍ୱାରା ଦାଖଲ", recordByVoiceFull: "ଭଏସ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordAndFile: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ଅଭିଯୋଗ ଦାଖଲ", allLanguages: "ସମସ୍ତ ୨୨ ଅନୁସୂଚିତ ଭାରତୀୟ ଭାଷା + ସ୍ୱୟଂ", autoDetectLabel: "AI ଭାଷା ସ୍ୱୟଂ ଚିହ୍ନଟ",
    autoDetectSub: "AI ଭାଷା ଚିହ୍ନଟ କରିବ",
  },
};
const t = (lang, key) => {
  const langStrings = UI_STRINGS[lang] || UI_STRINGS["English"];
  return langStrings[key] || UI_STRINGS["English"][key] || key;
};
const ALL_LANGS = [
  { code: "English",   label: "English",      script: "Latin"      },
  { code: "Hindi",     label: "हिंदी",         script: "Devanagari", bcp47: "hi-IN" },
  { code: "Telugu",    label: "తెలుగు",         script: "Telugu",     bcp47: "te-IN" },
  { code: "Tamil",     label: "தமிழ்",          script: "Tamil",      bcp47: "ta-IN" },
  { code: "Kannada",   label: "ಕನ್ನಡ",          script: "Kannada",    bcp47: "kn-IN" },
  { code: "Malayalam", label: "മലയാളം",        script: "Malayalam",  bcp47: "ml-IN" },
  { code: "Bengali",   label: "বাংলা",          script: "Bengali",    bcp47: "bn-IN" },
  { code: "Marathi",   label: "मराठी",          script: "Devanagari", bcp47: "mr-IN" },
  { code: "Gujarati",  label: "ગુજરાતી",        script: "Gujarati",   bcp47: "gu-IN" },
  { code: "Punjabi",   label: "ਪੰਜਾਬੀ",         script: "Gurmukhi",   bcp47: "pa-IN" },
  { code: "Odia",      label: "ଓଡ଼ିଆ",           script: "Odia",       bcp47: "or-IN" },
  { code: "Urdu",      label: "اردو",           script: "Nastaliq",   bcp47: "ur-IN" },
  { code: "Assamese",  label: "অসমীয়া",        script: "Bengali",    bcp47: "as-IN" },
  { code: "Maithili",  label: "मैथिली",         script: "Devanagari", bcp47: "mai"   },
  { code: "Santali",   label: "ᱥᱟᱱᱛᱟᱲᱤ",       script: "Ol Chiki",   bcp47: "sat"   },
  { code: "Kashmiri",  label: "کٲشُر",          script: "Nastaliq",   bcp47: "ks-IN" },
  { code: "Nepali",    label: "नेपाली",          script: "Devanagari", bcp47: "ne-IN" },
  { code: "Sindhi",    label: "سنڌي",           script: "Nastaliq",   bcp47: "sd"    },
  { code: "Dogri",     label: "डोगरी",          script: "Devanagari", bcp47: "doi"   },
  { code: "Konkani",   label: "कोंकणी",         script: "Devanagari", bcp47: "kok"   },
  { code: "Manipuri",  label: "মৈতৈলোন্",       script: "Meitei",     bcp47: "mni"   },
  { code: "Bodo",      label: "बड़ो",            script: "Devanagari", bcp47: "brx"   },
  { code: "Sanskrit",  label: "संस्कृतम्",      script: "Devanagari", bcp47: "sa"    },
];
const detectLangFromScript = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  if (/[\u0C00-\u0C7F]/.test(text)) return "Telugu";
  if (/[\u0B80-\u0BFF]/.test(text)) return "Tamil";
  if (/[\u0C80-\u0CFF]/.test(text)) return "Kannada";
  if (/[\u0D00-\u0D7F]/.test(text)) return "Malayalam";
  if (/[\u0980-\u09FF]/.test(text)) return "Bengali";
  if (/[\u0A80-\u0AFF]/.test(text)) return "Gujarati";
  if (/[\u0A00-\u0A7F]/.test(text)) return "Punjabi";
  if (/[\u0B00-\u0B7F]/.test(text)) return "Odia";
  if (/[\u0600-\u06FF]/.test(text)) return "Urdu";
  if (/[\u1C50-\u1C7F]/.test(text)) return "Santali";
  return "English";
};
const UI_SWITCHER_LANGS = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Bengali", "Marathi", "Odia"];
const JANVAANI_TITLES = ["JANVAANI", "जनवाणी", "జనవాణి", "ஜன்வாணி", "ಜನವಾಣಿ", "জনবাণী", "ଜନବାଣୀ", "जनवाणी"];
const DEPT_KEYS = [
  "Water Supply & Sanitation", "Electricity & Power", "Roads & Infrastructure",
  "Public Health & Hospitals", "Police & Law Enforcement", "Municipal Solid Waste",
  "Education", "Revenue & Land Records", "Transport & Traffic", "General Administration",
];
const getSeverityStyle = (s = "") => {
  const u = s.toUpperCase();
  if (u === "CRITICAL") return { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", border: "#ef4444" };
  if (u === "HIGH")     return { bg: "rgba(249,115,22,0.12)", color: "#f97316", border: "#f97316" };
  if (u === "MEDIUM")   return { bg: "rgba(234,179,8,0.12)",  color: "#eab308", border: "#eab308" };
  return                       { bg: "rgba(34,197,94,0.12)",  color: "#22c55e", border: "#22c55e" };
};
const STATUS_STYLES = {
  OPEN        : { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)"  },
  IN_PROGRESS : { color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  },
  RESOLVED    : { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
  ESCALATED   : { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   },
  CLOSED      : { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)" },
};
const getDefaultApiBase = () => {
  if (typeof window === "undefined") return "http://127.0.0.1:4000";
  return `${window.location.protocol}//${window.location.hostname}:4000`;
};
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || getDefaultApiBase()).replace(/\/+$/, "");
const ADMIN_PANEL_URL = process.env.REACT_APP_ADMIN_URL || `${API_BASE_URL}/admin`;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = ["image/", "video/", "audio/", "application/pdf"];
const fetchWithTimeout = async (resource, options = {}, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};
const StaticBackground = memo(function StaticBackground() {
  return (
    <>
      <div className="bg-layer bg-base" />
      <div className="bg-layer bg-triband" />
      <div className="bg-aurora" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-layer bg-grid" />
      <div className="bg-layer bg-depth" />
      <div className="bg-vignette" />
      <div className="bg-tribot" />
    </>
  );
});
export default function App() {
  const langPickerRef   = useRef(null);
  const deptPickerRef   = useRef(null);
  const recognitionRef  = useRef(null);
  const finalTranscript = useRef("");
  const isListeningRef  = useRef(false);
  const audioCtxRef     = useRef(null);
  const analyserRef     = useRef(null);
  const mediaStreamRef  = useRef(null);
  const animFrameRef    = useRef(null);
  const recTimerRef     = useRef(null);
  const [mode,           setMode]           = useState("none");
  const [uiLang,         setUiLang]         = useState("English");
  const [titleIdx,       setTitleIdx]       = useState(0);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isDeptOpen,     setIsDeptOpen]     = useState(false);
  const [citizenStatement, setCitizenStatement] = useState("");
  const [citizenName,      setCitizenName]      = useState("");
  const [citizenPhone,     setCitizenPhone]     = useState("");
  const [spokenLang,       setSpokenLang]       = useState("AUTO");
  const [department,       setDepartment]       = useState("Auto");
  const [location,         setLocation]         = useState(null);
  const [locationLabel,    setLocationLabel]    = useState(null);
  const [isFetchingLoc,    setIsFetchingLoc]    = useState(false);
  const [attachment,       setAttachment]       = useState(null);
  const [listening,   setListening]   = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceError,  setVoiceError]  = useState("");
  const [waveformData, setWaveformData] = useState(new Array(32).fill(0));
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [avgVolume,     setAvgVolume]     = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result,      setResult]      = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [trackId,     setTrackId]     = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading,setTrackLoading]= useState(false);
  const [trackError,  setTrackError]  = useState("");
  useEffect(() => {
    const id = setInterval(() => setTitleIdx(p => (p + 1) % JANVAANI_TITLES.length), 12000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!showLangPicker) return;
    const closeOnOutsideClick = (e) => { if (langPickerRef.current && !langPickerRef.current.contains(e.target)) setShowLangPicker(false); };
    const closeOnEscape = (e) => { if (e.key === "Escape") setShowLangPicker(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, [showLangPicker]);
  useEffect(() => {
    if (!isDeptOpen) return;
    const closeOnOutsideClick = (e) => { if (deptPickerRef.current && !deptPickerRef.current.contains(e.target)) setIsDeptOpen(false); };
    const closeOnEscape = (e) => { if (e.key === "Escape") setIsDeptOpen(false); };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, [isDeptOpen]);
  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) { alert("Location is not supported by your browser."); return; }
    setIsFetchingLoc(true);
    let resolved = false;
    const done = () => { resolved = true; };
    const fallbackToIP = async () => {
      try {
        const r = await fetchWithTimeout("https://ipapi.co/json/", {}, 6000);
        if (!r.ok) throw new Error("IP lookup failed");
        const d = await r.json();
        if (d.latitude && d.longitude) {
          const lat = Number(d.latitude).toFixed(5), lng = Number(d.longitude).toFixed(5);
          setLocation(`${lat},${lng}`);
          const parts = [d.city, d.region].filter(Boolean);
          setLocationLabel(parts.length ? parts.join(", ") + " (approx)" : `${lat}, ${lng}`);
        } else throw new Error("No coords");
      } catch {
        alert("Could not determine location. Please check your browser and OS location settings, then try again.");
      } finally { setIsFetchingLoc(false); }
    };
    const safetyTimer = setTimeout(() => {
      if (!resolved) { done(); fallbackToIP(); }
    }, 15000);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      if (resolved) return;
      done(); clearTimeout(safetyTimer);
      const lat = pos.coords.latitude.toFixed(5), lng = pos.coords.longitude.toFixed(5);
      setLocation(`${lat},${lng}`);
      setLocationLabel("Resolving area…");
      setIsFetchingLoc(false);
      try {
        const r = await fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`, { headers: { "User-Agent": "JanVaani_App_v1" } }, 6000);
        if (!r.ok) throw new Error("Reverse geocoding failed");
        const d = await r.json(), a = d.address || {};
        const area = a.suburb || a.neighbourhood || a.village || a.town || a.city || a.county || a.state_district || "";
        const city = a.city || a.town || a.village || a.state_district || "";
        const state = a.state || "";
        const parts = [area, city !== area ? city : "", state].filter(Boolean);
        setLocationLabel(parts.length ? parts.join(", ") : `${lat}, ${lng}`);
      } catch { setLocationLabel(`${lat}, ${lng}`); }
    }, (error) => {
      if (resolved) return;
      done(); clearTimeout(safetyTimer);
      if (error.code === 1) {
        alert("Location permission denied. Please allow it in your browser.");
        setIsFetchingLoc(false);
      } else {
        fallbackToIP();
      }
    }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 120000 });
  };
  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.85; analyserRef.current = analyser;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const bufLen = analyser.frequencyBinCount, dataArr = new Uint8Array(bufLen);
      let lastUpdate = 0;
      const update = (timestamp) => {
        if (!isListeningRef.current) return;
        if (timestamp - lastUpdate < 33) { animFrameRef.current = requestAnimationFrame(update); return; }
        lastUpdate = timestamp;
        analyser.getByteFrequencyData(dataArr);
        const bars = 32, sliceW = Math.floor(bufLen / bars), levels = []; let totalVol = 0;
        for (let i = 0; i < bars; i++) { let sum = 0; for (let j = 0; j < sliceW; j++) sum += dataArr[i * sliceW + j]; const avg = sum / sliceW / 255; levels.push(avg); totalVol += avg; }
        setWaveformData(levels); setAvgVolume(totalVol / bars);
        animFrameRef.current = requestAnimationFrame(update);
      };
      animFrameRef.current = requestAnimationFrame(update);
    } catch (err) { console.warn("Audio visualization unavailable:", err.message); }
  }, []);
  const stopAudioVisualization = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    analyserRef.current = null;
    setWaveformData(new Array(32).fill(0)); setAvgVolume(0);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
    setRecordingSecs(0);
  }, []);
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setListening(false); setInterimText("");
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    stopAudioVisualization();
  }, [stopAudioVisualization]);
  const startListening = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError("Speech recognition not supported. Please use Google Chrome."); return; }
    setVoiceError(""); isListeningRef.current = true;
    finalTranscript.current = citizenStatement;
    await startAudioVisualization();
    setRecordingSecs(0);
    recTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
    const createRec = () => {
      if (!isListeningRef.current) return;
      const rec = new SR();
      recognitionRef.current = rec;
      const langObj = spokenLang === "AUTO" ? null : ALL_LANGS.find(l => l.code === spokenLang);
      rec.lang = langObj?.bcp47 || "en-IN";
      rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 3;
      rec.onstart = () => setListening(true);
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) finalTranscript.current += e.results[i][0].transcript + " "; else interim += e.results[i][0].transcript; }
        setCitizenStatement(finalTranscript.current + interim); setInterimText(interim);
      };
      rec.onerror = (e) => {
        const retry = (ms) => setTimeout(() => { if (isListeningRef.current) try { createRec(); } catch {} }, ms);
        if (e.error === "no-speech") { if (isListeningRef.current) retry(200); }
        else if (e.error === "network") { setVoiceError("Network error. Speech recognition requires an internet connection in most browsers."); stopListening(); }
        else if (e.error === "not-allowed" || e.error === "service-not-allowed") { setVoiceError("Microphone permission denied."); stopListening(); }
        else if (e.error === "audio-capture") { setVoiceError("No microphone found."); stopListening(); }
        else if (e.error !== "aborted") { if (isListeningRef.current) retry(500); }
      };
      rec.onend = () => { setInterimText(""); if (isListeningRef.current) setTimeout(() => { if (isListeningRef.current) try { createRec(); } catch {} }, 100); };
      try { rec.start(); } catch { setVoiceError("Could not start microphone. Try again."); stopListening(); }
    };
    createRec();
  }, [spokenLang, citizenStatement, startAudioVisualization, stopAudioVisualization]);
  useEffect(() => { return () => { stopListening(); stopAudioVisualization(); }; }, [stopListening, stopAudioVisualization]);
  const fileGrievance = async () => {
    if (!citizenStatement.trim()) return;
    setIsAnalyzing(true); setResult(null);
    try {
      let evidenceBase64 = null;
      if (attachment) {
        evidenceBase64 = await new Promise((res, rej) => { const fr = new FileReader(); fr.readAsDataURL(attachment); fr.onload = () => res(fr.result); fr.onerror = rej; });
      }
      const resp = await fetchWithTimeout(`${API_BASE_URL}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: citizenStatement, location, evidence: evidenceBase64, citizenName, citizenPhone, operatorMode: true }) }, 25000);
      const ct = resp.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error(`Backend response invalid. Verify server at ${API_BASE_URL}.`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Server error ${resp.status}`);
      setResult(data);
    } catch (err) { alert(`Error: ${err.name === "AbortError" ? "Request timed out. Please try again." : err.message}`); }
    finally { setIsAnalyzing(false); }
  };
  const trackComplaint = async () => {
    const id = trackId.trim().toUpperCase();
    if (!id) { setTrackError(t(uiLang, "enterTicketId")); return; }
    setTrackLoading(true); setTrackResult(null); setTrackError("");
    try {
      const resp = await fetchWithTimeout(`${API_BASE_URL}/tickets/${id}`, {}, 15000);
      if (resp.status === 404) { setTrackError(`${t(uiLang, "ticketNotFound")}: "${id}"`); setTrackLoading(false); return; }
      const ct = resp.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error(`Backend response invalid. Verify server at ${API_BASE_URL}.`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Server error");
      setTrackResult(data);
    } catch (err) { setTrackError(`Error: ${err.name === "AbortError" ? "Request timed out. Please retry." : err.message}`); }
    finally { setTrackLoading(false); }
  };
  const reset = () => {
    setMode("none");
    setCitizenStatement(""); setCitizenName(""); setCitizenPhone("");
    setSpokenLang("AUTO"); setDepartment("Auto");
    setLocation(null); setLocationLabel(null); setAttachment(null);
    setResult(null); setCopied(false);
    setVoiceError(""); setInterimText("");
    finalTranscript.current = "";
    stopListening();
    stopAudioVisualization();
  };
  const detectedScriptLang = useMemo(() => citizenStatement ? detectLangFromScript(citizenStatement) : null, [citizenStatement]);
  const renderResult = () => {
    if (!result) return null;
    const sev = getSeverityStyle(result.severity);
    return (
      <div style={S.resultCard}>
        <div style={{ position:"absolute", top:"-20px", left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(34,197,94,0.1)", border:"2px solid rgba(34,197,94,0.3)", display:"flex", alignItems:"center", justifyContent:"center", animation:"successScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}><CheckCircle2 size={36} color="#22c55e" strokeWidth={2} /></div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderRadius:12, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", marginBottom:20, animation:"fadeUp 0.5s ease 0.2s forwards", opacity:0 }}>
          <div style={{ animation:"fadeIn 0.6s ease 0.3s forwards", display:"flex", alignItems:"center" }}><CheckCircle2 size={28} color="#22c55e" /></div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#22c55e", marginBottom:2 }}>{t(uiLang,"grievanceFiledSuccess")}</div>
            <div style={{ fontSize:12, color:"#64748b" }}>{t(uiLang,"grievanceFiledSuccessSub")}</div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:11, color:"#475569", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t(uiLang,"ticketId")}</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#38bdf8", letterSpacing:2, background:"linear-gradient(90deg, #38bdf8, #7dd3fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{result.ticketId}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#475569", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{t(uiLang,"filedOn")}</div>
            <div style={{ fontSize:13, color:"#94a3b8" }}>{result.timestamp}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          <div style={{ ...S.infoCell, flex:2, background:"linear-gradient(135deg, rgba(56,189,248,0.08), rgba(56,189,248,0.02))", borderTop:"2px solid rgba(56,189,248,0.3)" }}>
            <div style={S.infoLbl}>{t(uiLang,"department")}</div>
            <div style={{ ...S.infoVal, color:"#38bdf8" }}>{result.officialDeptName || result.department}</div>
          </div>
          <div style={{ ...S.infoCell, flex:1, textAlign:"center", background:"linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))", borderTop:"2px solid rgba(34,197,94,0.3)" }}>
            <div style={S.infoLbl}>{t(uiLang,"priority")}</div>
            <div style={{ fontSize:15, fontWeight:900, color:sev.color, marginTop:4 }}>{result.severity}</div>
          </div>
          <div style={{ ...S.infoCell, flex:1, textAlign:"center", background:"linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))", borderTop:"2px solid rgba(168,85,247,0.3)" }}>
            <div style={S.infoLbl}>{t(uiLang,"language")}</div>
            <div style={{ ...S.infoVal, fontSize:13 }}>{result.detectedLanguage}</div>
          </div>
        </div>
        {result.formalGrievanceText && (
          <div style={{ ...S.block, background:"linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.5))", borderLeft:"3px solid #38bdf8" }}>
            <div style={S.blockLbl}>{t(uiLang,"complaintFiled")}</div>
            <div style={{ ...S.blockVal, fontSize:14, color:"#e2e8f0", lineHeight:1.8 }}>{result.formalGrievanceText}</div>
          </div>
        )}
        {result.slaDeadline && (
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:10, background:"linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))", border:"1px solid rgba(239,68,68,0.15)", marginBottom:16, borderLeft:"3px solid rgba(239,68,68,0.6)" }}>
            <Timer size={22} color="#ef4444" />
            <div>
              <div style={{ fontSize:12, color:"#ef4444", fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>{t(uiLang,"resolutionCommitted")}</div>
              <div style={{ fontSize:14, color:"#fca5a5", fontWeight:600 }}>{result.slaDeadline}</div>
            </div>
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize:11, color:"#334155" }}>Processing Time: {result.processingTimeSeconds}s · {result.detectedLanguage} detected</span>
          <button onClick={() => { navigator.clipboard.writeText(result.ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{...S.copyBtn, background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", color: copied ? "#4ade80" : "#64748b", transition:"all 0.3s" }}>
            {copied ? <><Check size={14} style={{marginRight:4}} /> {t(uiLang,"copied")}</> : <><Copy size={14} style={{marginRight:4}} /> {t(uiLang,"copyTicketId")}</>}
          </button>
        </div>
      </div>
    );
  };
  const renderTrackResult = () => {
    if (!trackResult) return null;
    const sev    = getSeverityStyle(trackResult.severity);
    const stSty  = STATUS_STYLES[trackResult.sla_status] || STATUS_STYLES.OPEN;
    const chain  = Array.isArray(trackResult.escalation_chain) ? trackResult.escalation_chain : [];
    const history= trackResult.statusHistory || [];
    const votes  = trackResult.languageVotes  || [];
    return (
      <div style={S.resultCard}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontSize:11, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{t(uiLang,"ticketId")}</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#38bdf8", letterSpacing:2 }}>{trackResult.ticket_id}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:4 }}>{t(uiLang,"filed")} {trackResult.created_at_ist}</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
            <span style={{ fontSize:13, fontWeight:800, padding:"6px 14px", borderRadius:100, background:stSty.bg, color:stSty.color, border:`1px solid ${stSty.border}` }}>● {trackResult.sla_status}</span>
            <span style={{ fontSize:12, fontWeight:800, padding:"4px 12px", borderRadius:100, background:sev.bg, color:sev.color, border:`1px solid ${sev.border}` }}>{trackResult.severity}</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          <div style={{ ...S.infoCell, flex:2 }}>
            <div style={S.infoLbl}>{t(uiLang,"department")}</div>
            <div style={{ ...S.infoVal, color:"#38bdf8", fontSize:13 }}>{trackResult.official_dept_name || trackResult.department}</div>
          </div>
          <div style={{ ...S.infoCell, flex:1 }}>
            <div style={S.infoLbl}>{t(uiLang,"language")}</div>
            <div style={S.infoVal}>{trackResult.detected_language}</div>
          </div>
          <div style={{ ...S.infoCell, flex:1 }}>
            <div style={S.infoLbl}>{t(uiLang,"confidence")}</div>
            <div style={S.infoVal}>{trackResult.language_confidence}%</div>
          </div>
        </div>
        {(trackResult.citizen_name || trackResult.citizen_phone || trackResult.full_address) && (
          <div style={{ ...S.block, display:"flex", gap:24, flexWrap:"wrap" }}>
            {trackResult.citizen_name  && <div><div style={S.blockLbl}>Citizen Name</div><div style={{ ...S.blockVal, fontWeight:700 }}>{trackResult.citizen_name}</div></div>}
            {trackResult.citizen_phone && <div><div style={S.blockLbl}>Phone Phone</div><div style={{ ...S.blockVal, fontWeight:700 }}>{trackResult.citizen_phone}</div></div>}
            {trackResult.full_address  && <div style={{ flex:1 }}><div style={S.blockLbl}>Location</div><div style={{ ...S.blockVal, color:"#38bdf8", fontSize:12 }}>{trackResult.full_address}</div></div>}
          </div>
        )}
        {trackResult.sla_deadline && (
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.15)", marginBottom:14 }}>
            <Timer size={20} color="#ef4444" />
            <div>
              <div style={{ fontSize:10, color:"#ef4444", fontWeight:800, textTransform:"uppercase", letterSpacing:1 }}>{t(uiLang,"slaDeadline")}</div>
              <div style={{ fontSize:13, color:"#fca5a5", fontWeight:600, marginTop:2 }}>{trackResult.sla_deadline}</div>
            </div>
          </div>
        )}
        {trackResult.raw_text && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang,"citizenOriginalStatement")}</div>
            <div style={{ ...S.blockVal, fontSize:13, lineHeight:1.7, fontStyle:"italic", color:"#94a3b8", padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>"{trackResult.raw_text}"</div>
          </div>
        )}
        {trackResult.formal_grievance && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang,"complaintOnRecord")}</div>
            <div style={{ ...S.blockVal, fontSize:13, lineHeight:1.7 }}>{trackResult.formal_grievance}</div>
          </div>
        )}
        {trackResult.nodal_officer && (
          <div style={{ ...S.block, background:"rgba(249,115,22,0.05)", borderLeft:"3px solid #f97316" }}>
            <div style={{ ...S.blockLbl, color:"#f97316" }}>{t(uiLang,"assignedTo")}</div>
            <div style={{ ...S.blockVal, color:"#fdba74" }}>{trackResult.nodal_officer}</div>
          </div>
        )}
        {chain.length > 0 && (
          <div style={{ ...S.block, marginBottom:14 }}>
            <div style={S.blockLbl}>{t(uiLang,"escalationChain")}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
              {chain.map((level, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:100, background: i===0 ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${i===0 ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`, color: i===0 ? "#38bdf8" : "#64748b", fontWeight: i===0 ? 700 : 400 }}>{level}</span>
                  {i < chain.length - 1 && <span style={{ color:"#334155", fontSize:12 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang,"statusHistory")}</div>
            <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:0 }}>
              {history.map((h, i) => {
                const hs = STATUS_STYLES[h.status] || STATUS_STYLES.OPEN;
                return (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom: i < history.length-1 ? 14 : 0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:hs.color, boxShadow:`0 0 6px ${hs.color}`, marginTop:3 }} />
                      {i < history.length-1 && <div style={{ width:1, flex:1, background:"rgba(255,255,255,0.07)", minHeight:20, marginTop:4 }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                        <span style={{ fontSize:11, fontWeight:800, color:hs.color, padding:"2px 8px", borderRadius:100, background:hs.bg, border:`1px solid ${hs.border}` }}>{h.status}</span>
                        <span style={{ fontSize:11, color:"#475569" }}>{new Date(h.updated_at).toLocaleString("en-IN")}</span>
                      </div>
                      {h.note && <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{h.note}</div>}
                      <div style={{ fontSize:11, color:"#334155", marginTop:2 }}>by {h.updated_by}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {votes.length > 0 && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang,"languageVotes")}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
              {votes.map((v, i) => (
                <div key={i} style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#94a3b8" }}>
                  {v.layer.split("-").slice(1).join("-")} → <span style={{ color:"#e2e8f0", fontWeight:600 }}>{v.voted_lang}</span> ({v.confidence}%)
                </div>
              ))}
            </div>
          </div>
        )}
              <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.06)", fontSize:11, color:"#334155", display:"flex", alignItems:"center", gap:6 }}>
                <Globe2 size={12} /> Portal: {trackResult.portal_to_log || "—"} · Act: {trackResult.reference_act || "—"}
        </div>
      </div>
    );
  };
  const renderLangPicker = () => (
    <div
      style={{ position:"absolute", top:"110%", left:0, right:0, zIndex:1000, background:"rgba(10,16,32,0.98)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:12, backdropFilter:"blur(20px)", boxShadow:"0 20px 40px rgba(0,0,0,0.6)", pointerEvents:"all" }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{ fontSize:11, color:"#475569", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:10, padding:"0 4px" }}>{t(uiLang,"allLanguages")}</div>
      <button
        className={`lang-option ${spokenLang === "AUTO" ? "active" : ""}`}
        style={{ width:"100%", marginBottom:8, background: spokenLang==="AUTO" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.04)", borderColor: spokenLang==="AUTO" ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.2)" }}
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setSpokenLang("AUTO"); setShowLangPicker(false); }}
      >
        <div style={{ fontWeight:700, color: spokenLang==="AUTO" ? "#818cf8" : "#94a3b8" }}>{t(uiLang,"autoDetectLabel")}</div>
        <div style={{ fontSize:10, color:"#475569" }}>{t(uiLang,"autoDetectSub")}</div>
      </button>
      <div className="lang-grid">
        {ALL_LANGS.map(l => (
          <button
            key={l.code}
            className={`lang-option ${spokenLang === l.code ? "active" : ""}`}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setSpokenLang(l.code); setShowLangPicker(false); }}
          >
            <div style={{ fontWeight:600, marginBottom:2 }}>{l.label}</div>
            <div style={{ fontSize:10, color:"#475569" }}>{l.code !== "English" ? l.code : ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
  const renderDeptPicker = () => (
    <div
      style={{ position:"absolute", top:"110%", left:0, right:0, zIndex:1000, background:"rgba(10,16,32,0.98)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:12, backdropFilter:"blur(20px)", boxShadow:"0 20px 40px rgba(0,0,0,0.6)", pointerEvents:"all" }}
      onMouseDown={e => e.stopPropagation()}
    >
      <div style={{ fontSize:11, color:"#475569", fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:10, padding:"0 4px", display:"flex", alignItems:"center", gap:6 }}>
        <Landmark size={12} color="#475569" /> {t(uiLang,"preAssignDept")}
      </div>
      {/* AI Decide — special option */}
      <button
        className={`lang-option ${department === "Auto" ? "active" : ""}`}
        style={{ width:"100%", marginBottom:8, background: department==="Auto" ? "rgba(56,189,248,0.12)" : "rgba(56,189,248,0.04)", borderColor: department==="Auto" ? "rgba(56,189,248,0.5)" : "rgba(56,189,248,0.15)" }}
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setDepartment("Auto"); setIsDeptOpen(false); }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Brain size={14} color={department==="Auto" ? "#38bdf8" : "#64748b"} />
          <div>
            <div style={{ fontWeight:700, color: department==="Auto" ? "#38bdf8" : "#94a3b8", fontSize:13 }}>{t(uiLang,"letAIDecide")}</div>
            <div style={{ fontSize:10, color:"#475569" }}>Auto-route based on complaint content</div>
          </div>
        </div>
      </button>
      {/* Department list — 2-col grid matching lang-grid */}
      <div className="lang-grid" style={{ gridTemplateColumns:"repeat(2,1fr)" }}>
        {DEPT_KEYS.map(d => (
          <button
            key={d}
            className={`lang-option ${department === d ? "active" : ""}`}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setDepartment(d); setIsDeptOpen(false); }}
          >
            <div style={{ fontWeight:600, fontSize:12, lineHeight:1.4 }}>{d}</div>
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Merriweather:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020617; font-family: 'Manrope', sans-serif; overflow-x:hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; scroll-behavior: smooth; }
        :root { --accent-cyan: #38bdf8; --accent-indigo: #818cf8; --accent-emerald: #22c55e; --glass-dark: rgba(9, 18, 34, 0.68); --glass-line: rgba(148, 163, 184, 0.18); --neon-cyan: 0 0 20px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.1); --neon-indigo: 0 0 20px rgba(129,140,248,0.4), 0 0 60px rgba(129,140,248,0.1); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(2,6,23,0.5); }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #38bdf8, #818cf8); border-radius: 10px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes titleFade { 0%{opacity:0;transform:translateY(6px) scale(0.97);} 10%{opacity:1;transform:translateY(0) scale(1);} 90%{opacity:1;transform:translateY(0) scale(1);} 100%{opacity:0;transform:translateY(-4px) scale(0.98);} }
        @keyframes arrowNudge { 0%,100%{transform:translateX(0);} 50%{transform:translateX(4px);} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.6);} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0);} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:0.8;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes micPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.5;} 50%{transform:translateY(-5px);opacity:0.9;} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(56,189,248,0.2);} 50%{box-shadow:0 0 60px rgba(56,189,248,0.5);} }
        @keyframes voiceRipple { 0%{transform:scale(0.9);opacity:0.5;} 100%{transform:scale(1.8);opacity:0;} }
        @keyframes successScale { 0% { transform: scale(0) rotate(-30deg); } 50% { transform: scale(1.2) rotate(5deg); } 100% { transform: scale(1) rotate(0); } }
        @keyframes checkmark { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
        @keyframes locPulse { 0%,100%{border-color:rgba(239,68,68,0.4);} 50%{border-color:rgba(239,68,68,0.8);} }
        @keyframes auroraShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(60px, -40px) scale(1.1); } 50% { transform: translate(-30px, -80px) scale(0.95); } 75% { transform: translate(-60px, 20px) scale(1.05); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(-50px, 50px) scale(1.08); } 50% { transform: translate(40px, 70px) scale(0.9); } 75% { transform: translate(70px, -30px) scale(1.12); } }
        @keyframes orbFloat3 { 0%,100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-40px, -60px) scale(1.15); } 66% { transform: translate(50px, 30px) scale(0.92); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes borderGlow { 0%,100% { border-color: rgba(56,189,248,0.2); box-shadow: 0 0 20px rgba(56,189,248,0.05); } 50% { border-color: rgba(56,189,248,0.5); box-shadow: 0 0 40px rgba(56,189,248,0.15); } }
        @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
        @keyframes fieldReveal { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes nodePulse { 0%,100%{box-shadow:0 0 20px rgba(56,189,248,0.15);} 50%{box-shadow:0 0 40px rgba(56,189,248,0.35);} }
        @keyframes ringSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes textGlow { 0%,100% { text-shadow: 0 0 20px rgba(56,189,248,0.3); } 50% { text-shadow: 0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(56,189,248,0.2); } }
        @keyframes cardShine { 0% { left: -100%; } 50%,100% { left: 150%; } }
        @keyframes scaleIn { 0% { opacity:0; transform:scale(0.8); } 100% { opacity:1; transform:scale(1); } }
        @keyframes slideUp { 0% { opacity:0; transform:translateY(30px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes morphBlob { 0%,100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; } 25% { border-radius: 73% 27% 26% 74% / 54% 43% 57% 46%; } 50% { border-radius: 28% 72% 44% 56% / 49% 40% 60% 51%; } 75% { border-radius: 40% 60% 67% 33% / 37% 65% 35% 63%; } }
        @keyframes pulseGlow { 0%,100% { opacity: 0.4; filter: blur(60px); } 50% { opacity: 0.7; filter: blur(80px); } }
        @keyframes statCount { from { opacity:0; transform:translateY(10px) scale(0.5); } to { opacity:1; transform:translateY(0) scale(1); } }
        .card-hover { position: relative; overflow: hidden; will-change: transform, box-shadow; transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.5s ease !important; }
        .card-hover::after { content:""; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent); pointer-events:none; transition:none; }
        .card-hover:hover::after { animation: cardShine 1.5s ease forwards; }
        .card-hover:hover { transform:translateY(-10px) scale(1.02)!important; box-shadow:0 30px 80px rgba(1,15,35,0.7),0 0 40px rgba(56,189,248,0.2),inset 0 1px 0 rgba(186,230,253,0.12)!important; border-color: rgba(56,189,248,0.4)!important; }
        .operator-badge { display:inline-flex;align-items:center;gap:6px; background:linear-gradient(135deg, rgba(56,189,248,0.12), rgba(99,102,241,0.08)); border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:11px;font-weight:700; letter-spacing:1.5px;padding:5px 14px;border-radius:100px;text-transform:uppercase; box-shadow: 0 0 20px rgba(56,189,248,0.1); }
        .operator-badge::before { content:"";width:7px;height:7px;border-radius:50%;background:#38bdf8;animation:pulseRed 2s infinite;box-shadow:0 0 8px #38bdf8; }
        .bg-layer { position:fixed; inset:0; pointer-events:none; contain:layout style paint; }
        .bg-base { z-index:0; background: radial-gradient(900px 500px at 15% 20%, rgba(14,40,80,0.9), transparent 60%), radial-gradient(800px 500px at 85% 80%, rgba(10,30,60,0.8), transparent 60%), radial-gradient(600px 400px at 50% 50%, rgba(8,24,52,0.6), transparent 50%), linear-gradient(170deg, #020a18 0%, #071e3a 30%, #0c2848 55%, #061a30 80%, #020a18 100%); }
        .bg-triband { z-index:1; opacity:0.4; background: linear-gradient(180deg, rgba(255,153,51,0.22) 0%, rgba(255,255,255,0.06) 3%, rgba(19,136,8,0.15) 6%, transparent 14%); }
        .bg-grid { z-index:2; opacity:0.12; background-image: linear-gradient(rgba(56,189,248,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.08) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, rgba(0,0,0,0.8), transparent 100%); }

        .bg-depth { z-index:3; background: radial-gradient(700px 500px at 20% 30%, rgba(14,165,233,0.08), transparent 70%), radial-gradient(600px 400px at 80% 70%, rgba(99,102,241,0.06), transparent 70%), radial-gradient(500px 400px at 50% 90%, rgba(16,185,129,0.05), transparent 70%); animation: depthBreathe 16s ease-in-out infinite; }
        @keyframes depthBreathe { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
        .bg-orb { position:fixed; pointer-events:none; border-radius:50%; filter:blur(40px); z-index:1; will-change:transform,opacity; transform:translateZ(0); }
        .bg-orb-1 { width:500px; height:500px; top:10%; left:5%; background: radial-gradient(circle, rgba(56,189,248,0.12), rgba(14,165,233,0.04), transparent); animation: orbFloat1 25s ease-in-out infinite; }
        .bg-orb-2 { width:400px; height:400px; top:50%; right:5%; background: radial-gradient(circle, rgba(99,102,241,0.1), rgba(139,92,246,0.04), transparent); animation: orbFloat2 30s ease-in-out infinite; }
        .bg-orb-3 { width:350px; height:350px; bottom:10%; left:30%; background: radial-gradient(circle, rgba(16,185,129,0.08), rgba(34,197,94,0.03), transparent); animation: orbFloat3 20s ease-in-out infinite; }

        .bg-tribot { position:fixed; bottom:0; left:0; right:0; height:3px; pointer-events:none; z-index:9; background: linear-gradient(90deg, #FF9933 33%, #FFFFFF 33% 66%, #138808 66%); opacity:0.5; }

        .bg-vignette { position:fixed; inset:0; pointer-events:none; z-index:6; box-shadow: inset 0 0 200px 60px rgba(2,10,24,0.7), inset 0 80px 100px -40px rgba(2,10,24,0.3); }
        .bg-aurora { position:fixed; top:0; left:0; right:0; height:40vh; pointer-events:none; z-index:1; opacity:0.3; background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.06) 25%, rgba(16,185,129,0.05) 50%, rgba(244,114,182,0.04) 75%, rgba(56,189,248,0.08) 100%); background-size: 400% 400%; animation: auroraShift 20s ease-in-out infinite; mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); }
        input::placeholder,textarea::placeholder{color:#334155;}
        input:focus, textarea:focus, select:focus { background: rgba(2,6,23,0.9) !important; border-color: rgba(56,189,248,0.5) !important; box-shadow: inset 0 0 0 1px rgba(2,132,199,0.2), 0 0 30px rgba(56,189,248,0.12), 0 0 60px rgba(56,189,248,0.04) !important; transition: border-color 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1), background 0.4s cubic-bezier(0.4,0,0.2,1) !important; }
        select option{background:#0f172a;color:#e2e8f0;}
        .lang-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-height:260px;overflow-y:auto;padding:4px; }
        .lang-option { padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07); color:#94a3b8;font-size:12px;cursor:pointer;transition:transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), background 0.25s ease, border-color 0.25s ease, color 0.25s ease;text-align:left;font-family:inherit; }
        .lang-option:hover { background:rgba(56,189,248,0.1);border-color:rgba(56,189,248,0.3);color:#38bdf8;transform:translateX(3px); }
        .lang-option.active { background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.4);color:#38bdf8;font-weight:700;box-shadow:0 0 20px rgba(56,189,248,0.1); }
        .top-actions { display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
        .field-row { display:flex; gap:24px; }
        .stat-item { transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), background 0.4s ease; }
        .stat-item:hover { background: rgba(255,255,255,0.04) !important; transform: translateY(-3px); }
        .stat-item:hover .stat-icon { transform: scale(1.2) rotate(5deg); }
        .stat-icon { transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
        .submit-shimmer { background-size: 200% 200%; animation: gradientFlow 3s ease infinite; }
        .submit-shimmer:hover:not(:disabled) { box-shadow: 0 14px 40px rgba(14,165,233,0.4), 0 0 80px rgba(99,102,241,0.15); transform: translateY(-3px) !important; }
        .submit-shimmer:active:not(:disabled) { transform: translateY(0) !important; box-shadow: 0 6px 20px rgba(14,165,233,0.3); }
        .result-entrance { animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .info-cell-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .info-cell-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .track-input:focus { box-shadow: 0 0 40px rgba(56,189,248,0.15), inset 0 0 0 2px rgba(56,189,248,0.3) !important; }
        .form-panel-glow { }
        @media (max-width: 1024px) { .lang-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) { .top-actions { justify-content:flex-end; } }
        @media (max-width: 768px) { .top-bar { padding:12px 14px !important; align-items:flex-start !important; gap:10px; } .top-actions { width:100%; } .field-row { flex-direction:column; gap:14px; } .lang-grid { grid-template-columns: 1fr; max-height:220px; } }
        @media (max-width: 640px) { .card-hover { width:100% !important; } .operator-badge { font-size:10px; padding:4px 10px; } }
        button { transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s cubic-bezier(0.25,0.46,0.45,0.94); will-change: transform; }
        button:hover:not(:disabled) { transform: translateY(-2px); }
        button:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        :focus-visible { outline: 2px solid rgba(56,189,248,0.6); outline-offset: 2px; border-radius: 4px; }
        ::selection { background: rgba(56,189,248,0.3); color: #f8fafc; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; } }
      `}</style>
      <div style={S.root}>
        <StaticBackground />
        <DeptIconsField />
        <div style={S.bgOverlay} />
        <div style={S.topBar} className="top-bar">
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={S.logo} key={titleIdx}>{JANVAANI_TITLES[titleIdx]}</span>
            <span className="operator-badge">{t(uiLang,"operatorPortal")}</span>
          </div>
          <div className="top-actions">
            {UI_SWITCHER_LANGS.map(l => (
              <button key={l} onClick={() => setUiLang(l)} style={{ ...S.langBtn, ...(uiLang === l ? S.langBtnActive : {}) }}>{ALL_LANGS.find(x => x.code === l)?.label || l}</button>
            ))}
            <a href={ADMIN_PANEL_URL} target="_self" aria-label="Open admin panel" style={{ padding:"6px 14px", borderRadius:10, border:"1px solid rgba(242,78,78,0.3)", background:"linear-gradient(135deg, rgba(242,78,78,0.1), rgba(242,78,78,0.04))", color:"#f24e4e", fontSize:12, fontWeight:700, textDecoration:"none", letterSpacing:1, display:"inline-flex", alignItems:"center", gap:6, transition:"background 0.3s, border-color 0.3s, box-shadow 0.3s", boxShadow:"0 0 20px rgba(242,78,78,0.05)" }}>
              <Shield size={14} /> ADMIN
            </a>
          </div>
        </div>
        {mode === "none" && (
          <div style={S.homeWrap}>
            <div style={{ position:"absolute", top:"5%", left:"50%", transform:"translateX(-50%)", opacity:0.5, zIndex:0, pointerEvents:"none" }}>
              <AshokaChakraSVG size={500} style={{ animation:"ringSpin 120s linear infinite" }} />
            </div>
            <div style={{ position:"absolute", right:"-5%", top:"15%", zIndex:0, pointerEvents:"none", width:"40%", maxWidth:400 }}>
              <IndiaMapSVG />
            </div>
            <div style={{ position:"absolute", left:"-3%", bottom:"5%", zIndex:0, pointerEvents:"none", width:"28%", maxWidth:300, opacity:0.6 }}>
              <GovBuildingSVG />
            </div>
            <ParticleField style={{ zIndex:0 }} />
            <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:800 }}>
              <TricolorBar style={{ marginBottom:32, opacity:0.7 }} />
            </div>
            <div style={{ marginBottom:28, animation:"fadeUp 0.8s ease forwards", position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:16 }}>
                <EmblemRingSVG size={48} style={{ opacity:0.5 }} />
                <div style={{ position:"relative" }}>
                  <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15), rgba(34,197,94,0.1))", border:"2px solid rgba(56,189,248,0.3)", display:"flex", alignItems:"center", justifyContent:"center", animation:"nodePulse 4s ease-in-out infinite", boxShadow:"0 0 40px rgba(56,189,248,0.15), inset 0 0 20px rgba(56,189,248,0.05)" }}>
                    <Landmark size={38} color="#38bdf8" strokeWidth={1.5} />
                  </div>
                  <div style={{ position:"absolute", top:-4, right:-4, width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#22c55e,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid rgba(2,6,23,0.8)" }}>
                    <Sparkles size={11} color="#fff" />
                  </div>
                </div>
                <EmblemRingSVG size={48} style={{ opacity:0.5 }} />
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:"#38bdf8", letterSpacing:3, textTransform:"uppercase", textAlign:"center" }}>Government of India</div>
              <div style={{ fontSize:11, fontWeight:600, color:"#475569", letterSpacing:2, textTransform:"uppercase", textAlign:"center", marginTop:4 }}>Citizen Grievance Redressal Portal</div>
            </div>
            <WaveDivider style={{ maxWidth:600, margin:"0 auto 24px", opacity:0.4 }} />
            <div style={{...S.homeHero, position:"relative", zIndex:1}}>
              <h1 style={S.heroTitle}>{t(uiLang,"heroTitle")}</h1>
              <p style={S.heroSub}>{t(uiLang,"heroSub")}</p>
              <div style={{ display:"flex", gap:0, justifyContent:"center", marginTop:36, borderRadius:20, background:"linear-gradient(135deg, rgba(56,189,248,0.06), rgba(99,102,241,0.04), rgba(34,197,94,0.03))", border:"1px solid rgba(56,189,248,0.15)", backdropFilter:"blur(16px)", overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                {[
                  { icon: <Languages size={20} />, value:"22+", label:"Languages", color:"#38bdf8" },
                  { icon: <Brain size={20} />, value:"AI",  label:"Powered",   color:"#a855f7" },
                  { icon: <Zap size={20} />, value:"24/7", label:"Available",  color:"#22c55e" },
                  { icon: <Lock size={20} />, value:"100%", label:"Secure",    color:"#f59e0b" },
                  { icon: <HeartHandshake size={20} />, value:"10+", label:"Departments", color:"#ec4899" },
                ].map((stat, idx) => (
                  <div key={idx} className="stat-item" style={{ flex:1, textAlign:"center", padding:"24px 16px", borderRight: idx < 4 ? "1px solid rgba(255,255,255,0.06)" : "none", position:"relative", cursor:"default", animation:`statCount 0.6s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + idx * 0.1}s both` }}>
                    <div className="stat-icon" style={{ color:stat.color, margin:"0 auto 10px", opacity:0.9, display:"flex", justifyContent:"center", filter:`drop-shadow(0 0 8px ${stat.color}40)` }}>{stat.icon}</div>
                    <div style={{ fontSize:24, fontWeight:900, color:stat.color, lineHeight:1, textShadow:`0 0 20px ${stat.color}30` }}>{stat.value}</div>
                    <div style={{ fontSize:10, color:"#475569", marginTop:8, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{...S.cardsRow, position:"relative", zIndex:1}}>
              <div className="card-hover" style={{...S.modeCard, borderTop:"2px solid rgba(56,189,248,0.4)", transform:"translateY(0)", animation:"slideInLeft 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both"}} onClick={() => setMode("write")}>
                <div style={{ position:"absolute", top:0, right:0, width:"100%", height:"100%", overflow:"hidden", borderRadius:28, pointerEvents:"none" }}>
                  <TypingIllustrationSVG style={{ position:"absolute", top:-10, right:-20, width:180, opacity:0.5 }} />
                </div>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"100%", background:"linear-gradient(180deg, rgba(56,189,248,0.08) 0%, transparent 50%)", borderRadius:28, pointerEvents:"none" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                    <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg, rgba(56,189,248,0.18), rgba(56,189,248,0.06))", border:"1px solid rgba(56,189,248,0.3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(56,189,248,0.15), 0 0 40px rgba(56,189,248,0.05)", animation:"float 4s ease-in-out infinite" }}>
                      <FileText size={30} color="#38bdf8" strokeWidth={1.5} />
                    </div>
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#38bdf8", opacity:0.3+i*0.2, animation:`dotBounce 1.5s ease-in-out ${i*0.2}s infinite` }} />)}
                    </div>
                  </div>
                  <div style={S.modeCardTitle}>{t(uiLang,"recordByTyping")}</div>
                  <div style={S.modeCardSub}>{t(uiLang,"recordByTypingSub")}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:24, padding:"8px 16px", borderRadius:10, background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.15)", width:"fit-content" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#38bdf8" }}>Get Started</span>
                    <ChevronRight size={16} color="#38bdf8" style={{ animation:"arrowNudge 2s ease-in-out infinite" }} />
                  </div>
                </div>
              </div>
              <div className="card-hover" style={{...S.modeCard, borderTop:"2px solid rgba(16,185,129,0.4)", transform:"translateY(0)", animation:"fadeUp 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.25s both"}} onClick={() => setMode("speak")}>
                <div style={{ position:"absolute", top:0, right:0, width:"100%", height:"100%", overflow:"hidden", borderRadius:28, pointerEvents:"none" }}>
                  <VoiceIllustrationSVG style={{ position:"absolute", top:-10, right:-20, width:180, opacity:0.5 }} />
                </div>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"100%", background:"linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 50%)", borderRadius:28, pointerEvents:"none" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                    <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))", border:"1px solid rgba(16,185,129,0.3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(16,185,129,0.15), 0 0 40px rgba(16,185,129,0.05)", animation:"float 4s ease-in-out 0.5s infinite" }}>
                      <Mic size={30} color="#10b981" strokeWidth={1.5} />
                    </div>
                    <div style={{ display:"flex", gap:3, alignItems:"flex-end" }}>
                      {[0,1,2,3,4].map(i => <div key={i} style={{ width:3, height:8+i*5, borderRadius:2, background:`rgba(16,185,129,${0.25+i*0.12})`, animation:`dotBounce 1.2s ease-in-out ${i*0.12}s infinite` }} />)}
                    </div>
                  </div>
                  <div style={S.modeCardTitle}>{t(uiLang,"recordByVoice")}</div>
                  <div style={S.modeCardSub}>{t(uiLang,"recordByVoiceSub")}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:24, padding:"8px 16px", borderRadius:10, background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", width:"fit-content" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#10b981" }}>Start Recording</span>
                    <ChevronRight size={16} color="#10b981" style={{ animation:"arrowNudge 2s ease-in-out 0.3s infinite" }} />
                  </div>
                </div>
              </div>
              <div className="card-hover" style={{ ...S.modeCard, borderColor:"rgba(99,102,241,0.3)", background:"linear-gradient(160deg, rgba(99,102,241,0.08), rgba(5,14,30,0.9))", borderTop:"2px solid rgba(99,102,241,0.4)", transform:"translateY(0)", animation:"slideInRight 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both" }} onClick={() => setMode("track")}>
                <div style={{ position:"absolute", top:0, right:0, width:"100%", height:"100%", overflow:"hidden", borderRadius:28, pointerEvents:"none" }}>
                  <TrackIllustrationSVG style={{ position:"absolute", top:-10, right:-20, width:180, opacity:0.5 }} />
                </div>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"100%", background:"linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 50%)", borderRadius:28, pointerEvents:"none" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                    <div style={{ width:64, height:64, borderRadius:18, background:"linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.06))", border:"1px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.05)", animation:"float 4s ease-in-out 1s infinite" }}>
                      <Search size={30} color="#818cf8" strokeWidth={1.5} />
                    </div>
                    <Activity size={18} color="#818cf8" style={{ opacity:0.6, animation:"float 2s ease-in-out infinite" }} />
                  </div>
                  <div style={S.modeCardTitle}>{t(uiLang,"trackComplaint")}</div>
                  <div style={S.modeCardSub}>{t(uiLang,"trackComplaintSub")}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:24, padding:"8px 16px", borderRadius:10, background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)", width:"fit-content" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#818cf8" }}>Track Now</span>
                    <ChevronRight size={16} color="#818cf8" style={{ animation:"arrowNudge 2s ease-in-out 0.6s infinite" }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop:56, maxWidth:700, textAlign:"center", animation:"fadeUp 1s ease forwards", position:"relative", zIndex:1 }}>
              <WaveDivider style={{ marginBottom:28, opacity:0.3 }} />
              <div style={{ padding:"24px 32px", borderRadius:16, background:"linear-gradient(135deg, rgba(56,189,248,0.04), rgba(99,102,241,0.03), rgba(34,197,94,0.02))", border:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:12 }}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize:12, fontWeight:800, color:"#38bdf8", letterSpacing:2 }}>JANVAANI</span>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                </div>
                <div style={{ fontSize:13, color:"#64748b", lineHeight:1.8 }}>
                  Your voice matters. Quick, secure, and accessible grievance management for every citizen across India.
                </div>
                <div style={{ fontSize:11, color:"#334155", marginTop:10 }}>
                  Powered by AI-driven multi-language detection · Compliant with Government of India IT Standards
                </div>
                <TricolorBar style={{ marginTop:16, opacity:0.4 }} />
              </div>
            </div>
          </div>
        )}
        {(mode === "write" || mode === "speak") && (
          <div style={S.formWrap}>
            <div style={S.formPanel} className="form-panel-glow">
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"28px 28px 0 0", background:"linear-gradient(90deg, #FF9933, #FFFFFF, #138808)", opacity:0.5 }} />
              <div style={{ position:"absolute", top:0, right:0, width:300, height:300, background:"radial-gradient(circle, rgba(56,189,248,0.04), transparent 70%)", pointerEvents:"none" }} />
              <div style={{ animation:"fieldReveal 0.5s ease forwards" }}>
                <button onClick={reset} style={S.backBtn}><ArrowLeft size={16} style={{marginRight:6,verticalAlign:"middle"}} />{t(uiLang,"back")}</button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16, animation:"fieldReveal 0.5s ease 0.05s both" }}>
                <div style={{ width:52, height:52, borderRadius:16, background: mode === "write" ? "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(56,189,248,0.05))" : "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", border: mode === "write" ? "1px solid rgba(56,189,248,0.25)" : "1px solid rgba(168,85,247,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {mode === "write" ? <FileText size={24} color="#38bdf8" strokeWidth={1.5} /> : <Mic size={24} color="#a855f7" strokeWidth={1.5} />}
                </div>
                <div>
                  <div style={S.panelTitle}>{mode === "write" ? t(uiLang,"recordByTypingFull") : t(uiLang,"recordByVoiceFull")}</div>
                  <div style={S.panelSub}>{t(uiLang,"recordAndFile")}</div>
                </div>
              </div>
              <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent)", margin:"8px 0 32px" }} />
              <div style={{ ...S.fieldGroup, animation:"fieldReveal 0.5s ease 0.1s both" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:20, height:2, borderRadius:1, background:"linear-gradient(90deg, #38bdf8, transparent)" }} />
                  Citizen Information
                </div>
                <div style={S.fieldRow} className="field-row">
                  <div style={S.fieldWrap}>
                    <label style={S.lbl}>{t(uiLang,"citizenName")}</label>
                    <input style={S.inp} placeholder={t(uiLang,"citizenNamePlaceholder")} value={citizenName} onChange={e => setCitizenName(e.target.value)} />
                  </div>
                  <div style={S.fieldWrap}>
                    <label style={S.lbl}>{t(uiLang,"citizenPhone")}</label>
                    <input style={S.inp} placeholder={t(uiLang,"citizenPhonePlaceholder")} value={citizenPhone} inputMode="tel" maxLength={15} onChange={e => setCitizenPhone(e.target.value.replace(/[^\d+\s-]/g, "").slice(0, 15))} />
                  </div>
                </div>
              </div>
              <div style={{ ...S.fieldGroup, ...S.fieldRow, animation:"fieldReveal 0.5s ease 0.15s both", position:"relative", zIndex:10 }} className="field-row">
                <div style={S.fieldWrap}>
                  <label style={S.lbl}>{t(uiLang,"spokenLanguage")}</label>
                  <div style={{ position:"relative", zIndex:10 }} ref={langPickerRef}>
                    <button onClick={() => setShowLangPicker(p => !p)} aria-expanded={showLangPicker} aria-label="Select spoken language" style={{ ...S.inp, textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}>
                      <span>{spokenLang === "AUTO" ? <span style={{ color:"#818cf8", fontWeight:700 }}>{t(uiLang,"autoDetect")}{detectedScriptLang && detectedScriptLang !== "English" ? ` → ${detectedScriptLang}` : ""}</span> : ALL_LANGS.find(l => l.code === spokenLang)?.label || spokenLang}</span>
                      <span style={{ color:"#475569", fontSize:12 }}>{showLangPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                    </button>
                    {showLangPicker && renderLangPicker()}
                  </div>
                </div>
                <div style={{ ...S.fieldWrap, position:"relative", zIndex:9 }}>
                  <label style={S.lbl}>{t(uiLang,"preAssignDept")}</label>
                  <div style={{ position:"relative", zIndex:9 }} ref={deptPickerRef}>
                    <button
                      onClick={() => setIsDeptOpen(p => !p)}
                      aria-expanded={isDeptOpen}
                      aria-label="Select department"
                      style={{ ...S.inp, textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%" }}
                    >
                      <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Landmark size={15} color="#38bdf8" />
                        <span style={{ color: department === "Auto" ? "#38bdf8" : "#e2e8f0", fontWeight: department === "Auto" ? 700 : 400 }}>
                          {department === "Auto" ? t(uiLang,"letAIDecide") : department}
                        </span>
                      </span>
                      <span style={{ color:"#475569", fontSize:12 }}>{isDeptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                    </button>
                    {isDeptOpen && renderDeptPicker()}
                  </div>
                </div>
              </div>
              {mode === "speak" && (
                <div style={{ ...S.fieldGroup, animation:"fieldReveal 0.5s ease 0.2s both" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:20, height:2, borderRadius:1, background:"linear-gradient(90deg, #a855f7, transparent)" }} />
                    Voice Capture
                  </div>
                  {voiceError && (
                    <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#fca5a5", fontSize:13, marginBottom:12 }}>
                      Notice: {voiceError}
                    </div>
                  )}
                  {!listening ? (
                    <button style={S.micStartBtn} onClick={startListening}><Mic size={18} style={{marginRight:8,verticalAlign:"middle"}} />{t(uiLang,"startVoice")}</button>
                  ) : (
                    <div style={S.listeningBox}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                        <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:100, height:100 }}>
                          <div style={{ position:"absolute", width: 100, height: 100, borderRadius:"50%", background:`radial-gradient(circle, rgba(14,165,233,${0.06 + avgVolume * 0.3}) 0%, transparent 70%)`, transform:`scale(${1 + avgVolume * 1.2})`, transition:"transform 0.1s ease-out" }} />
                          {[0,1,2].map(i => (
                            <div key={i} style={{ position:"absolute", width: 80, height: 80, borderRadius:"50%", border:`1.5px solid rgba(14,165,233,${0.35 - i * 0.1})`, animation:`voiceRipple ${2 + i * 0.4}s ease-out ${i * 0.5}s infinite` }} />
                          ))}
                          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg, rgba(14,165,233,0.85), rgba(99,102,241,0.85))", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, boxShadow:`0 0 ${20 + avgVolume * 30}px rgba(14,165,233,${0.25 + avgVolume * 0.3}), inset 0 1px 0 rgba(255,255,255,0.2)`, transition:"box-shadow 0.3s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
                            <Mic size={28} color="#fff" strokeWidth={2.2} />
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={S.recDot} />
                          <span style={S.recLabel}>{t(uiLang,"capturingVoice")}</span>
                          <span style={{ fontSize:13, fontWeight:700, color:"#f8fafc", fontFamily:"'JetBrains Mono', monospace", letterSpacing:1, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", padding:"2px 10px", borderRadius:6 }}>{String(Math.floor(recordingSecs / 60)).padStart(2,"0")}:{String(recordingSecs % 60).padStart(2,"0")}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2, height:64, padding:"0 8px", width:"100%", maxWidth:400 }}>
                          {waveformData.map((level, i) => {
                            const h = Math.max(3, level * 56), centerDist = Math.abs(i - 15.5) / 16, hue = 200 - centerDist * 40, saturation = 85 + level * 15, lightness = 50 + level * 20;
                            return (<div key={i} style={{ flex:1, maxWidth:10, height:h, minHeight:3, borderRadius:3, background:`hsla(${hue},${saturation}%,${lightness}%,${0.6 + level * 0.4})`, transition:"height 0.12s cubic-bezier(0.25,0.46,0.45,0.94)" }} />);
                          })}
                        </div>
                        <div style={{ width:"100%", maxWidth:300, height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${Math.min(100, avgVolume * 200)}%`, borderRadius:2, background:`linear-gradient(90deg, #0ea5e9, ${avgVolume > 0.4 ? "#22c55e" : avgVolume > 0.2 ? "#6366f1" : "#0ea5e9"})`, transition:"width 0.2s cubic-bezier(0.25,0.46,0.45,0.94), background 0.5s ease" }} />
                        </div>
                        {spokenLang === "AUTO" && detectedScriptLang && (
                          <div style={{ fontSize:11, color:"#818cf8", padding:"4px 12px", borderRadius:100, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", gap:5 }}>
                            <Languages size={12} /> Detected: <strong>{detectedScriptLang}</strong>
                          </div>
                        )}
                        {interimText && (
                          <div style={{ fontSize:13, color:"rgba(56,189,248,0.8)", fontStyle:"italic", textAlign:"center", maxWidth:440, padding:"6px 16px", background:"rgba(56,189,248,0.04)", borderRadius:10, border:"1px solid rgba(56,189,248,0.08)", lineHeight:1.6 }}>
                            {interimText}
                          </div>
                        )}
                        <button style={S.micStopBtn} onClick={stopListening}><MicOff size={16} style={{marginRight:6,verticalAlign:"middle"}} />{t(uiLang,"stopVoice")}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ ...S.fieldGroup, animation:"fieldReveal 0.5s ease 0.25s both", position:"relative", zIndex:1 }}>
                <div style={{ fontSize:11, fontWeight:800, color:"#475569", letterSpacing:2, textTransform:"uppercase", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:20, height:2, borderRadius:1, background:"linear-gradient(90deg, #22c55e, transparent)" }} />
                  Statement & Evidence
                </div>
                <label style={S.lbl}>{t(uiLang,"citizenStatement")}</label>
                <textarea style={S.textarea} placeholder={t(uiLang,"citizenStatementPlaceholder")} value={citizenStatement} onChange={e => setCitizenStatement(e.target.value)} />
                {citizenStatement && spokenLang === "AUTO" && detectedScriptLang && (
                  <div style={{ marginTop:6, fontSize:11, color:"#818cf8", display:"flex", alignItems:"center", gap:6 }}>
                    <span>Detected</span>
                    <span>Script detected: <strong>{detectedScriptLang}</strong> — will be used for AI processing</span>
                  </div>
                )}
              </div>
              <div style={{ ...S.fieldGroup, animation:"fieldReveal 0.5s ease 0.3s both" }}>
                <label style={S.lbl}>{t(uiLang,"locationRequired")} <span style={{ color:"#ef4444", marginLeft:4 }}>{t(uiLang,"locationRequiredBadge")}</span></label>
                <button onClick={handleGetLocation} disabled={isFetchingLoc} style={{ ...S.locationBtn, ...(location ? S.locationBtnSuccess : S.locationBtnRequired) }}>
                  {isFetchingLoc ? <><Loader2 size={18} style={{animation:"spin 0.8s linear infinite",marginRight:8}} />{t(uiLang,"fetchingLocation")}</> : location ? <><CheckCircle2 size={18} color="#4ade80" style={{marginRight:8}} />{t(uiLang,"locationCaptured")} {locationLabel || location}</> : <><MapPin size={18} style={{marginRight:8}} />{t(uiLang,"tapToCapture")}</>}
                </button>
                {!location && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
                    <AlertTriangle size={16} color="#fca5a5" />
                    <span style={{ fontSize:12, color:"#fca5a5", fontWeight:600 }}>{t(uiLang,"locationMandatory")}</span>
                  </div>
                )}
                <div style={{ marginTop:10 }}>
                  <input type="file" id="ev-upload" style={{ display:"none" }} onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (!ACCEPTED_ATTACHMENT_TYPES.some(prefix => file.type.startsWith(prefix))) { alert("Unsupported file type. Please upload image, video, audio, or PDF."); e.target.value = ""; return; }
                    if (file.size > MAX_ATTACHMENT_BYTES) { alert("File too large. Maximum allowed size is 8 MB."); e.target.value = ""; return; }
                    setAttachment(file);
                  }} />
                  <label htmlFor="ev-upload" style={S.auxBtn}><Paperclip size={14} style={{marginRight:4}} />{attachment ? `${attachment.name.slice(0,22)}…` : t(uiLang,"attachEvidence")}</label>
                </div>
              </div>
              {!result && (
                <div style={{ animation:"fieldReveal 0.5s ease 0.35s both" }}>
                  <button style={{ ...S.submitBtn, opacity:(isAnalyzing || !citizenStatement.trim() || !location) ? 0.4 : 1, cursor:(isAnalyzing || !citizenStatement.trim() || !location) ? "not-allowed" : "pointer" }} onClick={fileGrievance} disabled={isAnalyzing || !citizenStatement.trim() || !location}>
                    {isAnalyzing ? <><Loader2 size={16} style={{ animation:"spin 0.8s linear infinite", marginRight:8, verticalAlign:"middle" }} />{t(uiLang,"filingRouting")}</> : !location ? t(uiLang,"captureToEnable") : <><Send size={16} style={{marginRight:8,verticalAlign:"middle"}} />{t(uiLang,"fileGrievance")}</>}
                  </button>
                  {(!location || !citizenStatement.trim()) && (
                    <div style={{ marginTop:10, padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)" }}>
                      <div style={{ fontSize:11, color:"#ef4444", fontWeight:800, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{t(uiLang,"requiredBefore")}</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                          {citizenStatement.trim() ? <CheckCircle2 size={16} color="#4ade80" /> : <CircleDot size={16} color="#fca5a5" />}
                          <span style={{ color: citizenStatement.trim() ? "#4ade80" : "#fca5a5" }}>{t(uiLang,"statementRecorded")}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                          {location ? <CheckCircle2 size={16} color="#4ade80" /> : <CircleDot size={16} color="#fca5a5" />}
                          <span style={{ color: location ? "#4ade80" : "#fca5a5" }}>{t(uiLang,"locationCapturedReq")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {renderResult()}
              {result && (
                <button style={{ ...S.submitBtn, marginTop:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }} onClick={reset}>
                  <Plus size={16} style={{marginRight:6,verticalAlign:"middle"}} /> {t(uiLang,"fileAnother")}
                </button>
              )}
            </div>
          </div>
        )}
        {mode === "track" && (
          <div style={S.formWrap}>
            <div style={{ ...S.formPanel, maxWidth:760 }} className="form-panel-glow">
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"28px 28px 0 0", background:"linear-gradient(90deg, #818cf8, #38bdf8, #818cf8)", opacity:0.5 }} />
              <div style={{ position:"absolute", top:0, right:0, width:250, height:250, background:"radial-gradient(circle, rgba(99,102,241,0.04), transparent 70%)", pointerEvents:"none" }} />
              <div style={{ animation:"fieldReveal 0.4s ease forwards" }}>
                <button onClick={reset} style={S.backBtn}><ArrowLeft size={16} style={{marginRight:6,verticalAlign:"middle"}} />{t(uiLang,"back")}</button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:16, animation:"fieldReveal 0.4s ease 0.05s both" }}>
                <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))", border:"1px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Search size={24} color="#818cf8" strokeWidth={1.5} />
                </div>
                <div>
                  <div style={S.panelTitle}>{t(uiLang,"trackTitle")}</div>
                  <div style={S.panelSub}>{t(uiLang,"trackSub")}</div>
                </div>
              </div>
              <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)", margin:"8px 0 32px" }} />
              <div style={{ ...S.fieldGroup, display:"flex", gap:12, animation:"fieldReveal 0.4s ease 0.1s both" }}>
                <input className="track-input" style={{ ...S.inp, flex:1, fontFamily:"monospace", fontSize:18, letterSpacing:2, textTransform:"uppercase" }} placeholder={t(uiLang,"ticketPlaceholder")} value={trackId} onChange={e => { setTrackId(e.target.value.toUpperCase()); setTrackError(""); }} onKeyDown={e => { if (e.key === "Enter") trackComplaint(); }} />
                <button onClick={trackComplaint} disabled={trackLoading} style={{ ...S.submitBtn, marginTop:0, width:"auto", padding:"16px 32px", opacity: trackLoading ? 0.6 : 1 }}>
                  {trackLoading
                    ? <><Loader2 size={16} style={{ animation:"spin 0.8s linear infinite", marginRight:8, verticalAlign:"middle" }} />{t(uiLang,"searching")}</>
                    : t(uiLang,"track")}
                </button>
              </div>
              {trackError && (
                <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", fontSize:13, marginBottom:16, animation:"fieldReveal 0.3s ease forwards" }}>
                  Notice: {trackError}
                </div>
              )}
              {renderTrackResult()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
const S = {
  root               : { minHeight:"100vh", position:"relative", fontFamily:"'Manrope', 'Segoe UI', system-ui, sans-serif", color:"#e2e8f0" },
  bgOverlay          : { position:"fixed", inset:0, background:"linear-gradient(to bottom,rgba(2,10,24,0.28) 0%,rgba(4,14,32,0.18) 50%,rgba(2,10,24,0.35) 100%)", zIndex:7 },
  topBar             : { position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 32px", background:"linear-gradient(180deg, rgba(2,10,24,0.95), rgba(2,10,24,0.8))", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(56,189,248,0.15)", boxShadow:"0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(56,189,248,0.03)" },
  logo               : { fontSize:24, fontWeight:900, letterSpacing:3, fontFamily:"'Merriweather', serif", background:"linear-gradient(92deg,#f8fafc 0%,#38bdf8 35%,#22d3ee 55%,#818cf8 78%,#a855f7 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"titleFade 12s ease forwards, shimmer 6s linear infinite" },
  langBtn            : { padding:"5px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#64748b", fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"background 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s" },
  langBtnActive      : { background:"rgba(56,189,248,0.12)", borderColor:"rgba(56,189,248,0.4)", color:"#38bdf8", boxShadow:"0 0 16px rgba(56,189,248,0.1)" },
  homeWrap           : { position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"100px 24px 40px" },
  homeHero           : { textAlign:"center", marginBottom:48, animation:"fadeUp 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards" },
  heroTitle          : { fontSize:52, fontWeight:900, letterSpacing:1, marginBottom:16, lineHeight:1.1, background:"linear-gradient(135deg,#f8fafc 5%,#7dd3fc 30%,#a5b4fc 50%,#22d3ee 70%,#4ade80 95%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"textGlow 4s ease-in-out infinite, shimmer 6s linear infinite" },
  heroSub            : { fontSize:18, color:"#94a3b8", fontWeight:500, lineHeight:1.7, maxWidth:500, margin:"0 auto" },
  cardsRow           : { display:"flex", gap:32, flexWrap:"wrap", justifyContent:"center", perspective:"1200px" },
  modeCard           : { width:360, padding:"48px 38px 38px", borderRadius:24, background:"linear-gradient(160deg, rgba(8,22,44,0.92), rgba(5,14,30,0.97))", border:"1px solid rgba(99,102,241,0.15)", borderTop:"1px solid rgba(186,230,253,0.22)", cursor:"pointer", boxShadow:"0 24px 60px rgba(2,8,22,0.7), inset 0 1px 0 rgba(186,230,253,0.1)", position:"relative", overflow:"hidden" },
  modeCardIcon       : { marginBottom:20, display:"flex", alignItems:"center", justifyContent:"flex-start" },
  modeCardTitle      : { fontSize:26, fontWeight:800, color:"#f1f5f9", marginBottom:10, letterSpacing:0.5, lineHeight:1.2 },
  modeCardSub        : { fontSize:14, color:"#64748b", lineHeight:1.7, marginBottom:8 },
  modeCardArrow      : { fontSize:24, color:"#38bdf8", fontWeight:900 },
  formWrap           : { position:"relative", zIndex:10, display:"flex", justifyContent:"center", alignItems:"flex-start", minHeight:"100vh", padding:"90px 32px 60px" },
  formPanel          : { width:"100%", maxWidth:1100, background:"linear-gradient(160deg, rgba(6,16,33,0.94), rgba(4,12,24,0.97))", backdropFilter:"blur(16px)", borderRadius:28, border:"1px solid rgba(56,189,248,0.12)", borderTop:"2px solid rgba(186,230,253,0.2)", padding:"52px 60px", boxShadow:"0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(56,189,248,0.03), inset 0 1px 0 rgba(186,230,253,0.06)", animation:"fadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" },
  backBtn            : { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", padding:"10px 20px", borderRadius:12, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginBottom:28, transition:"background 0.3s, border-color 0.3s, color 0.3s", fontWeight:700 },
  panelTitle         : { fontSize:34, fontWeight:900, color:"#f1f5f9", letterSpacing:0.5, marginBottom:8, background:"linear-gradient(135deg, #f8fafc 25%, #7dd3fc 70%, #a5b4fc 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  panelSub           : { fontSize:15, color:"#475569", marginBottom:40, lineHeight:1.6 },
  fieldGroup         : { marginBottom:28 },
  fieldRow           : { display:"flex", gap:24 },
  fieldWrap          : { flex:1, display:"flex", flexDirection:"column" },
  lbl                : { fontSize:12, fontWeight:700, color:"#38bdf8", letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 },
  inp                : { background:"rgba(2,6,23,0.7)", border:"1px solid rgba(125,211,252,0.14)", borderRadius:14, padding:"16px 20px", color:"#e2e8f0", fontSize:16, outline:"none", fontFamily:"inherit", boxShadow:"inset 0 0 0 1px rgba(2,132,199,0.08)", transition:"border-color 0.4s, box-shadow 0.4s, background 0.4s" },
  sel                : { background:"rgba(2,6,23,0.7)", border:"1px solid rgba(125,211,252,0.14)", borderRadius:14, padding:"16px 20px", color:"#e2e8f0", fontSize:16, outline:"none", cursor:"pointer", fontFamily:"inherit", boxShadow:"inset 0 0 0 1px rgba(2,132,199,0.08)", transition:"border-color 0.3s, box-shadow 0.3s, background 0.3s" },
  textarea           : { background:"rgba(2,6,23,0.7)", border:"1px solid rgba(125,211,252,0.14)", borderRadius:14, padding:"20px 22px", color:"#e2e8f0", fontSize:16, lineHeight:1.8, resize:"vertical", minHeight:220, outline:"none", fontFamily:"inherit", width:"100%", boxShadow:"inset 0 0 0 1px rgba(2,132,199,0.08)", transition:"border-color 0.4s, box-shadow 0.4s, background 0.4s" },
  micStartBtn        : { width:"100%", padding:"20px", borderRadius:16, background:"linear-gradient(135deg,#7c3aed,#a855f7,#818cf8)", backgroundSize:"200% 200%", border:"none", color:"#fff", fontSize:16, fontWeight:800, cursor:"pointer", letterSpacing:0.5, boxShadow:"0 10px 30px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.15)", transition:"transform 0.3s, box-shadow 0.3s", fontFamily:"inherit" },
  listeningBox       : { background:"linear-gradient(160deg, rgba(2,6,23,0.97), rgba(8,15,32,0.97))", border:"1px solid rgba(14,165,233,0.25)", borderRadius:24, padding:"36px 32px", boxShadow:"0 0 40px rgba(14,165,233,0.08), 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" },
  recDot             : { width:12, height:12, borderRadius:"50%", background:"#ef4444", animation:"pulseRed 1s infinite", boxShadow:"0 0 12px rgba(239,68,68,0.5)" },
  recLabel           : { fontSize:12, fontWeight:800, color:"#38bdf8", letterSpacing:2, textTransform:"uppercase" },
  micStopBtn         : { background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.35)", color:"#ef4444", padding:"14px 28px", borderRadius:14, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"transform 0.3s, box-shadow 0.3s, background 0.3s", letterSpacing:0.3, boxShadow:"0 6px 20px rgba(239,68,68,0.1)" },
  auxBtn             : { display:"inline-flex", alignItems:"center", gap:6, padding:"12px 18px", borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"background 0.3s, border-color 0.3s, color 0.3s", maxWidth:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  locationBtn        : { width:"100%", padding:"16px 22px", borderRadius:14, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"background 0.4s, border-color 0.4s, color 0.4s, box-shadow 0.4s", display:"flex", alignItems:"center", gap:8 },
  locationBtnRequired: { background:"rgba(239,68,68,0.08)", border:"2px dashed rgba(239,68,68,0.5)", color:"#fca5a5" },
  locationBtnSuccess : { background:"rgba(34,197,94,0.08)", border:"2px solid rgba(34,197,94,0.4)", color:"#4ade80", boxShadow:"0 0 20px rgba(34,197,94,0.08)" },
  submitBtn          : { width:"100%", padding:"20px", borderRadius:16, background:"linear-gradient(135deg,#0ea5e9,#6366f1,#8b5cf6,#0ea5e9)", backgroundSize:"300% 300%", border:"none", color:"#fff", fontSize:16, fontWeight:900, letterSpacing:0.5, cursor:"pointer", transition:"transform 0.3s, box-shadow 0.3s", marginTop:8, fontFamily:"inherit", boxShadow:"0 12px 40px rgba(14,165,233,0.3), 0 0 80px rgba(99,102,241,0.08), 0 0 0 1px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.1)", position:"relative", overflow:"hidden" },
  resultCard         : { marginTop:28, padding:"32px", borderRadius:24, background:"linear-gradient(160deg, rgba(5,12,26,0.85), rgba(3,8,18,0.92))", border:"1px solid rgba(56,189,248,0.2)", boxShadow:"0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(56,189,248,0.05), inset 0 1px 0 rgba(186,230,253,0.06)", animation:"slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards", position:"relative", overflow:"hidden" },
  infoCell           : { flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px", transition:"transform 0.3s ease, box-shadow 0.3s ease" },
  infoLbl            : { fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 },
  infoVal            : { fontSize:14, fontWeight:700, color:"#f1f5f9" },
  block              : { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 18px", marginBottom:14 },
  blockLbl           : { fontSize:10, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 },
  blockVal           : { fontSize:14, color:"#e2e8f0", lineHeight:1.7 },
  copyBtn            : { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", padding:"10px 18px", borderRadius:10, fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:700, transition:"background 0.3s, color 0.3s, border-color 0.3s" },
};
