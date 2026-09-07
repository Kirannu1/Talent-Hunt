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

  // No hardcoded default mock profiles — only real registered students appear
  const MOCK_STUDENTS = [];

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

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(name) {
    if (!name || typeof name !== 'string') return 'MM';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'MM';
    return parts.slice(0, 2).map(w => w[0].toUpperCase()).join('');
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
    return null;
  }

  function allSkills(profile) {
    if (!profile) return [];
    return [...(profile.tech || []), ...(profile.creative || [])];
  }

  // Returns only real classmate profiles (from the shared database), excluding self
  function mergePool(profile, otherProfiles) {
    return (otherProfiles || []).filter(p => !(profile && profile.uid && p.uid === profile.uid));
  }

  // complementary teammate matching: rewards shared interests + skills the
  // student doesn't already have (i.e. genuinely complementary, not a clone)
  function computeMatches(profile, count, pool) {
    if (!profile) return [];
    const mySkills = new Set(allSkills(profile));
    const myInterests = new Set(profile.interests || []);
    const candidates = pool || [];
    if (candidates.length === 0) return [];

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
    escapeHtml, initials, saveProfile, loadProfile, defaultProfile, allSkills, mergePool,
    computeMatches, computeOpportunities, skillGrowth
  };
})();