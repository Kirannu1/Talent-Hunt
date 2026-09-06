/* ==========================================================================
   MindMesh — project idea templates (no AI; hand-written, picked by category)
   ========================================================================== */
window.MindMeshIdeas = [
  {
    id: 'attendance',
    category: 'College Attendance',
    icon: '📋',
    title: 'Smart Attendance Intelligence',
    problem: 'Manual attendance systems are time-consuming, easy to fake with proxies, and give faculty no real visibility into attendance trends until it\'s too late in the semester to act on them.',
    features: ['QR/geo-based attendance check-in', 'Attendance analytics per student & class', 'Automated low-attendance notifications', 'Faculty dashboard with defaulter alerts'],
    stack: ['React', 'Node.js', 'MongoDB', 'Python', 'QR/Camera API'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'AI/ML', count: 1 }, { role: 'UI/UX', count: 1 }]
  },
  {
    id: 'canteen',
    category: 'Campus Food & Canteen',
    icon: '🍽️',
    title: 'MealQueue — Smart Canteen Ordering',
    problem: 'Canteen lines during peak hours waste class time, food often runs out before latecomers arrive, and there\'s no way to know what\'s available without physically walking there.',
    features: ['Pre-order & pay from a phone', 'Live queue length & wait-time estimate', 'Real-time menu & stock availability', 'Order pickup notifications'],
    stack: ['React Native', 'Node.js', 'PostgreSQL', 'Payments API'],
    roles: [{ role: 'Mobile Dev', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'QA/Testing', count: 1 }]
  },
  {
    id: 'wellness',
    category: 'Mental Health & Wellness',
    icon: '🧠',
    title: 'MindCheck — Peer Wellness Companion',
    problem: 'Students under academic stress often don\'t reach out until a crisis point, and campus counseling resources are hard to discover or feel too formal for an early, low-stakes check-in.',
    features: ['Anonymous daily mood check-ins', 'Trend tracking with gentle nudges', 'One-tap connection to campus counseling', 'Peer support group matching'],
    stack: ['React', 'Firebase', 'Node.js', 'Chart.js'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Content/Psych advisor', count: 1 }]
  },
  {
    id: 'lostfound',
    category: 'Lost & Found',
    icon: '🔍',
    title: 'FoundIt — Campus Lost & Found Network',
    problem: 'Lost items on campus rarely make it back to their owners because there\'s no shared place to post them — they end up in a drawer in some office nobody checks.',
    features: ['Post lost/found items with photos', 'Smart matching by item description', 'Campus-wide notifications for matches', 'Verified pickup with location tagging'],
    stack: ['React', 'Node.js', 'MongoDB', 'Image recognition API'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'AI/ML', count: 1 }, { role: 'UI/UX', count: 1 }]
  },
  {
    id: 'events',
    category: 'Campus Events',
    icon: '🎉',
    title: 'EventPulse — Unified Campus Events Hub',
    problem: 'Event info is scattered across a dozen WhatsApp groups and Instagram pages, so students constantly miss things they\'d have actually wanted to attend.',
    features: ['Unified event calendar across all clubs', 'Personalized recommendations by interest', 'RSVP & capacity tracking', 'Push reminders before events start'],
    stack: ['React', 'Node.js', 'PostgreSQL', 'Push notifications'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Marketing/Content', count: 1 }]
  },
  {
    id: 'sustainability',
    category: 'Sustainability',
    icon: '🌱',
    title: 'GreenCampus — Waste & Energy Tracker',
    problem: 'Campuses set sustainability goals but have no visible, real-time way to show students and staff how their daily choices affect actual waste and energy numbers.',
    features: ['Per-building energy & waste dashboards', 'Student sustainability challenges & badges', 'Recycling bin fill-level alerts', 'Monthly impact reports'],
    stack: ['React', 'Python', 'IoT sensors', 'PostgreSQL'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'IoT/Hardware', count: 1 }, { role: 'Data/Backend', count: 1 }, { role: 'UI/UX', count: 1 }]
  },
  {
    id: 'library',
    category: 'Library & Resources',
    icon: '📚',
    title: 'ShelfShare — Smart Library Queue & Reservations',
    problem: 'Popular textbooks and study rooms get claimed the moment the library opens, with no fair, transparent way to reserve them ahead of time.',
    features: ['Book & study room reservation system', 'Live availability tracking', 'Wait-list with auto-notify on return', 'Overdue & renewal reminders'],
    stack: ['React', 'Node.js', 'MongoDB', 'Barcode scanning'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'QA/Testing', count: 1 }]
  },
  {
    id: 'transport',
    category: 'Parking & Transport',
    icon: '🚌',
    title: 'ParkEase — Campus Shuttle & Parking Tracker',
    problem: 'Students waste time circling full parking lots or waiting blind for shuttles with no idea how far away the next one actually is.',
    features: ['Live shuttle GPS tracking', 'Real-time parking spot availability', 'Route & ETA predictions', 'Overflow lot alerts'],
    stack: ['React Native', 'Node.js', 'GPS/Maps API', 'Python'],
    roles: [{ role: 'Mobile Dev', count: 1 }, { role: 'Backend', count: 1 }, { role: 'AI/ML', count: 1 }, { role: 'UI/UX', count: 1 }]
  },
  {
    id: 'tutoring',
    category: 'Peer Tutoring',
    icon: '🎓',
    title: 'PeerUp — Student Tutoring Marketplace',
    problem: 'Students who need help in a subject and students who could teach it rarely find each other outside of word-of-mouth, especially across different years and departments.',
    features: ['Tutor profiles by subject & rating', 'Session booking & scheduling', 'In-app video/chat for remote sessions', 'Peer review & progress tracking'],
    stack: ['React', 'Node.js', 'PostgreSQL', 'WebRTC'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Community/Ops', count: 1 }]
  },
  {
    id: 'sports',
    category: 'Sports & Fitness',
    icon: '🏀',
    title: 'FitCampus — Intramural Sports Organizer',
    problem: 'Organizing intramural matches today means endless group chats for scheduling courts, tracking scores on paper, and no visible standings to keep anyone motivated.',
    features: ['Team registration & match scheduling', 'Live scoreboards & standings', 'Court/venue booking', 'Player stats over a season'],
    stack: ['React', 'Node.js', 'MongoDB', 'Real-time sockets'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Community/Ops', count: 1 }]
  },
  {
    id: 'alumni',
    category: 'Alumni Network',
    icon: '🤝',
    title: 'AlumniLink — Mentorship & Networking Bridge',
    problem: 'Alumni want to give back and current students want mentorship, but there\'s no structured, low-friction way for the two groups to actually connect.',
    features: ['Searchable alumni directory by field', 'Mentorship request & matching', 'Event & job posting board', 'Direct messaging between mentor & mentee'],
    stack: ['React', 'Node.js', 'PostgreSQL', 'Search/filter engine'],
    roles: [{ role: 'Frontend', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Outreach/Content', count: 1 }]
  },
  {
    id: 'safety',
    category: 'Safety & Emergency',
    icon: '🚨',
    title: 'SafeCampus — Emergency Alert & SOS Network',
    problem: 'In an emergency, students often don\'t know the fastest way to alert campus security or nearby peers, and security has no quick way to broadcast an area-wide alert.',
    features: ['One-tap SOS with live location', 'Campus-wide broadcast alerts', 'Verified emergency contact routing', 'Incident heatmap for security review'],
    stack: ['React Native', 'Node.js', 'GPS/Maps API', 'Push notifications'],
    roles: [{ role: 'Mobile Dev', count: 1 }, { role: 'Backend', count: 1 }, { role: 'UI/UX', count: 1 }, { role: 'Security/Ops advisor', count: 1 }]
  }
];