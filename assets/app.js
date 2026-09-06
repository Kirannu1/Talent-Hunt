/* ==========================================================================
   MindMesh — shared data + matching logic
   ========================================================================== */
const MindMesh = (function () {

  const TECH_SKILLS = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Data Science',
    'C++', 'Java', 'SQL', 'Cloud / AWS', 'Android', 'iOS / Swift', 'Arduino / IoT',
    'Blockchain', 'Cybersecurity'
  ];

  const CREATIVE_SKILLS = [
    'UI/UX Design', 'Figma', 'Graphic Design', 'Video Editing', 'Illustration',
    'Copywriting', 'Photography', '3D Modeling', 'Animation', 'Public Speaking',
    'Content Strategy'
  ];

  const INTERESTS = [
    'AI & ML', 'Web Development', 'Mobile Apps', 'Product Design', 'Robotics & IoT',
    'Game Development', 'Data Science', 'Entrepreneurship', 'Sustainability Tech',
    'FinTech', 'HealthTech', 'EdTech'
  ];

  const COLLEGES = [
    'Easwari Engineering College',
    'SRM Ramapuram (SRM IST)',
    'St. Joseph\'s College of Engineering',
    'Sri Venkateswara College of Engineering (SVCE)',
    'Rajalakshmi Engineering College (REC)',
    'Vellore Institute of Technology (VIT)',
    'VIT Vellore',
    'Meenakshi Engineering College',
    'RV College of Engineering (RVCE)',
    'PES University, Bengaluru',
    'BMS College of Engineering (BMSCE)',
    'IIT Madras',
    'IIT Bombay',
    'NIT Karnataka, Surathkal',
    'BITS Pilani',
    'Manipal Institute of Technology',
    'Delhi Technological University (DTU)'
  ];

  const CAMPUS_CLUBS = [
    'Google Developer Student Club (GDSC)',
    'ACM Student Chapter',
    'IEEE Computer Society',
    'E-Cell / Entrepreneurship Cell',
    'Robotics & Automation Guild',
    'Competitive Programming Club',
    'Design & UI/UX Guild',
    'Open Source Software Guild',
    'Rotaract / Social Impact',
    'AI & Data Science Society'
  ];

  const MOCK_STUDENTS = [
    {
      uid: 'mock_meera_sharma', name: 'Meera Sharma', year: '2nd year', branch: 'Design & Interaction',
      college: 'Easwari Engineering College', rollNo: '310623DS014', degree: 'B.Tech in Information Technology', semester: '4th Semester', cgpa: '9.1',
      clubs: ['Design & UI/UX Guild', 'ACM Student Chapter'],
      tech: ['Figma'], creative: ['UI/UX Design', 'Figma', 'Illustration'], interests: ['Product Design', 'AI & ML']
    },
    {
      uid: 'mock_kabir_anand', name: 'Kabir Anand', year: '4th year', branch: 'Computer Science',
      college: 'SRM Ramapuram (SRM IST)', rollNo: 'RA2111003020054', degree: 'B.Tech in Computer Science', semester: '8th Semester', cgpa: '8.85',
      clubs: ['Google Developer Student Club (GDSC)', 'AI & Data Science Society'],
      tech: ['Python', 'Machine Learning', 'SQL'], creative: [], interests: ['AI & ML', 'Data Science']
    },
    {
      uid: 'mock_wei_chen', name: 'Wei Chen', year: '3rd year', branch: 'Computer Science',
      college: 'Rajalakshmi Engineering College (REC)', rollNo: '210701512', degree: 'B.E. in Computer Science', semester: '6th Semester', cgpa: '9.3',
      clubs: ['Open Source Software Guild', 'Competitive Programming Club'],
      tech: ['React', 'Node.js', 'JavaScript'], creative: [], interests: ['Web Development', 'Entrepreneurship']
    },
    {
      uid: 'mock_ananya_iyer', name: 'Ananya Iyer', year: '1st year', branch: 'Media & Tech Comm',
      college: 'Sri Venkateswara College of Engineering (SVCE)', rollNo: '24IT029', degree: 'B.Tech in Information Technology', semester: '2nd Semester', cgpa: '8.7',
      clubs: ['E-Cell / Entrepreneurship Cell', 'Rotaract / Social Impact'],
      tech: [], creative: ['Public Speaking', 'Copywriting', 'Content Strategy'], interests: ['Entrepreneurship', 'EdTech']
    },
    {
      uid: 'mock_dev_patel', name: 'Dev Patel', year: '3rd year', branch: 'Electronics & Comm.',
      college: 'St. Joseph\'s College of Engineering', rollNo: '312322EC114', degree: 'B.E. in ECE', semester: '6th Semester', cgpa: '8.6',
      clubs: ['Robotics & Automation Guild', 'IEEE Computer Society'],
      tech: ['Arduino / IoT', 'C++'], creative: [], interests: ['Robotics & IoT', 'Sustainability Tech']
    },
    {
      uid: 'mock_farah_idris', name: 'Farah Idris', year: '2nd year', branch: 'Computer Science',
      college: 'VIT Vellore', rollNo: '23BCE0041', degree: 'B.Tech in Computer Science', semester: '4th Semester', cgpa: '9.4',
      clubs: ['Competitive Programming Club', 'Open Source Software Guild'],
      tech: ['Python', 'Cybersecurity'], creative: [], interests: ['FinTech', 'AI & ML']
    },
    {
      uid: 'mock_rohan_verma', name: 'Rohan Verma', year: '4th year', branch: 'Digital Media & Game Design',
      college: 'Meenakshi Engineering College', rollNo: '311521CS089', degree: 'B.E. in Computer Science', semester: '7th Semester', cgpa: '8.4',
      clubs: ['Design & UI/UX Guild'],
      tech: [], creative: ['3D Modeling', 'Animation', 'Video Editing'], interests: ['Game Development', 'Product Design']
    },
    {
      uid: 'mock_priya_nair', name: 'Priya Nair', year: '2nd year', branch: 'Computer Science & AI',
      college: 'Vellore Institute of Technology (VIT)', rollNo: '23BAI1077', degree: 'B.Tech in AI & ML', semester: '4th Semester', cgpa: '8.9',
      clubs: ['Google Developer Student Club (GDSC)'],
      tech: ['Java', 'Android'], creative: [], interests: ['Mobile Apps', 'HealthTech']
    },
    {
      uid: 'mock_leo_martins', name: 'Leo Martins', year: '3rd year', branch: 'Cloud & Systems',
      college: 'RV College of Engineering (RVCE)', rollNo: '1RV22CS092', degree: 'B.E. in Computer Science', semester: '6th Semester', cgpa: '8.75',
      clubs: ['Open Source Software Guild', 'ACM Student Chapter'],
      tech: ['Cloud / AWS', 'Node.js'], creative: [], interests: ['Web Development', 'FinTech']
    },
    {
      uid: 'mock_tanvi_rao', name: 'Tanvi Rao', year: '1st year', branch: 'Design & Interaction',
      college: 'Easwari Engineering College', rollNo: '310624IT019', degree: 'B.Tech in Information Technology', semester: '2nd Semester', cgpa: '9.0',
      clubs: ['Design & UI/UX Guild'],
      tech: [], creative: ['UI/UX Design', 'Photography'], interests: ['Product Design', 'Sustainability Tech']
    }
  ];

  const OPPORTUNITIES = [
    { name: 'HackNorth — Campus AI Track', type: 'Hackathon', meta: 'Team of 4 needed · starts in 6 days', tags: ['Machine Learning', 'Python', 'AI & ML'] },
    { name: 'Summer ML Internship — CoreStack', type: 'Internship', meta: 'Applications close Sept 12', tags: ['Machine Learning', 'Data Science', 'Python'] },
    { name: 'Design Systems micro-course', type: 'Course', meta: 'Closes a common skill gap', tags: ['UI/UX Design', 'Figma', 'Product Design'] },
    { name: 'Open seat: Campus Nav App', type: 'Project', meta: 'Needs a backend + ML contributor', tags: ['Python', 'React', 'Machine Learning'] },
    { name: 'Frontend Guild — React Deep Dive', type: 'Course', meta: 'Weekly, 5 sessions', tags: ['React', 'JavaScript', 'Web Development'] },
    { name: 'Sustainability Sprint 48h', type: 'Hackathon', meta: 'Cross-discipline teams encouraged', tags: ['Arduino / IoT', 'Sustainability Tech', 'UI/UX Design'] },
    { name: 'Pitch Lab — Founders Track', type: 'Program', meta: 'For students building a venture', tags: ['Entrepreneurship', 'Public Speaking', 'Copywriting'] },
    { name: 'Open seat: HealthTech Companion App', type: 'Project', meta: 'Needs a mobile + design contributor', tags: ['Android', 'UI/UX Design', 'HealthTech'] }
  ];

  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  function saveProfile(profile) {
    localStorage.setItem('mindmesh_profile', JSON.stringify(profile));
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem('mindmesh_profile');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function defaultProfile() {
    return {
      name: 'Aran Rao',
      college: 'RV College of Engineering (RVCE)',
      rollNo: '1RV22CS042',
      degree: 'B.Tech in Computer Science & AI',
      semester: '6th Semester',
      cgpa: '8.92',
      clubs: ['Google Developer Student Club (GDSC)', 'ACM Student Chapter'],
      achievements: 'Smart India Hackathon Finalist · 2x Campus Hackathon Winner',
      github: 'aran-rao',
      linkedin: 'aran-rao-ai',
      year: '3rd year',
      branch: 'Computer Science',
      tech: ['Python', 'Machine Learning', 'Data Science'],
      creative: [],
      interests: ['AI & ML', 'Data Science'],
      projects: [{ title: 'Campus Bus ETA Predictor', desc: 'ML model predicting shuttle arrival using live GPS pings.' }],
      learnGoals: ['UI/UX Design', 'React']
    };
  }

  function allSkills(profile) {
    return [...(profile.tech || []), ...(profile.creative || [])];
  }

  // Combines real classmate profiles (from the shared database) with the
  // built-in mock roster, so matching always has enough people to work
  // with — even for the very first student on a brand new campus — but
  // prefers real people the moment there are enough of them.
  function mergePool(profile, otherProfiles) {
    const others = (otherProfiles || []).filter(p => !(profile.uid && p.uid === profile.uid));
    return others.length >= 3 ? others : others.concat(MOCK_STUDENTS);
  }

  // complementary teammate matching: rewards shared interests + skills the
  // student doesn't already have (i.e. genuinely complementary, not a clone)
  function computeMatches(profile, count, pool) {
    const mySkills = new Set(allSkills(profile));
    const myInterests = new Set(profile.interests || []);
    const candidates = pool || MOCK_STUDENTS;

    const scored = candidates.map(s => {
      const theirSkills = [...(s.tech || []), ...(s.creative || [])];
      const theirInterests = s.interests || [];
      const sharedInterests = theirInterests.filter(i => myInterests.has(i)).length;
      const complementary = theirSkills.filter(sk => !mySkills.has(sk)).length;
      const overlap = theirSkills.filter(sk => mySkills.has(sk)).length;
      let score = 46 + sharedInterests * 13 + complementary * 6 - overlap * 3;
      score += (hashStr((s.name || '') + (profile.name || '')) % 7); // deterministic jitter
      score = Math.max(52, Math.min(98, score));
      return { student: s, score, sharedInterests, complementary: theirSkills.filter(sk => !mySkills.has(sk)) };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, count || 3);
  }

  function computeOpportunities(profile, count) {
    const mySkills = new Set(allSkills(profile));
    const myGoals = new Set(profile.learnGoals || []);
    const myInterests = new Set(profile.interests || []);

    const scored = OPPORTUNITIES.map(o => {
      const skillHits = o.tags.filter(t => mySkills.has(t)).length;
      const goalHits = o.tags.filter(t => myGoals.has(t)).length;
      const interestHits = o.tags.filter(t => myInterests.has(t)).length;
      const totalPossible = o.tags.length;
      let fit = Math.round(((skillHits * 1.0 + interestHits * 0.7 + goalHits * 0.5) / totalPossible) * 100);
      fit = Math.max(38, Math.min(97, fit || 38));
      const recommended = goalHits > 0 && skillHits === 0;
      return { opp: o, fit, recommended };
    });

    scored.sort((a, b) => b.fit - a.fit);
    return scored.slice(0, count || scored.length);
  }

  function skillGrowth(profile) {
    return allSkills(profile).map(skill => {
      const pct = 25 + (hashStr(skill + (profile.name || 'anon')) % 61); // 25–85
      return { skill, pct };
    });
  }

  return {
    TECH_SKILLS, CREATIVE_SKILLS, INTERESTS, COLLEGES, CAMPUS_CLUBS, MOCK_STUDENTS, OPPORTUNITIES,
    initials, saveProfile, loadProfile, defaultProfile, allSkills, mergePool,
    computeMatches, computeOpportunities, skillGrowth
  };
})();