// Auto-tagging service for projects
const keywordMap = {
  // Domain mappings
  domains: {
    'web development': ['react', 'vue', 'angular', 'javascript', 'html', 'css', 'node', 'express', 'frontend', 'backend', 'fullstack'],
    'mobile development': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'mobile app'],
    'data science': ['python', 'machine learning', 'ai', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'jupyter'],
    'cloud computing': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'microservices', 'serverless'],
    'blockchain': ['solidity', 'ethereum', 'smart contracts', 'web3', 'defi', 'nft'],
    'cybersecurity': ['security', 'penetration testing', 'vulnerability', 'encryption', 'firewall', 'malware'],
    'devops': ['ci/cd', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'monitoring']
  },
  
  // Skill mappings
  skills: {
    'javascript': ['js', 'javascript', 'es6', 'es2015', 'nodejs', 'node.js'],
    'python': ['python', 'py', 'django', 'flask', 'fastapi'],
    'react': ['react', 'reactjs', 'jsx', 'hooks', 'redux'],
    'java': ['java', 'spring', 'spring boot', 'maven', 'gradle'],
    'sql': ['sql', 'mysql', 'postgresql', 'database', 'db'],
    'git': ['git', 'github', 'gitlab', 'version control'],
    'docker': ['docker', 'containerization', 'containers'],
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    'machine learning': ['ml', 'machine learning', 'ai', 'artificial intelligence', 'neural networks'],
    'data structures': ['algorithms', 'data structures', 'dsa', 'leetcode', 'competitive programming']
  }
};

const calculateTagMatchRatio = (text, tags) => {
  const textLower = text.toLowerCase();
  let matches = 0;
  
  tags.forEach(tag => {
    if (textLower.includes(tag.toLowerCase())) {
      matches++;
    }
  });
  
  return matches / tags.length;
};

const expandTagsWithFuzzy = (text) => {
  const textLower = text.toLowerCase();
  const matchedSkills = [];
  const matchedDomains = [];
  
  // Check for skill matches
  Object.entries(keywordMap.skills).forEach(([skill, keywords]) => {
    keywords.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) {
        if (!matchedSkills.includes(skill)) {
          matchedSkills.push(skill);
        }
      }
    });
  });
  
  // Check for domain matches
  Object.entries(keywordMap.domains).forEach(([domain, keywords]) => {
    keywords.forEach(keyword => {
      if (textLower.includes(keyword.toLowerCase())) {
        if (!matchedDomains.includes(domain)) {
          matchedDomains.push(domain);
        }
      }
    });
  });
  
  return { matchedSkills, matchedDomains };
};

const tagProject = (title, description) => {
  const fullText = `${title} ${description}`;
  const { matchedSkills, matchedDomains } = expandTagsWithFuzzy(fullText);
  
  // Calculate evidence score based on tag matches
  const totalPossibleTags = Object.keys(keywordMap.skills).length + Object.keys(keywordMap.domains).length;
  const matchedTags = matchedSkills.length + matchedDomains.length;
  const tagMatchRatio = matchedTags / Math.min(totalPossibleTags, 20); // Cap at 20 for reasonable scoring
  
  // Bonus for repository and demo URLs (will be added by the calling function)
  const baseScore = Math.min(tagMatchRatio * 0.7, 1.0);
  
  return {
    skillTags: matchedSkills,
    domainTags: matchedDomains,
    evidenceScore: baseScore
  };
};

const calculateEvidenceScore = (project, jobRequiredSkills) => {
  const { skillTags, domainTags, repoUrl, demoUrl } = project;
  
  // Tag match ratio with job requirements
  const requiredSkillNames = jobRequiredSkills.map(skill => skill.name.toLowerCase());
  const matchedRequiredSkills = skillTags.filter(skill => 
    requiredSkillNames.some(reqSkill => 
      skill.toLowerCase().includes(reqSkill) || reqSkill.includes(skill.toLowerCase())
    )
  );
  
  const tagMatchRatio = matchedRequiredSkills.length / Math.max(requiredSkillNames.length, 1);
  
  // Bonuses
  const repoBonus = repoUrl ? 0.10 : 0;
  const demoBonus = demoUrl ? 0.05 : 0;
  const githubStarsBonus = 0; // Would need GitHub API integration
  const recencyBoost = 0; // Would need project date comparison
  
  const rawScore = 0.7 * tagMatchRatio + repoBonus + demoBonus + githubStarsBonus + recencyBoost;
  
  return Math.min(rawScore, 1.0);
};

module.exports = {
  tagProject,
  expandTagsWithFuzzy,
  calculateEvidenceScore,
  keywordMap
};
