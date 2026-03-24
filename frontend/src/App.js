import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
//  JANVAANI  —  Grievance Intake Operator Tool
// ─────────────────────────────────────────────

// ── UI Translation strings ────────────────────
const UI_STRINGS = {
  English: {
    operatorPortal: "Operator Portal",
    heroTitle: "Operator Grievance Portal",
    heroSub: "Record & file citizen issues on their behalf",
    recordByTyping: "Record by Typing",
    recordByTypingSub: "Type what the citizen described",
    recordByVoice: "Record by Voice",
    recordByVoiceSub: "Let the citizen speak — you capture it",
    trackComplaint: "Track Complaint",
    trackComplaintSub: "Check status using Ticket ID",
    back: "← Back",
    citizenName: "Citizen Name (optional)",
    citizenPhone: "Citizen Phone (optional)",
    citizenNamePlaceholder: "e.g. Prince Kumar",
    citizenPhonePlaceholder: "e.g. 98765 43210",
    spokenLanguage: "Spoken Language",
    preAssignDept: "Pre-assign Department",
    letAIDecide: "Let AI Decide",
    autoDetect: "🤖 Auto Detect",
    citizenStatement: "Citizen's Statement",
    citizenStatementPlaceholder: "Describe what the citizen reported…",
    locationRequired: "📍 Citizen Location",
    locationRequiredBadge: "* Required",
    fetchingLocation: "⏳ Fetching location…",
    locationCaptured: "✅",
    tapToCapture: "📍 Tap to Capture Citizen Location",
    locationMandatory: "Location is mandatory before filing.",
    attachEvidence: "📎 Attach Evidence",
    startVoice: "🎤 Start Capturing Voice",
    stopVoice: "⏹ Stop Capture",
    capturingVoice: "CAPTURING CITIZEN VOICE…",
    filingRouting: "Filing & Routing…",
    captureToEnable: "📍 Capture Location to Enable Filing",
    fileGrievance: "File Grievance on Behalf of Citizen",
    requiredBefore: "Required before filing",
    statementRecorded: "Citizen statement recorded",
    locationCapturedReq: "Citizen location captured",
    grievanceFiledSuccess: "Grievance Filed Successfully",
    grievanceFiledSuccessSub: "Recorded and routed. No further action required from the citizen.",
    ticketId: "Ticket ID",
    filedOn: "Filed On",
    department: "🏢 Department",
    priority: "Priority",
    language: "🌐 Language",
    complaintFiled: "📄 Complaint Filed on Behalf",
    resolutionCommitted: "Resolution Committed By",
    copyTicketId: "📋 Copy Ticket ID",
    copied: "✅ Copied!",
    fileAnother: "＋ File Another Grievance",
    trackTitle: "Track Complaint",
    trackSub: "Enter your Ticket ID to check current status and history",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "Searching…",
    track: "🔍 Track",
    enterTicketId: "Please enter a ticket ID.",
    ticketNotFound: "Ticket not found. Please check the ID.",
    assignedTo: "🔔 Assigned To",
    escalationChain: "📶 Escalation Chain",
    statusHistory: "📋 Status History",
    languageVotes: "🗳️ Language Detection Votes",
    complaintOnRecord: "📄 Complaint on Record",
    slaDeadline: "SLA Deadline",
    confidence: "🔍 Confidence",
    filed: "Filed:",
    recordByTypingFull: "Record by Typing",
    recordByVoiceFull: "Record by Voice",
    recordAndFile: "Record & file citizen issues on their behalf",
    allLanguages: "All 22 Scheduled Indian Languages + Auto",
    autoDetectLabel: "🤖 Auto Detect Language",
    autoDetectSub: "AI will identify the language",
  },
  Hindi: {
    operatorPortal: "ऑपरेटर पोर्टल",
    heroTitle: "ऑपरेटर शिकायत पोर्टल",
    heroSub: "नागरिकों की ओर से समस्याएं दर्ज करें",
    recordByTyping: "टाइप करके दर्ज करें",
    recordByTypingSub: "नागरिक ने जो बताया वो टाइप करें",
    recordByVoice: "आवाज़ से दर्ज करें",
    recordByVoiceSub: "नागरिक बोलें — आप रिकॉर्ड करें",
    trackComplaint: "शिकायत ट्रैक करें",
    trackComplaintSub: "टिकट ID से स्थिति जांचें",
    back: "← वापस",
    citizenName: "नागरिक का नाम (वैकल्पिक)",
    citizenPhone: "नागरिक का फ़ोन (वैकल्पिक)",
    citizenNamePlaceholder: "जैसे Prince Kumar",
    citizenPhonePlaceholder: "जैसे 98765 43210",
    spokenLanguage: "बोली जाने वाली भाषा",
    preAssignDept: "विभाग पूर्व-निर्धारित करें",
    letAIDecide: "AI तय करे",
    autoDetect: "🤖 स्वतः पहचानें",
    citizenStatement: "नागरिक का बयान",
    citizenStatementPlaceholder: "नागरिक ने जो बताया उसका विवरण दें…",
    locationRequired: "📍 नागरिक का स्थान",
    locationRequiredBadge: "* आवश्यक",
    fetchingLocation: "⏳ स्थान प्राप्त हो रहा है…",
    locationCaptured: "✅",
    tapToCapture: "📍 नागरिक का स्थान कैप्चर करें",
    locationMandatory: "दर्ज करने से पहले स्थान अनिवार्य है।",
    attachEvidence: "📎 साक्ष्य संलग्न करें",
    startVoice: "🎤 आवाज़ कैप्चर शुरू करें",
    stopVoice: "⏹ कैप्चर रोकें",
    capturingVoice: "नागरिक की आवाज़ रिकॉर्ड हो रही है…",
    filingRouting: "दर्ज और रूट किया जा रहा है…",
    captureToEnable: "📍 दर्ज करने के लिए स्थान कैप्चर करें",
    fileGrievance: "नागरिक की ओर से शिकायत दर्ज करें",
    requiredBefore: "दर्ज करने से पहले आवश्यक",
    statementRecorded: "नागरिक का बयान दर्ज",
    locationCapturedReq: "नागरिक का स्थान कैप्चर किया गया",
    grievanceFiledSuccess: "शिकायत सफलतापूर्वक दर्ज हुई",
    grievanceFiledSuccessSub: "दर्ज और रूट किया गया। नागरिक को कोई और कार्रवाई आवश्यक नहीं।",
    ticketId: "टिकट ID",
    filedOn: "दर्ज तिथि",
    department: "🏢 विभाग",
    priority: "प्राथमिकता",
    language: "🌐 भाषा",
    complaintFiled: "📄 दर्ज शिकायत",
    resolutionCommitted: "समाधान की प्रतिबद्धता",
    copyTicketId: "📋 टिकट ID कॉपी करें",
    copied: "✅ कॉपी हो गया!",
    fileAnother: "＋ और शिकायत दर्ज करें",
    trackTitle: "शिकायत ट्रैक करें",
    trackSub: "स्थिति जांचने के लिए टिकट ID दर्ज करें",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "खोज रहे हैं…",
    track: "🔍 ट्रैक करें",
    enterTicketId: "कृपया टिकट ID दर्ज करें।",
    ticketNotFound: "टिकट नहीं मिली। कृपया ID जांचें।",
    assignedTo: "🔔 नियुक्त",
    escalationChain: "📶 एस्केलेशन श्रृंखला",
    statusHistory: "📋 स्थिति इतिहास",
    languageVotes: "🗳️ भाषा पहचान मत",
    complaintOnRecord: "📄 दर्ज शिकायत",
    slaDeadline: "SLA समय सीमा",
    confidence: "🔍 विश्वास",
    filed: "दर्ज:",
    recordByTypingFull: "टाइप करके दर्ज करें",
    recordByVoiceFull: "आवाज़ से दर्ज करें",
    recordAndFile: "नागरिकों की ओर से समस्याएं दर्ज करें",
    allLanguages: "सभी 22 अनुसूचित भारतीय भाषाएँ + स्वतः",
    autoDetectLabel: "🤖 भाषा स्वतः पहचानें",
    autoDetectSub: "AI भाषा पहचानेगी",
  },
  Telugu: {
    operatorPortal: "ఆపరేటర్ పోర్టల్",
    heroTitle: "ఆపరేటర్ ఫిర్యాదు పోర్టల్",
    heroSub: "పౌరుల తరఫున సమస్యలు నమోదు చేయండి",
    recordByTyping: "టైప్ చేసి నమోదు చేయండి",
    recordByTypingSub: "పౌరుడు చెప్పింది టైప్ చేయండి",
    recordByVoice: "వాయిస్ ద్వారా నమోదు",
    recordByVoiceSub: "పౌరుడు మాట్లాడనివ్వండి — మీరు రికార్డ్ చేయండి",
    trackComplaint: "ఫిర్యాదు ట్రాక్ చేయండి",
    trackComplaintSub: "టికెట్ ID తో స్థితి తనిఖీ చేయండి",
    back: "← వెనక్కి",
    citizenName: "పౌరుని పేరు (ఐచ్ఛికం)",
    citizenPhone: "పౌరుని ఫోన్ (ఐచ్ఛికం)",
    citizenNamePlaceholder: "ఉదా: Prince Kumar",
    citizenPhonePlaceholder: "ఉదా: 98765 43210",
    spokenLanguage: "మాట్లాడే భాష",
    preAssignDept: "విభాగం ముందుగా నిర్ణయించండి",
    letAIDecide: "AI నిర్ణయించనివ్వండి",
    autoDetect: "🤖 స్వయంచాలక గుర్తింపు",
    citizenStatement: "పౌరుని వివరణ",
    citizenStatementPlaceholder: "పౌరుడు నివేదించినది వివరించండి…",
    locationRequired: "📍 పౌరుని స్థానం",
    locationRequiredBadge: "* అవసరం",
    fetchingLocation: "⏳ స్థానం పొందుతోంది…",
    locationCaptured: "✅",
    tapToCapture: "📍 పౌరుని స్థానం క్యాప్చర్ చేయండి",
    locationMandatory: "నమోదు చేయడానికి ముందు స్థానం తప్పనిసరి.",
    attachEvidence: "📎 సాక్ష్యం జోడించండి",
    startVoice: "🎤 వాయిస్ క్యాప్చర్ ప్రారంభించండి",
    stopVoice: "⏹ క్యాప్చర్ ఆపండి",
    capturingVoice: "పౌరుని వాయిస్ రికార్డ్ అవుతోంది…",
    filingRouting: "నమోదు & రూటింగ్ జరుగుతోంది…",
    captureToEnable: "📍 నమోదు చేయడానికి స్థానం క్యాప్చర్ చేయండి",
    fileGrievance: "పౌరుని తరఫున ఫిర్యాదు నమోదు చేయండి",
    requiredBefore: "నమోదు చేయడానికి ముందు అవసరం",
    statementRecorded: "పౌరుని వివరణ నమోదైంది",
    locationCapturedReq: "పౌరుని స్థానం క్యాప్చర్ అయింది",
    grievanceFiledSuccess: "ఫిర్యాదు విజయవంతంగా నమోదైంది",
    grievanceFiledSuccessSub: "నమోదు మరియు రూట్ అయింది. పౌరునికి మరింత చర్య అవసరం లేదు.",
    ticketId: "టికెట్ ID",
    filedOn: "నమోదు తేదీ",
    department: "🏢 విభాగం",
    priority: "ప్రాధాన్యత",
    language: "🌐 భాష",
    complaintFiled: "📄 నమోదైన ఫిర్యాదు",
    resolutionCommitted: "పరిష్కార నిబద్ధత",
    copyTicketId: "📋 టికెట్ ID కాపీ చేయండి",
    copied: "✅ కాపీ అయింది!",
    fileAnother: "＋ మరో ఫిర్యాదు నమోదు చేయండి",
    trackTitle: "ఫిర్యాదు ట్రాక్ చేయండి",
    trackSub: "స్థితి తనిఖీ చేయడానికి టికెట్ ID నమోదు చేయండి",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "వెతుకుతోంది…",
    track: "🔍 ట్రాక్",
    enterTicketId: "దయచేసి టికెట్ ID నమోదు చేయండి.",
    ticketNotFound: "టికెట్ కనుగొనబడలేదు. దయచేసి ID తనిఖీ చేయండి.",
    assignedTo: "🔔 నియమించబడింది",
    escalationChain: "📶 ఎస్కలేషన్ చైన్",
    statusHistory: "📋 స్థితి చరిత్ర",
    languageVotes: "🗳️ భాష గుర్తింపు ఓట్లు",
    complaintOnRecord: "📄 నమోదైన ఫిర్యాదు",
    slaDeadline: "SLA గడువు",
    confidence: "🔍 విశ్వాసం",
    filed: "నమోదు:",
    recordByTypingFull: "టైప్ చేసి నమోదు",
    recordByVoiceFull: "వాయిస్ ద్వారా నమోదు",
    recordAndFile: "పౌరుల తరఫున సమస్యలు నమోదు చేయండి",
    allLanguages: "అన్ని 22 షెడ్యూల్డ్ భారతీయ భాషలు + స్వయంచాలక",
    autoDetectLabel: "🤖 భాష స్వయంచాలకంగా గుర్తించండి",
    autoDetectSub: "AI భాషను గుర్తిస్తుంది",
  },
  Tamil: {
    operatorPortal: "ஆபரேட்டர் போர்டல்",
    heroTitle: "ஆபரேட்டர் குறை தீர்வு போர்டல்",
    heroSub: "குடிமக்கள் சார்பில் பிரச்சினைகளை பதிவு செய்யுங்கள்",
    recordByTyping: "தட்டச்சு செய்து பதிவு",
    recordByTypingSub: "குடிமகன் சொன்னதை தட்டச்சு செய்யுங்கள்",
    recordByVoice: "குரல் மூலம் பதிவு",
    recordByVoiceSub: "குடிமகன் பேசட்டும் — நீங்கள் பதிவு செய்யுங்கள்",
    trackComplaint: "புகாரை கண்காணிக்க",
    trackComplaintSub: "டிக்கெட் ID மூலம் நிலை சரிபார்க்கவும்",
    back: "← பின்னால்",
    citizenName: "குடிமகன் பெயர் (விரும்பினால்)",
    citizenPhone: "குடிமகன் தொலைபேசி (விரும்பினால்)",
    citizenNamePlaceholder: "எ.கா. Prince Kumar",
    citizenPhonePlaceholder: "எ.கா. 98765 43210",
    spokenLanguage: "பேசும் மொழி",
    preAssignDept: "துறையை முன்கூட்டியே நியமிக்கவும்",
    letAIDecide: "AI முடிவு செய்யட்டும்",
    autoDetect: "🤖 தானாக கண்டறி",
    citizenStatement: "குடிமகன் கூற்று",
    citizenStatementPlaceholder: "குடிமகன் தெரிவித்ததை விவரிக்கவும்…",
    locationRequired: "📍 குடிமகன் இடம்",
    locationRequiredBadge: "* தேவை",
    fetchingLocation: "⏳ இடம் பெறப்படுகிறது…",
    locationCaptured: "✅",
    tapToCapture: "📍 குடிமகன் இடத்தை பதிவு செய்யவும்",
    locationMandatory: "பதிவு செய்வதற்கு முன் இடம் கட்டாயம்.",
    attachEvidence: "📎 ஆதாரம் இணைக்கவும்",
    startVoice: "🎤 குரல் பதிவு தொடங்கு",
    stopVoice: "⏹ பதிவை நிறுத்து",
    capturingVoice: "குடிமகன் குரல் பதிவாகிறது…",
    filingRouting: "பதிவு மற்றும் திசைதிருப்பல்…",
    captureToEnable: "📍 பதிவு செய்ய இடத்தை பதிவு செய்யவும்",
    fileGrievance: "குடிமகன் சார்பில் குறை பதிவு செய்யவும்",
    requiredBefore: "பதிவு செய்வதற்கு முன் தேவை",
    statementRecorded: "குடிமகன் கூற்று பதிவாயிற்று",
    locationCapturedReq: "குடிமகன் இடம் பதிவாயிற்று",
    grievanceFiledSuccess: "குறை வெற்றிகரமாக பதிவாயிற்று",
    grievanceFiledSuccessSub: "பதிவு மற்றும் திசைதிருப்பல் ஆயிற்று. குடிமகனுக்கு மேலும் நடவடிக்கை தேவையில்லை.",
    ticketId: "டிக்கெட் ID",
    filedOn: "பதிவு தேதி",
    department: "🏢 துறை",
    priority: "முன்னுரிமை",
    language: "🌐 மொழி",
    complaintFiled: "📄 பதிவான புகார்",
    resolutionCommitted: "தீர்வு உறுதிமொழி",
    copyTicketId: "📋 டிக்கெட் ID நகலெடு",
    copied: "✅ நகலெடுக்கப்பட்டது!",
    fileAnother: "＋ மேலும் ஒரு குறை பதிவு",
    trackTitle: "புகாரை கண்காணிக்க",
    trackSub: "நிலை சரிபார்க்க டிக்கெட் ID உள்ளிடவும்",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "தேடுகிறது…",
    track: "🔍 கண்காணி",
    enterTicketId: "டிக்கெட் ID உள்ளிடவும்.",
    ticketNotFound: "டிக்கெட் கிடைக்கவில்லை. ID சரிபார்க்கவும்.",
    assignedTo: "🔔 நியமிக்கப்பட்டது",
    escalationChain: "📶 அதிகரிப்பு சங்கிலி",
    statusHistory: "📋 நிலை வரலாறு",
    languageVotes: "🗳️ மொழி கண்டறிதல் வாக்குகள்",
    complaintOnRecord: "📄 பதிவான புகார்",
    slaDeadline: "SLA காலக்கெடு",
    confidence: "🔍 நம்பகத்தன்மை",
    filed: "பதிவு:",
    recordByTypingFull: "தட்டச்சு மூலம் பதிவு",
    recordByVoiceFull: "குரல் மூலம் பதிவு",
    recordAndFile: "குடிமக்கள் சார்பில் பிரச்சினைகளை பதிவு செய்யுங்கள்",
    allLanguages: "அனைத்து 22 அட்டவணை இந்திய மொழிகள் + தானியங்கி",
    autoDetectLabel: "🤖 மொழியை தானாக கண்டறி",
    autoDetectSub: "AI மொழியை அடையாளம் காணும்",
  },
  Kannada: {
    operatorPortal: "ಆಪರೇಟರ್ ಪೋರ್ಟಲ್",
    heroTitle: "ಆಪರೇಟರ್ ದೂರು ಪೋರ್ಟಲ್",
    heroSub: "ನಾಗರಿಕರ ಪರವಾಗಿ ಸಮಸ್ಯೆಗಳನ್ನು ದಾಖಲಿಸಿ",
    recordByTyping: "ಟೈಪ್ ಮಾಡಿ ದಾಖಲಿಸಿ",
    recordByTypingSub: "ನಾಗರಿಕರು ಹೇಳಿದ್ದನ್ನು ಟೈಪ್ ಮಾಡಿ",
    recordByVoice: "ಧ್ವನಿ ಮೂಲಕ ದಾಖಲಿಸಿ",
    recordByVoiceSub: "ನಾಗರಿಕರು ಮಾತನಾಡಲಿ — ನೀವು ರೆಕಾರ್ಡ್ ಮಾಡಿ",
    trackComplaint: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    trackComplaintSub: "ಟಿಕೆಟ್ ID ಮೂಲಕ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ",
    back: "← ಹಿಂದೆ",
    citizenName: "ನಾಗರಿಕರ ಹೆಸರು (ಐಚ್ಛಿಕ)",
    citizenPhone: "ನಾಗರಿಕರ ಫೋನ್ (ಐಚ್ಛಿಕ)",
    citizenNamePlaceholder: "ಉದಾ: Prince Kumar",
    citizenPhonePlaceholder: "ಉದಾ: 98765 43210",
    spokenLanguage: "ಮಾತನಾಡುವ ಭಾಷೆ",
    preAssignDept: "ವಿಭಾಗ ಮುಂದಾಗಿ ನಿರ್ಧರಿಸಿ",
    letAIDecide: "AI ನಿರ್ಧರಿಸಲಿ",
    autoDetect: "🤖 ಸ್ವಯಂ ಪತ್ತೆ",
    citizenStatement: "ನಾಗರಿಕರ ಹೇಳಿಕೆ",
    citizenStatementPlaceholder: "ನಾಗರಿಕರು ವರದಿ ಮಾಡಿದ್ದನ್ನು ವಿವರಿಸಿ…",
    locationRequired: "📍 ನಾಗರಿಕರ ಸ್ಥಳ",
    locationRequiredBadge: "* ಅಗತ್ಯ",
    fetchingLocation: "⏳ ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ…",
    locationCaptured: "✅",
    tapToCapture: "📍 ನಾಗರಿಕರ ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿ",
    locationMandatory: "ದಾಖಲಿಸಲು ಮೊದಲು ಸ್ಥಳ ಕಡ್ಡಾಯ.",
    attachEvidence: "📎 ಸಾಕ್ಷ್ಯ ಲಗತ್ತಿಸಿ",
    startVoice: "🎤 ಧ್ವನಿ ಕ್ಯಾಪ್ಚರ್ ಪ್ರಾರಂಭಿಸಿ",
    stopVoice: "⏹ ಕ್ಯಾಪ್ಚರ್ ನಿಲ್ಲಿಸಿ",
    capturingVoice: "ನಾಗರಿಕರ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ…",
    filingRouting: "ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ…",
    captureToEnable: "📍 ದಾಖಲಿಸಲು ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಮಾಡಿ",
    fileGrievance: "ನಾಗರಿಕರ ಪರವಾಗಿ ದೂರು ದಾಖಲಿಸಿ",
    requiredBefore: "ದಾಖಲಿಸಲು ಮೊದಲು ಅಗತ್ಯ",
    statementRecorded: "ನಾಗರಿಕರ ಹೇಳಿಕೆ ದಾಖಲಾಗಿದೆ",
    locationCapturedReq: "ನಾಗರಿಕರ ಸ್ಥಳ ಕ್ಯಾಪ್ಚರ್ ಆಗಿದೆ",
    grievanceFiledSuccess: "ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ",
    grievanceFiledSuccessSub: "ದಾಖಲಿಸಲಾಗಿದೆ ಮತ್ತು ರೂಟ್ ಮಾಡಲಾಗಿದೆ.",
    ticketId: "ಟಿಕೆಟ್ ID",
    filedOn: "ದಾಖಲಾದ ದಿನಾಂಕ",
    department: "🏢 ವಿಭಾಗ",
    priority: "ಆದ್ಯತೆ",
    language: "🌐 ಭಾಷೆ",
    complaintFiled: "📄 ದಾಖಲಾದ ದೂರು",
    resolutionCommitted: "ಪರಿಹಾರ ಬದ್ಧತೆ",
    copyTicketId: "📋 ಟಿಕೆಟ್ ID ನಕಲಿಸಿ",
    copied: "✅ ನಕಲಿಸಲಾಗಿದೆ!",
    fileAnother: "＋ ಮತ್ತೊಂದು ದೂರು ದಾಖಲಿಸಿ",
    trackTitle: "ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    trackSub: "ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು ಟಿಕೆಟ್ ID ನಮೂದಿಸಿ",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
    track: "🔍 ಟ್ರ್ಯಾಕ್",
    enterTicketId: "ಟಿಕೆಟ್ ID ನಮೂದಿಸಿ.",
    ticketNotFound: "ಟಿಕೆಟ್ ಕಂಡುಬಂದಿಲ್ಲ. ID ಪರಿಶೀಲಿಸಿ.",
    assignedTo: "🔔 ನಿಯೋಜಿಸಲಾಗಿದೆ",
    escalationChain: "📶 ಎಸ್ಕಲೇಶನ್ ಸರಪಳಿ",
    statusHistory: "📋 ಸ್ಥಿತಿ ಇತಿಹಾಸ",
    languageVotes: "🗳️ ಭಾಷಾ ಗುರುತಿಸುವಿಕೆ ಮತಗಳು",
    complaintOnRecord: "📄 ದಾಖಲಾದ ದೂರು",
    slaDeadline: "SLA ಗಡುವು",
    confidence: "🔍 ವಿಶ್ವಾಸ",
    filed: "ದಾಖಲಾಗಿದೆ:",
    recordByTypingFull: "ಟೈಪ್ ಮೂಲಕ ದಾಖಲಿಸಿ",
    recordByVoiceFull: "ಧ್ವನಿ ಮೂಲಕ ದಾಖಲಿಸಿ",
    recordAndFile: "ನಾಗರಿಕರ ಪರವಾಗಿ ಸಮಸ್ಯೆಗಳನ್ನು ದಾಖಲಿಸಿ",
    allLanguages: "ಎಲ್ಲ 22 ಭಾರತೀಯ ಭಾಷೆಗಳು + ಸ್ವಯಂ",
    autoDetectLabel: "🤖 ಭಾಷೆಯನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆ ಮಾಡಿ",
    autoDetectSub: "AI ಭಾಷೆಯನ್ನು ಗುರುತಿಸುತ್ತದೆ",
  },
  Bengali: {
    operatorPortal: "অপারেটর পোর্টাল",
    heroTitle: "অপারেটর অভিযোগ পোর্টাল",
    heroSub: "নাগরিকদের পক্ষ থেকে সমস্যা নথিভুক্ত করুন",
    recordByTyping: "টাইপ করে নথিভুক্ত",
    recordByTypingSub: "নাগরিক যা বলেছেন তা টাইপ করুন",
    recordByVoice: "কণ্ঠস্বর দিয়ে নথিভুক্ত",
    recordByVoiceSub: "নাগরিককে কথা বলতে দিন — আপনি রেকর্ড করুন",
    trackComplaint: "অভিযোগ ট্র্যাক করুন",
    trackComplaintSub: "টিকিট ID দিয়ে অবস্থা পরীক্ষা করুন",
    back: "← পিছনে",
    citizenName: "নাগরিকের নাম (ঐচ্ছিক)",
    citizenPhone: "নাগরিকের ফোন (ঐচ্ছিক)",
    citizenNamePlaceholder: "যেমন Prince Kumar",
    citizenPhonePlaceholder: "যেমন 98765 43210",
    spokenLanguage: "কথ্য ভাষা",
    preAssignDept: "বিভাগ পূর্বনির্ধারণ করুন",
    letAIDecide: "AI সিদ্ধান্ত নিক",
    autoDetect: "🤖 স্বয়ংক্রিয় সনাক্ত",
    citizenStatement: "নাগরিকের বিবৃতি",
    citizenStatementPlaceholder: "নাগরিক কী জানিয়েছেন তা বর্ণনা করুন…",
    locationRequired: "📍 নাগরিকের অবস্থান",
    locationRequiredBadge: "* প্রয়োজন",
    fetchingLocation: "⏳ অবস্থান নেওয়া হচ্ছে…",
    locationCaptured: "✅",
    tapToCapture: "📍 নাগরিকের অবস্থান ক্যাপচার করুন",
    locationMandatory: "নথিভুক্তির আগে অবস্থান আবশ্যক।",
    attachEvidence: "📎 প্রমাণ সংযুক্ত করুন",
    startVoice: "🎤 কণ্ঠস্বর ক্যাপচার শুরু করুন",
    stopVoice: "⏹ ক্যাপচার বন্ধ করুন",
    capturingVoice: "নাগরিকের কণ্ঠস্বর রেকর্ড হচ্ছে…",
    filingRouting: "নথিভুক্ত ও রুট করা হচ্ছে…",
    captureToEnable: "📍 নথিভুক্তি সক্ষম করতে অবস্থান ক্যাপচার করুন",
    fileGrievance: "নাগরিকের পক্ষে অভিযোগ দাখিল করুন",
    requiredBefore: "নথিভুক্তির আগে প্রয়োজন",
    statementRecorded: "নাগরিকের বিবৃতি নথিভুক্ত",
    locationCapturedReq: "নাগরিকের অবস্থান ক্যাপচার হয়েছে",
    grievanceFiledSuccess: "অভিযোগ সফলভাবে দাখিল হয়েছে",
    grievanceFiledSuccessSub: "নথিভুক্ত ও রুট করা হয়েছে। নাগরিকের আর কোনো পদক্ষেপ প্রয়োজন নেই।",
    ticketId: "টিকিট ID",
    filedOn: "দাখিলের তারিখ",
    department: "🏢 বিভাগ",
    priority: "অগ্রাধিকার",
    language: "🌐 ভাষা",
    complaintFiled: "📄 দাখিলকৃত অভিযোগ",
    resolutionCommitted: "সমাধানের প্রতিশ্রুতি",
    copyTicketId: "📋 টিকিট ID কপি করুন",
    copied: "✅ কপি হয়েছে!",
    fileAnother: "＋ আরেকটি অভিযোগ দাখিল করুন",
    trackTitle: "অভিযোগ ট্র্যাক করুন",
    trackSub: "অবস্থা পরীক্ষা করতে টিকিট ID লিখুন",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "খোঁজা হচ্ছে…",
    track: "🔍 ট্র্যাক",
    enterTicketId: "টিকিট ID লিখুন।",
    ticketNotFound: "টিকিট পাওয়া যায়নি। ID পরীক্ষা করুন।",
    assignedTo: "🔔 নিযুক্ত",
    escalationChain: "📶 এস্কেলেশন চেইন",
    statusHistory: "📋 অবস্থার ইতিহাস",
    languageVotes: "🗳️ ভাষা সনাক্তকরণ ভোট",
    complaintOnRecord: "📄 নথিভুক্ত অভিযোগ",
    slaDeadline: "SLA সময়সীমা",
    confidence: "🔍 আস্থা",
    filed: "দাখিল:",
    recordByTypingFull: "টাইপ করে নথিভুক্ত",
    recordByVoiceFull: "কণ্ঠস্বর দিয়ে নথিভুক্ত",
    recordAndFile: "নাগরিকদের পক্ষ থেকে সমস্যা নথিভুক্ত করুন",
    allLanguages: "সমস্ত ২২টি তফসিলি ভারতীয় ভাষা + স্বয়ংক্রিয়",
    autoDetectLabel: "🤖 ভাষা স্বয়ংক্রিয়ভাবে সনাক্ত করুন",
    autoDetectSub: "AI ভাষা শনাক্ত করবে",
  },
  Marathi: {
    operatorPortal: "ऑपरेटर पोर्टल",
    heroTitle: "ऑपरेटर तक्रार पोर्टल",
    heroSub: "नागरिकांच्या वतीने समस्या नोंदवा",
    recordByTyping: "टाइप करून नोंदवा",
    recordByTypingSub: "नागरिकाने सांगितलेले टाइप करा",
    recordByVoice: "आवाजाने नोंदवा",
    recordByVoiceSub: "नागरिकाला बोलू द्या — तुम्ही रेकॉर्ड करा",
    trackComplaint: "तक्रार ट्रॅक करा",
    trackComplaintSub: "तिकीट ID ने स्थिती तपासा",
    back: "← मागे",
    citizenName: "नागरिकाचे नाव (पर्यायी)",
    citizenPhone: "नागरिकाचा फोन (पर्यायी)",
    citizenNamePlaceholder: "उदा. Prince Kumar",
    citizenPhonePlaceholder: "उदा. 98765 43210",
    spokenLanguage: "बोलली जाणारी भाषा",
    preAssignDept: "विभाग आधीच ठरवा",
    letAIDecide: "AI ठरवू द्या",
    autoDetect: "🤖 स्वयं ओळखा",
    citizenStatement: "नागरिकाचे निवेदन",
    citizenStatementPlaceholder: "नागरिकाने सांगितलेले वर्णन करा…",
    locationRequired: "📍 नागरिकाचे स्थान",
    locationRequiredBadge: "* आवश्यक",
    fetchingLocation: "⏳ स्थान मिळवत आहे…",
    locationCaptured: "✅",
    tapToCapture: "📍 नागरिकाचे स्थान कॅप्चर करा",
    locationMandatory: "नोंदणीपूर्वी स्थान अनिवार्य आहे.",
    attachEvidence: "📎 पुरावा जोडा",
    startVoice: "🎤 आवाज कॅप्चर सुरू करा",
    stopVoice: "⏹ कॅप्चर थांबवा",
    capturingVoice: "नागरिकाचा आवाज रेकॉर्ड होत आहे…",
    filingRouting: "नोंदवत आणि पाठवत आहे…",
    captureToEnable: "📍 नोंदणीसाठी स्थान कॅप्चर करा",
    fileGrievance: "नागरिकाच्या वतीने तक्रार दाखल करा",
    requiredBefore: "नोंदणीपूर्वी आवश्यक",
    statementRecorded: "नागरिकाचे निवेदन नोंदवले",
    locationCapturedReq: "नागरिकाचे स्थान कॅप्चर झाले",
    grievanceFiledSuccess: "तक्रार यशस्वीरित्या दाखल",
    grievanceFiledSuccessSub: "नोंदवले आणि मार्गस्थ केले. नागरिकाला आणखी कारवाई आवश्यक नाही.",
    ticketId: "तिकीट ID",
    filedOn: "दाखल तारीख",
    department: "🏢 विभाग",
    priority: "प्राधान्य",
    language: "🌐 भाषा",
    complaintFiled: "📄 दाखल तक्रार",
    resolutionCommitted: "निराकरण वचनबद्धता",
    copyTicketId: "📋 तिकीट ID कॉपी करा",
    copied: "✅ कॉपी झाले!",
    fileAnother: "＋ आणखी एक तक्रार दाखल करा",
    trackTitle: "तक्रार ट्रॅक करा",
    trackSub: "स्थिती तपासण्यासाठी तिकीट ID टाका",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "शोधत आहे…",
    track: "🔍 ट्रॅक",
    enterTicketId: "तिकीट ID टाका.",
    ticketNotFound: "तिकीट सापडले नाही. ID तपासा.",
    assignedTo: "🔔 नियुक्त",
    escalationChain: "📶 एस्केलेशन साखळी",
    statusHistory: "📋 स्थिती इतिहास",
    languageVotes: "🗳️ भाषा ओळख मते",
    complaintOnRecord: "📄 नोंदवलेली तक्रार",
    slaDeadline: "SLA अंतिम मुदत",
    confidence: "🔍 विश्वास",
    filed: "दाखल:",
    recordByTypingFull: "टाइप करून नोंदवा",
    recordByVoiceFull: "आवाजाने नोंदवा",
    recordAndFile: "नागरिकांच्या वतीने समस्या नोंदवा",
    allLanguages: "सर्व २२ अनुसूचित भारतीय भाषा + स्वयं",
    autoDetectLabel: "🤖 भाषा स्वयंचलितपणे ओळखा",
    autoDetectSub: "AI भाषा ओळखेल",
  },
  Odia: {
    operatorPortal: "ଅପରେଟର ପୋର୍ଟାଲ",
    heroTitle: "ଅପରେଟର ଅଭିଯୋଗ ପୋର୍ଟାଲ",
    heroSub: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ସମସ୍ୟା ଦାଖଲ କରନ୍ତୁ",
    recordByTyping: "ଟାଇପ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordByTypingSub: "ନାଗରିକ ଯାହା ଜଣାଇଛନ୍ତି ଟାଇପ୍ କରନ୍ତୁ",
    recordByVoice: "ଭଏସ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordByVoiceSub: "ନାଗରିକଙ୍କୁ ବୋଲିବାକୁ ଦିଅନ୍ତୁ",
    trackComplaint: "ଅଭିଯୋଗ ଟ୍ରାକ୍ କରନ୍ତୁ",
    trackComplaintSub: "ଟିକେଟ ID ଦ୍ୱାରା ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ",
    back: "← ପଛକୁ",
    citizenName: "ନାଗରିକଙ୍କ ନାମ (ଐଚ୍ଛିକ)",
    citizenPhone: "ନାଗରିକଙ୍କ ଫୋନ୍ (ଐଚ୍ଛିକ)",
    citizenNamePlaceholder: "ଯଥା: Prince Kumar",
    citizenPhonePlaceholder: "ଯଥା: 98765 43210",
    spokenLanguage: "ବ୍ୟବହୃତ ଭାଷା",
    preAssignDept: "ବିଭାଗ ପୂର୍ବ ନିର୍ଦ୍ଧାରଣ",
    letAIDecide: "AI ସ୍ଥିର କରୁ",
    autoDetect: "🤖 ସ୍ୱୟଂ ଚିହ୍ନଟ",
    citizenStatement: "ନାଗରିକଙ୍କ ବିବୃତ୍ତି",
    citizenStatementPlaceholder: "ନାଗରିକ ଯାହା ଜଣାଇଛନ୍ତି ବର୍ଣ୍ଣନା କରନ୍ତୁ…",
    locationRequired: "📍 ନାଗରିକଙ୍କ ଅବସ୍ଥାନ",
    locationRequiredBadge: "* ଆବଶ୍ୟକ",
    fetchingLocation: "⏳ ଅବସ୍ଥାନ ଆଣୁଛି…",
    locationCaptured: "✅",
    tapToCapture: "📍 ନାଗରିକଙ୍କ ଅବସ୍ଥାନ ଗ୍ରହଣ କରନ୍ତୁ",
    locationMandatory: "ଦାଖଲ ପୂର୍ବରୁ ଅବସ୍ଥାନ ବାଧ୍ୟତାମୂଳକ।",
    attachEvidence: "📎 ସାକ୍ଷ୍ୟ ସଂଲଗ୍ନ କରନ୍ତୁ",
    startVoice: "🎤 ଭଏସ୍ ଗ୍ରହଣ ଆରମ୍ଭ",
    stopVoice: "⏹ ଗ୍ରହଣ ବନ୍ଦ",
    capturingVoice: "ନାଗରିକଙ୍କ ଭଏସ୍ ରେକର୍ଡ ହେଉଛି…",
    filingRouting: "ଦାଖଲ ହେଉଛି…",
    captureToEnable: "📍 ଦାଖଲ ପାଇଁ ଅବସ୍ଥାନ ଗ୍ରହଣ କରନ୍ତୁ",
    fileGrievance: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ଅଭିଯୋଗ ଦାଖଲ",
    requiredBefore: "ଦାଖଲ ପୂର୍ବରୁ ଆବଶ୍ୟକ",
    statementRecorded: "ନାଗରିକଙ୍କ ବିବୃତ୍ତି ଦାଖଲ",
    locationCapturedReq: "ଅବସ୍ଥାନ ଗ୍ରହଣ ହୋଇଛି",
    grievanceFiledSuccess: "ଅଭିଯୋଗ ସଫଳତାର ସହ ଦାଖଲ",
    grievanceFiledSuccessSub: "ଦାଖଲ ଓ ରୁଟ୍ ହୋଇଛି। ନାଗରିକଙ୍କ ଆଉ କ୍ରିୟା ଆବଶ୍ୟକ ନୁହେଁ।",
    ticketId: "ଟିକେଟ ID",
    filedOn: "ଦାଖଲ ତାରିଖ",
    department: "🏢 ବିଭାଗ",
    priority: "ଅଗ୍ରାଧିକାର",
    language: "🌐 ଭାଷା",
    complaintFiled: "📄 ଦାଖଲ ଅଭିଯୋଗ",
    resolutionCommitted: "ସମାଧାନ ପ୍ରତିଶ୍ରୁତି",
    copyTicketId: "📋 ଟିକେଟ ID ନକଲ",
    copied: "✅ ନକଲ ହୋଇଛି!",
    fileAnother: "＋ ଆଉ ଏକ ଅଭିଯୋଗ ଦାଖଲ",
    trackTitle: "ଅଭିଯୋଗ ଟ୍ରାକ୍",
    trackSub: "ଟିକେଟ ID ଦ୍ୱାରା ସ୍ଥିତି ଯାଞ୍ଚ",
    ticketPlaceholder: "JV-XXXXXXXX",
    searching: "ଖୋଜୁଛି…",
    track: "🔍 ଟ୍ରାକ୍",
    enterTicketId: "ଟିକେଟ ID ଦିଅନ୍ତୁ।",
    ticketNotFound: "ଟିକେଟ ମିଳିଲାନି। ID ଯାଞ୍ଚ କରନ୍ତୁ।",
    assignedTo: "🔔 ନ୍ୟସ୍ତ",
    escalationChain: "📶 ଏସ୍କାଲେଶନ ଚେନ",
    statusHistory: "📋 ସ୍ଥିତି ଇତିହାସ",
    languageVotes: "🗳️ ଭାଷା ଚିହ୍ନଟ ଭୋଟ",
    complaintOnRecord: "📄 ଦାଖଲ ଅଭିଯୋଗ",
    slaDeadline: "SLA ସୀମା",
    confidence: "🔍 ବିଶ୍ୱାସ",
    filed: "ଦାଖଲ:",
    recordByTypingFull: "ଟାଇପ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordByVoiceFull: "ଭଏସ୍ ଦ୍ୱାରା ଦାଖଲ",
    recordAndFile: "ନାଗରିକଙ୍କ ପକ୍ଷରୁ ଅଭିଯୋଗ ଦାଖଲ",
    allLanguages: "ସମସ୍ତ ୨୨ ଅନୁସୂଚିତ ଭାରତୀୟ ଭାଷା + ସ୍ୱୟଂ",
    autoDetectLabel: "🤖 ଭାଷା ସ୍ୱୟଂ ଚିହ୍ନଟ",
    autoDetectSub: "AI ଭାଷା ଚିହ୍ନଟ କରିବ",
  },
};

const t = (lang, key) => {
  const langStrings = UI_STRINGS[lang] || UI_STRINGS["English"];
  return langStrings[key] || UI_STRINGS["English"][key] || key;
};

// ── All 22 Scheduled Indian Languages ────────
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
  { code: "Maithili",  label: "मैथिली",         script: "Devanagari", bcp47: "mai" },
  { code: "Santali",   label: "ᱥᱟᱱᱛᱟᱲᱤ",       script: "Ol Chiki",   bcp47: "sat" },
  { code: "Kashmiri",  label: "کٲشُر",          script: "Nastaliq",   bcp47: "ks-IN" },
  { code: "Nepali",    label: "नेपाली",          script: "Devanagari", bcp47: "ne-IN" },
  { code: "Sindhi",    label: "سنڌي",           script: "Nastaliq",   bcp47: "sd" },
  { code: "Dogri",     label: "डोगरी",          script: "Devanagari", bcp47: "doi" },
  { code: "Konkani",   label: "कोंकणी",         script: "Devanagari", bcp47: "kok" },
  { code: "Manipuri",  label: "মৈতৈলোন্",       script: "Meitei",     bcp47: "mni" },
  { code: "Bodo",      label: "बड़ो",            script: "Devanagari", bcp47: "brx" },
  { code: "Sanskrit",  label: "संस्कृतम्",      script: "Devanagari", bcp47: "sa" },
];

// ── Script-based language detection ──────────
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
  "Water Supply & Sanitation","Electricity & Power","Roads & Infrastructure",
  "Public Health & Hospitals","Police & Law Enforcement","Municipal Solid Waste",
  "Education","Revenue & Land Records","Transport & Traffic","General Administration",
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

// ─────────────────────────────────────────────
export default function App() {
  const video1Ref      = useRef(null);
  const video2Ref      = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscript= useRef("");
  const isListeningRef = useRef(false);

  const [showFirst,       setShowFirst]       = useState(true);
  const [mode,            setMode]            = useState("none");
  const [uiLang,          setUiLang]          = useState("English");
  const [titleIdx,        setTitleIdx]        = useState(0);
  const [showLangPicker,  setShowLangPicker]  = useState(false);

  // Form
  const [citizenStatement, setCitizenStatement] = useState("");
  const [citizenName,      setCitizenName]      = useState("");
  const [citizenPhone,     setCitizenPhone]     = useState("");
  const [spokenLang,       setSpokenLang]       = useState("AUTO");
  const [department,       setDepartment]       = useState("Auto");
  const [location,         setLocation]         = useState(null);
  const [locationLabel,    setLocationLabel]    = useState(null);
  const [isFetchingLoc,    setIsFetchingLoc]    = useState(false);
  const [attachment,       setAttachment]       = useState(null);
  const [voiceStatus,      setVoiceStatus]      = useState("idle"); // idle | requesting | active | error

  // Voice
  const [listening,       setListening]       = useState(false);
  const [interimText,     setInterimText]     = useState("");
  const [voiceError,      setVoiceError]      = useState("");

  // Submission
  const [isAnalyzing,     setIsAnalyzing]     = useState(false);
  const [result,          setResult]          = useState(null);
  const [copied,          setCopied]          = useState(false);

  // Track
  const [trackId,         setTrackId]         = useState("");
  const [trackResult,     setTrackResult]     = useState(null);
  const [trackLoading,    setTrackLoading]    = useState(false);
  const [trackError,      setTrackError]      = useState("");

  // ── Video loop ──────────────────────────────
  const handleSwitch = () => {
    const next = showFirst ? video2Ref.current : video1Ref.current;
    if (next) { next.currentTime = 0; next.play(); setTimeout(() => setShowFirst(p => !p), 50); }
  };

  useEffect(() => {
    const id = setInterval(() => setTitleIdx(p => (p + 1) % JANVAANI_TITLES.length), 3500);
    return () => clearInterval(id);
  }, []);
  // ── Location ────────────────────────────────
  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) { 
      alert("Location is not supported by your browser."); 
      return; 
    }

    setIsFetchingLoc(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setLocation(`${lat},${lng}`);
        
        try {
          // Added accept-language to ensure consistent API responses
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`, { 
            headers: { "User-Agent": "JanVaani_App_v1" } 
          });
          
          if (!r.ok) throw new Error("Reverse geocoding failed");
          
          const d = await r.json();
          const a = d.address || {};
          const city  = a.city || a.town || a.village || a.county || a.state_district || a.state || `${lat},${lng}`;
          const state = a.state ? `, ${a.state}` : "";
          setLocationLabel(`${city}${state}`);
        } catch (error) { 
          console.error("Location name fetch error:", error);
          setLocationLabel(`${lat}, ${lng}`); // Fallback to raw coordinates
        } finally {
          setIsFetchingLoc(false); // Guarantee the loading spinner stops
        }
      },
      (error) => { 
        console.error("Geolocation Error:", error);
        let errorMsg = "Could not fetch location.";
        if (error.code === 1) errorMsg = "Location permission denied. Please allow it in your browser URL bar.";
        if (error.code === 2) errorMsg = "Position unavailable. Ensure your OS location services are turned on.";
        if (error.code === 3) errorMsg = "Location request timed out.";
        
        alert(errorMsg); 
        setIsFetchingLoc(false); 
      },
      { 
        enableHighAccuracy: false, // Changed to false: Prevents infinite hanging on desktops/laptops
        timeout: 15000,            // Increased timeout to 15 seconds
        maximumAge: 0 
      }
    );
  };

  // ── Voice Recognition (improved) ─────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setListening(false);
    setVoiceStatus("idle");
    setInterimText("");
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Speech recognition is not supported. Please use Google Chrome.");
      return;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    setVoiceError("");
    setVoiceStatus("requesting");
    isListeningRef.current = true;
    finalTranscript.current = citizenStatement; // preserve existing text

    const createRecognition = () => {
      const rec = new SR();
      recognitionRef.current = rec;

      // Set language based on spokenLang selection
      if (spokenLang === "AUTO") {
        rec.lang = "en-IN"; // start with English, will auto-switch based on detected script
      } else {
        const langObj = ALL_LANGS.find(l => l.code === spokenLang);
        rec.lang = langObj?.bcp47 || "en-IN";
      }

      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setListening(true);
        setVoiceStatus("active");
      };

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const chunk = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript.current += chunk + " ";
          } else {
            interim += chunk;
          }
        }
        const full = finalTranscript.current + interim;
        setCitizenStatement(full);
        setInterimText(interim);

        // Auto-detect language from script if AUTO mode
        if (spokenLang === "AUTO") {
          const detected = detectLangFromScript(full);
          // We just update UI hint, don't restart recognition for AUTO
        }
      };

      rec.onerror = (e) => {
        console.error("SR error:", e.error);
        if (e.error === "no-speech") {
          // Just a timeout, restart if still supposed to be listening
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { createRecognition(); } catch {}
              }
            }, 200);
          }
        } else if (e.error === "network") {
          setVoiceError("Network error. Check your internet connection.");
          stopListening();
        } else if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setVoiceError("Microphone permission denied. Please allow microphone access.");
          stopListening();
        } else if (e.error === "aborted") {
          // Normal stop, ignore
        } else {
          console.warn("SR error (non-critical):", e.error);
        }
      };

      rec.onend = () => {
        setInterimText("");
        // Auto-restart if still listening (handles browser cutting off after silence)
        if (isListeningRef.current) {
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                createRecognition();
              } catch (err) {
                console.error("Restart error:", err);
              }
            }
          }, 300);
        }
      };

      try {
        rec.start();
      } catch (err) {
        console.error("Could not start:", err);
        setVoiceError("Could not start microphone. Try clicking Start again.");
        setVoiceStatus("error");
        isListeningRef.current = false;
        setListening(false);
      }
    };

    createRecognition();
  }, [spokenLang, citizenStatement]);

  useEffect(() => { return () => stopListening(); }, []);

  // ── File grievance ───────────────────────────
  const fileGrievance = async () => {
    if (!citizenStatement.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      let evidenceBase64 = null;
      if (attachment) {
        evidenceBase64 = await new Promise((res, rej) => {
          const fr = new FileReader();
          fr.readAsDataURL(attachment);
          fr.onload  = () => res(fr.result);
          fr.onerror = rej;
        });
      }
      const resp = await fetch("http://127.0.0.1:4000/analyze", {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ text: citizenStatement, location, evidence: evidenceBase64, citizenName, citizenPhone, operatorMode: true }),
      });
      const ct = resp.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error("Backend not running on port 4000.");
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || `Server error ${resp.status}`);
      setResult(data);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Track complaint ──────────────────────────
  const trackComplaint = async () => {
    const id = trackId.trim().toUpperCase();
    if (!id) { setTrackError(t(uiLang, "enterTicketId")); return; }
    setTrackLoading(true);
    setTrackResult(null);
    setTrackError("");
    try {
      const resp = await fetch(`http://127.0.0.1:4000/tickets/${id}`);
      if (resp.status === 404) { setTrackError(`${t(uiLang, "ticketNotFound")}: "${id}"`); setTrackLoading(false); return; }
      const ct = resp.headers.get("content-type");
      if (!ct?.includes("application/json")) throw new Error("Backend not running on port 4000.");
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Server error");
      setTrackResult(data);
    } catch (err) {
      setTrackError(`Error: ${err.message}`);
    } finally {
      setTrackLoading(false);
    }
  };

  // ── Reset ────────────────────────────────────
  const reset = () => {
    setMode("none");
    setCitizenStatement(""); setCitizenName(""); setCitizenPhone("");
    setSpokenLang("AUTO"); setDepartment("Auto");
    setLocation(null); setLocationLabel(null); setAttachment(null);
    setResult(null); setCopied(false);
    setVoiceError(""); setInterimText("");
    finalTranscript.current = "";
    stopListening();
  };

  // ── Detect language label for currently detected script ──
  const detectedScriptLang = citizenStatement ? detectLangFromScript(citizenStatement) : null;

  // ── Result card ──────────────────────────────
  const renderResult = () => {
    if (!result) return null;
    const sev = getSeverityStyle(result.severity);
    return (
      <div style={S.resultCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 20 }}>
          <div style={{ fontSize: 32 }}>✅</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e", marginBottom: 2 }}>{t(uiLang, "grievanceFiledSuccess")}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{t(uiLang, "grievanceFiledSuccessSub")}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t(uiLang, "ticketId")}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#38bdf8", letterSpacing: 2 }}>{result.ticketId}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{t(uiLang, "filedOn")}</div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{result.timestamp}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ ...S.infoCell, flex: 2 }}>
            <div style={S.infoLbl}>{t(uiLang, "department")}</div>
            <div style={{ ...S.infoVal, color: "#38bdf8" }}>{result.officialDeptName || result.department}</div>
          </div>
          <div style={{ ...S.infoCell, flex: 1, textAlign: "center" }}>
            <div style={S.infoLbl}>{t(uiLang, "priority")}</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: sev.color, marginTop: 4 }}>{result.severity}</div>
          </div>
          <div style={{ ...S.infoCell, flex: 1, textAlign: "center" }}>
            <div style={S.infoLbl}>{t(uiLang, "language")}</div>
            <div style={{ ...S.infoVal, fontSize: 13 }}>{result.detectedLanguage}</div>
          </div>
        </div>
        {result.formalGrievanceText && (
          <div style={{ ...S.block, background: "rgba(15,23,42,0.6)" }}>
            <div style={S.blockLbl}>{t(uiLang, "complaintFiled")}</div>
            <div style={{ ...S.blockVal, fontSize: 14, color: "#e2e8f0", lineHeight: 1.8 }}>{result.formalGrievanceText}</div>
          </div>
        )}
        {result.slaDeadline && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>⏱️</span>
            <div>
              <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{t(uiLang, "resolutionCommitted")}</div>
              <div style={{ fontSize: 14, color: "#fca5a5", fontWeight: 600 }}>{result.slaDeadline}</div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 11, color: "#334155" }}>⚡ {result.processingTimeSeconds}s · {result.detectedLanguage} detected</span>
          <button onClick={() => { navigator.clipboard.writeText(result.ticketId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={S.copyBtn}>
            {copied ? t(uiLang, "copied") : t(uiLang, "copyTicketId")}
          </button>
        </div>
      </div>
    );
  };

  // ── Track result card ────────────────────────
  const renderTrackResult = () => {
    if (!trackResult) return null;
    const sev    = getSeverityStyle(trackResult.severity);
    const stSty  = STATUS_STYLES[trackResult.sla_status] || STATUS_STYLES.OPEN;
    const chain  = Array.isArray(trackResult.escalation_chain) ? trackResult.escalation_chain : [];
    const history= trackResult.statusHistory || [];
    const votes  = trackResult.languageVotes || [];

    return (
      <div style={S.resultCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{t(uiLang, "ticketId")}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#38bdf8", letterSpacing: 2 }}>{trackResult.ticket_id}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{t(uiLang, "filed")} {trackResult.created_at_ist}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 100, background: stSty.bg, color: stSty.color, border: `1px solid ${stSty.border}` }}>
              ● {trackResult.sla_status}
            </span>
            <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 100, background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
              {trackResult.severity}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ ...S.infoCell, flex: 2 }}>
            <div style={S.infoLbl}>{t(uiLang, "department")}</div>
            <div style={{ ...S.infoVal, color: "#38bdf8", fontSize: 13 }}>{trackResult.official_dept_name || trackResult.department}</div>
          </div>
          <div style={{ ...S.infoCell, flex: 1 }}>
            <div style={S.infoLbl}>{t(uiLang, "language")}</div>
            <div style={S.infoVal}>{trackResult.detected_language}</div>
          </div>
          <div style={{ ...S.infoCell, flex: 1 }}>
            <div style={S.infoLbl}>{t(uiLang, "confidence")}</div>
            <div style={S.infoVal}>{trackResult.language_confidence}%</div>
          </div>
        </div>
        {(trackResult.citizen_name || trackResult.citizen_phone || trackResult.full_address) && (
          <div style={{ ...S.block, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {trackResult.citizen_name  && <div><div style={S.blockLbl}>👤 Name</div><div style={{ ...S.blockVal, fontWeight: 700 }}>{trackResult.citizen_name}</div></div>}
            {trackResult.citizen_phone && <div><div style={S.blockLbl}>📞 Phone</div><div style={{ ...S.blockVal, fontWeight: 700 }}>{trackResult.citizen_phone}</div></div>}
            {trackResult.full_address  && <div style={{ flex: 1 }}><div style={S.blockLbl}>📍 Location</div><div style={{ ...S.blockVal, color: "#38bdf8", fontSize: 12 }}>{trackResult.full_address}</div></div>}
          </div>
        )}
        {trackResult.sla_deadline && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>⏱️</span>
            <div>
              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{t(uiLang, "slaDeadline")}</div>
              <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginTop: 2 }}>{trackResult.sla_deadline}</div>
            </div>
          </div>
        )}
        {trackResult.formal_grievance && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang, "complaintOnRecord")}</div>
            <div style={{ ...S.blockVal, fontSize: 13, lineHeight: 1.7 }}>{trackResult.formal_grievance}</div>
          </div>
        )}
        {trackResult.nodal_officer && (
          <div style={{ ...S.block, background: "rgba(249,115,22,0.05)", borderLeft: "3px solid #f97316" }}>
            <div style={{ ...S.blockLbl, color: "#f97316" }}>{t(uiLang, "assignedTo")}</div>
            <div style={{ ...S.blockVal, color: "#fdba74" }}>{trackResult.nodal_officer}</div>
          </div>
        )}
        {chain.length > 0 && (
          <div style={{ ...S.block, marginBottom: 14 }}>
            <div style={S.blockLbl}>{t(uiLang, "escalationChain")}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {chain.map((level, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: i === 0 ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${i === 0 ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`, color: i === 0 ? "#38bdf8" : "#64748b", fontWeight: i === 0 ? 700 : 400 }}>{level}</span>
                  {i < chain.length - 1 && <span style={{ color: "#334155", fontSize: 12 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang, "statusHistory")}</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 0 }}>
              {history.map((h, i) => {
                const hs = STATUS_STYLES[h.status] || STATUS_STYLES.OPEN;
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < history.length - 1 ? 14 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: hs.color, boxShadow: `0 0 6px ${hs.color}`, marginTop: 3 }} />
                      {i < history.length - 1 && <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.07)", minHeight: 20, marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: hs.color, padding: "2px 8px", borderRadius: 100, background: hs.bg, border: `1px solid ${hs.border}` }}>{h.status}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>{new Date(h.updated_at).toLocaleString("en-IN")}</span>
                      </div>
                      {h.note && <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{h.note}</div>}
                      <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>by {h.updated_by}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {votes.length > 0 && (
          <div style={S.block}>
            <div style={S.blockLbl}>{t(uiLang, "languageVotes")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {votes.map((v, i) => (
                <div key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                  {v.layer.split("-").slice(1).join("-")} → <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{v.voted_lang}</span> ({v.confidence}%)
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155" }}>
          Portal: {trackResult.portal_to_log || "—"} · Act: {trackResult.reference_act || "—"}
        </div>
      </div>
    );
  };

  // ── Language picker (with AUTO at top) ────────
  const renderLangPicker = () => (
    <div style={{ position: "absolute", top: "110%", left: 0, right: 0, zIndex: 200, background: "rgba(10,16,32,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 12, backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, padding: "0 4px" }}>{t(uiLang, "allLanguages")}</div>
      {/* AUTO detect option */}
      <button
        className={`lang-option ${spokenLang === "AUTO" ? "active" : ""}`}
        style={{ width: "100%", marginBottom: 8, background: spokenLang === "AUTO" ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.04)", borderColor: spokenLang === "AUTO" ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.2)" }}
        onClick={() => { setSpokenLang("AUTO"); setShowLangPicker(false); }}>
        <div style={{ fontWeight: 700, color: spokenLang === "AUTO" ? "#818cf8" : "#94a3b8" }}>{t(uiLang, "autoDetectLabel")}</div>
        <div style={{ fontSize: 10, color: "#475569" }}>{t(uiLang, "autoDetectSub")}</div>
      </button>
      <div className="lang-grid">
        {ALL_LANGS.map(l => (
          <button key={l.code} className={`lang-option ${spokenLang === l.code ? "active" : ""}`}
            onClick={() => { setSpokenLang(l.code); setShowLangPicker(false); }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
            <div style={{ fontSize: 10, color: "#475569" }}>{l.code !== "English" ? l.code : ""}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020617; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes titleFade { 0%,100%{opacity:0;transform:translateY(6px);} 15%,85%{opacity:1;transform:translateY(0);} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.6);} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0);} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:0.8;} 100%{transform:scale(2.4);opacity:0;} }
        @keyframes micPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.4;} 50%{transform:translateY(-8px);opacity:1;} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(56,189,248,0.2);} 50%{box-shadow:0 0 40px rgba(56,189,248,0.5);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes locPulse { 0%,100%{border-color:rgba(239,68,68,0.4);} 50%{border-color:rgba(239,68,68,0.8);} }
        .card-hover:hover { transform:translateY(-6px)!important; box-shadow:0 24px 48px rgba(0,0,0,0.5),0 0 0 1px rgba(56,189,248,0.3)!important; }
        .operator-badge { display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:11px;font-weight:700;letter-spacing:1.5px;padding:5px 12px;border-radius:100px;text-transform:uppercase; }
        .operator-badge::before { content:"";width:6px;height:6px;border-radius:50%;background:#38bdf8;animation:pulseRed 2s infinite; }
        input::placeholder,textarea::placeholder{color:#334155;}
        select option{background:#0f172a;color:#e2e8f0;}
        .lang-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-height:260px;overflow-y:auto;padding:4px; }
        .lang-option { padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);color:#94a3b8;font-size:12px;cursor:pointer;transition:all 0.2s;text-align:left;font-family:inherit; }
        .lang-option:hover { background:rgba(56,189,248,0.1);border-color:rgba(56,189,248,0.3);color:#38bdf8; }
        .lang-option.active { background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.4);color:#38bdf8;font-weight:700; }
        .voice-interim { color: rgba(56,189,248,0.6); font-style: italic; }
      `}</style>

      <div style={S.root}>
        <video ref={video1Ref} autoPlay muted playsInline style={{ ...S.bgVideo, opacity: showFirst ? 1 : 0 }}
          onTimeUpdate={(e) => { if (e.target.duration && e.target.currentTime > e.target.duration - 0.5 && showFirst) handleSwitch(); }}>
          <source src="/video.mp4" />
        </video>
        <video ref={video2Ref} muted playsInline style={{ ...S.bgVideo, opacity: showFirst ? 0 : 1 }}
          onTimeUpdate={(e) => { if (e.target.duration && e.target.currentTime > e.target.duration - 0.5 && !showFirst) handleSwitch(); }}>
          <source src="/reverse.mp4" />
        </video>
        <div style={S.bgOverlay} />

        {/* ── Top bar ── */}
        <div style={S.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={S.logo} key={titleIdx}>{JANVAANI_TITLES[titleIdx]}</span>
            <span className="operator-badge">{t(uiLang, "operatorPortal")}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {UI_SWITCHER_LANGS.map(l => {
              const lang = ALL_LANGS.find(x => x.code === l);
              return (
                <button key={l} onClick={() => setUiLang(l)}
                  style={{ ...S.langBtn, ...(uiLang === l ? S.langBtnActive : {}) }}>
                  {lang?.label || l}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── HOME ── */}
        {mode === "none" && (
          <div style={S.homeWrap}>
            <div style={S.homeHero}>
              <h1 style={S.heroTitle}>{t(uiLang, "heroTitle")}</h1>
              <p style={S.heroSub}>{t(uiLang, "heroSub")}</p>
            </div>
            <div style={S.cardsRow}>
              <div className="card-hover" style={S.modeCard} onClick={() => setMode("write")}>
                <div style={S.modeCardIcon}>⌨️</div>
                <div style={S.modeCardTitle}>{t(uiLang, "recordByTyping")}</div>
                <div style={S.modeCardSub}>{t(uiLang, "recordByTypingSub")}</div>
                <div style={S.modeCardArrow}>→</div>
              </div>
              <div className="card-hover" style={S.modeCard} onClick={() => setMode("speak")}>
                <div style={S.modeCardIcon}>🎙️</div>
                <div style={S.modeCardTitle}>{t(uiLang, "recordByVoice")}</div>
                <div style={S.modeCardSub}>{t(uiLang, "recordByVoiceSub")}</div>
                <div style={S.modeCardArrow}>→</div>
              </div>
              <div className="card-hover" style={{ ...S.modeCard, borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)" }} onClick={() => setMode("track")}>
                <div style={S.modeCardIcon}>🔍</div>
                <div style={S.modeCardTitle}>{t(uiLang, "trackComplaint")}</div>
                <div style={S.modeCardSub}>{t(uiLang, "trackComplaintSub")}</div>
                <div style={{ ...S.modeCardArrow, color: "#818cf8" }}>→</div>
              </div>
            </div>
          </div>
        )}

        {/* ── INTAKE FORM ── */}
        {(mode === "write" || mode === "speak") && (
          <div style={S.formWrap}>
            <div style={S.formPanel}>
              <button onClick={reset} style={S.backBtn}>{t(uiLang, "back")}</button>
              <div style={S.panelTitle}>{mode === "write" ? t(uiLang, "recordByTypingFull") : t(uiLang, "recordByVoiceFull")}</div>
              <div style={S.panelSub}>{t(uiLang, "recordAndFile")}</div>

              {/* Citizen details */}
              <div style={S.fieldGroup}>
                <div style={S.fieldRow}>
                  <div style={S.fieldWrap}>
                    <label style={S.lbl}>{t(uiLang, "citizenName")}</label>
                    <input style={S.inp} placeholder={t(uiLang, "citizenNamePlaceholder")} value={citizenName} onChange={e => setCitizenName(e.target.value)} />
                  </div>
                  <div style={S.fieldWrap}>
                    <label style={S.lbl}>{t(uiLang, "citizenPhone")}</label>
                    <input style={S.inp} placeholder={t(uiLang, "citizenPhonePlaceholder")} value={citizenPhone} onChange={e => setCitizenPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Language + Department */}
              <div style={{ ...S.fieldGroup, ...S.fieldRow }}>
                <div style={S.fieldWrap}>
                  <label style={S.lbl}>{t(uiLang, "spokenLanguage")}</label>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowLangPicker(p => !p)} style={{ ...S.inp, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span>
                        {spokenLang === "AUTO"
                          ? <span style={{ color: "#818cf8", fontWeight: 700 }}>🤖 {t(uiLang, "autoDetect")}{detectedScriptLang && detectedScriptLang !== "English" ? ` → ${detectedScriptLang}` : ""}</span>
                          : ALL_LANGS.find(l => l.code === spokenLang)?.label || spokenLang
                        }
                      </span>
                      <span style={{ color: "#475569", fontSize: 12 }}>{showLangPicker ? "▲" : "▼"}</span>
                    </button>
                    {showLangPicker && renderLangPicker()}
                  </div>
                </div>
                <div style={S.fieldWrap}>
                  <label style={S.lbl}>{t(uiLang, "preAssignDept")}</label>
                  <select style={S.sel} value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="Auto">{t(uiLang, "letAIDecide")}</option>
                    {DEPT_KEYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Voice */}
              {mode === "speak" && (
                <div style={S.fieldGroup}>
                  {/* Voice error banner */}
                  {voiceError && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, marginBottom: 12 }}>
                      ⚠️ {voiceError}
                    </div>
                  )}
                  {!listening ? (
                    <button style={S.micStartBtn} onClick={startListening}>{t(uiLang, "startVoice")}</button>
                  ) : (
                    <div style={S.listeningBox}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80 }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(56,189,248,0.5)", animation: `ripple 2s ease-out ${i * 0.65}s infinite` }} />
                          ))}
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, zIndex: 1, animation: "micPulse 2s ease-in-out infinite" }}>🎙️</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={S.recDot} />
                          <span style={S.recLabel}>{t(uiLang, "capturingVoice")}</span>
                        </div>
                        {/* Language indicator */}
                        {spokenLang === "AUTO" && detectedScriptLang && (
                          <div style={{ fontSize: 11, color: "#818cf8", padding: "3px 10px", borderRadius: 100, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                            🤖 Detected: {detectedScriptLang}
                          </div>
                        )}
                        {/* Live interim text preview */}
                        {interimText && (
                          <div style={{ fontSize: 12, color: "rgba(56,189,248,0.7)", fontStyle: "italic", textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
                            …{interimText}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                        </div>
                        <button style={S.micStopBtn} onClick={stopListening}>{t(uiLang, "stopVoice")}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Statement */}
              <div style={S.fieldGroup}>
                <label style={S.lbl}>{t(uiLang, "citizenStatement")}</label>
                <textarea style={S.textarea} placeholder={t(uiLang, "citizenStatementPlaceholder")} value={citizenStatement} onChange={e => setCitizenStatement(e.target.value)} />
                {/* Script-based language auto-hint */}
                {citizenStatement && spokenLang === "AUTO" && detectedScriptLang && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#818cf8", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🤖</span>
                    <span>Script detected: <strong>{detectedScriptLang}</strong> — will be used for AI processing</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div style={S.fieldGroup}>
                <label style={S.lbl}>{t(uiLang, "locationRequired")} <span style={{ color: "#ef4444", marginLeft: 4 }}>{t(uiLang, "locationRequiredBadge")}</span></label>
                <button onClick={handleGetLocation} disabled={isFetchingLoc}
                  style={{ ...S.locationBtn, ...(location ? S.locationBtnSuccess : S.locationBtnRequired) }}>
                  {isFetchingLoc ? <>{t(uiLang, "fetchingLocation")}</> : location ? <>{t(uiLang, "locationCaptured")} {locationLabel || location}</> : <>{t(uiLang, "tapToCapture")}</>}
                </button>
                {!location && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#fca5a5", fontWeight: 600 }}>{t(uiLang, "locationMandatory")}</span>
                  </div>
                )}
                <div style={{ marginTop: 10 }}>
                  <input type="file" id="ev-upload" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) setAttachment(e.target.files[0]); }} />
                  <label htmlFor="ev-upload" style={S.auxBtn}>{attachment ? `📎 ${attachment.name.slice(0, 22)}…` : t(uiLang, "attachEvidence")}</label>
                </div>
              </div>

              {/* Submit */}
              {!result && (
                <>
                  <button
                    style={{ ...S.submitBtn, opacity: (isAnalyzing || !citizenStatement.trim() || !location) ? 0.4 : 1, cursor: (isAnalyzing || !citizenStatement.trim() || !location) ? "not-allowed" : "pointer" }}
                    onClick={fileGrievance} disabled={isAnalyzing || !citizenStatement.trim() || !location}>
                    {isAnalyzing
                      ? <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 8, verticalAlign: "middle" }} />{t(uiLang, "filingRouting")}</>
                      : !location ? t(uiLang, "captureToEnable") : t(uiLang, "fileGrievance")}
                  </button>
                  {(!location || !citizenStatement.trim()) && (
                    <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{t(uiLang, "requiredBefore")}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <span>{citizenStatement.trim() ? "✅" : "❌"}</span>
                          <span style={{ color: citizenStatement.trim() ? "#4ade80" : "#fca5a5" }}>{t(uiLang, "statementRecorded")}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <span>{location ? "✅" : "❌"}</span>
                          <span style={{ color: location ? "#4ade80" : "#fca5a5" }}>{t(uiLang, "locationCapturedReq")}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {renderResult()}

              {result && (
                <button style={{ ...S.submitBtn, marginTop: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} onClick={reset}>
                  {t(uiLang, "fileAnother")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── TRACK COMPLAINT ── */}
        {mode === "track" && (
          <div style={S.formWrap}>
            <div style={{ ...S.formPanel, maxWidth: 760 }}>
              <button onClick={reset} style={S.backBtn}>{t(uiLang, "back")}</button>
              <div style={S.panelTitle}>{t(uiLang, "trackTitle")}</div>
              <div style={S.panelSub}>{t(uiLang, "trackSub")}</div>

              <div style={{ ...S.fieldGroup, display: "flex", gap: 12 }}>
                <input
                  style={{ ...S.inp, flex: 1, fontFamily: "monospace", fontSize: 18, letterSpacing: 2, textTransform: "uppercase" }}
                  placeholder={t(uiLang, "ticketPlaceholder")}
                  value={trackId}
                  onChange={e => { setTrackId(e.target.value.toUpperCase()); setTrackError(""); }}
                  onKeyDown={e => { if (e.key === "Enter") trackComplaint(); }}
                />
                <button
                  onClick={trackComplaint}
                  disabled={trackLoading}
                  style={{ ...S.submitBtn, marginTop: 0, width: "auto", padding: "16px 32px", opacity: trackLoading ? 0.6 : 1 }}>
                  {trackLoading
                    ? <><span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 8, verticalAlign: "middle" }} />{t(uiLang, "searching")}</>
                    : t(uiLang, "track")}
                </button>
              </div>

              {trackError && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {trackError}
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

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const S = {
  root          : { minHeight: "100vh", position: "relative", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e2e8f0" },
  bgVideo       : { position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, transition: "opacity 0.8s ease" },
  bgOverlay     : { position: "fixed", inset: 0, background: "linear-gradient(to bottom,rgba(2,6,23,0.75) 0%,rgba(2,6,23,0.55) 50%,rgba(2,6,23,0.85) 100%)", backdropFilter: "blur(6px)", zIndex: 1 },
  topBar        : { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", background: "rgba(2,6,23,0.7)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  logo          : { fontSize: 22, fontWeight: 900, letterSpacing: 4, background: "linear-gradient(90deg,#fff,#38bdf8,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "titleFade 3.5s ease infinite" },
  langBtn       : { padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
  langBtnActive : { background: "rgba(56,189,248,0.12)", borderColor: "rgba(56,189,248,0.4)", color: "#38bdf8" },
  homeWrap      : { position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "100px 24px 40px" },
  homeHero      : { textAlign: "center", marginBottom: 48, animation: "fadeUp 0.7s ease forwards" },
  heroTitle     : { fontSize: 42, fontWeight: 900, letterSpacing: 2, marginBottom: 12, background: "linear-gradient(135deg,#fff 40%,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub       : { fontSize: 16, color: "#64748b", fontWeight: 500 },
  cardsRow      : { display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" },
  modeCard      : { width: 360, padding: "48px 40px", borderRadius: 28, background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(16px)", cursor: "pointer", transition: "all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeUp 0.6s ease forwards" },
  modeCardIcon  : { fontSize: 56, marginBottom: 20 },
  modeCardTitle : { fontSize: 24, fontWeight: 800, color: "#f1f5f9", marginBottom: 10, letterSpacing: 0.5 },
  modeCardSub   : { fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 28 },
  modeCardArrow : { fontSize: 24, color: "#38bdf8", fontWeight: 900 },
  formWrap      : { position: "relative", zIndex: 10, display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", padding: "90px 32px 60px" },
  formPanel     : { width: "100%", maxWidth: 1100, background: "rgba(10,16,32,0.85)", backdropFilter: "blur(20px)", borderRadius: 28, border: "1px solid rgba(255,255,255,0.07)", borderTop: "1px solid rgba(255,255,255,0.13)", padding: "52px 64px", boxShadow: "0 32px 64px rgba(0,0,0,0.6)", animation: "fadeUp 0.5s ease forwards" },
  backBtn       : { background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", padding: "8px 18px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 28, transition: "all 0.2s" },
  panelTitle    : { fontSize: 36, fontWeight: 900, color: "#f1f5f9", letterSpacing: 1, marginBottom: 6 },
  panelSub      : { fontSize: 15, color: "#475569", marginBottom: 36 },
  fieldGroup    : { marginBottom: 28 },
  fieldRow      : { display: "flex", gap: 24 },
  fieldWrap     : { flex: 1, display: "flex", flexDirection: "column" },
  lbl           : { fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  inp           : { background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", color: "#e2e8f0", fontSize: 16, outline: "none", fontFamily: "inherit" },
  sel           : { background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", color: "#e2e8f0", fontSize: 16, outline: "none", cursor: "pointer", fontFamily: "inherit" },
  textarea      : { background: "rgba(2,6,23,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px 22px", color: "#e2e8f0", fontSize: 16, lineHeight: 1.8, resize: "vertical", minHeight: 220, outline: "none", fontFamily: "inherit", width: "100%" },
  micStartBtn   : { width: "100%", padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: 0.5 },
  listeningBox  : { background: "rgba(2,6,23,0.9)", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 18, padding: "28px 32px", animation: "glowPulse 3s infinite" },
  recDot        : { width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "pulseRed 1s infinite" },
  recLabel      : { fontSize: 12, fontWeight: 800, color: "#38bdf8", letterSpacing: 2, textTransform: "uppercase" },
  micStopBtn    : { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  auxBtn        : { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  locationBtn         : { width: "100%", padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 8 },
  locationBtnRequired : { background: "rgba(239,68,68,0.08)", border: "2px dashed rgba(239,68,68,0.5)", color: "#fca5a5", animation: "locPulse 2s ease-in-out infinite" },
  locationBtnSuccess  : { background: "rgba(34,197,94,0.08)", border: "2px solid rgba(34,197,94,0.4)", color: "#4ade80" },
  submitBtn     : { width: "100%", padding: "18px", borderRadius: 14, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", border: "none", color: "#fff", fontSize: 16, fontWeight: 900, letterSpacing: 0.5, cursor: "pointer", transition: "all 0.25s", marginTop: 8, fontFamily: "inherit" },
  resultCard    : { marginTop: 28, padding: "24px", borderRadius: 16, background: "rgba(2,6,23,0.7)", border: "1px solid rgba(56,189,248,0.2)", animation: "fadeUp 0.5s ease forwards" },
  infoCell      : { flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" },
  infoLbl       : { fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  infoVal       : { fontSize: 14, fontWeight: 700, color: "#f1f5f9" },
  block         : { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", marginBottom: 12 },
  blockLbl      : { fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  blockVal      : { fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 },
  copyBtn       : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", padding: "5px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
};