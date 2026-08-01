export const parseResume = (resumeText) => {
  // Extract skills
  const skillsKeywords = [
    'javascript', 'react', 'node', 'python', 'java', 'sql', 'mongodb',
    'aws', 'docker', 'kubernetes', 'git', 'rest api', 'graphql',
    'typescript', 'vue', 'angular', 'express', 'django', 'spring',
    'microservices', 'ci/cd', 'jenkins', 'system design'
  ];

  const foundSkills = skillsKeywords.filter(skill =>
    resumeText.toLowerCase().includes(skill)
  );

  // Extract experience level
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?/i);
  const experienceYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  // Extract job titles/roles
  const roleKeywords = ['developer', 'engineer', 'architect', 'lead', 'senior', 'junior', 'fullstack', 'backend', 'frontend', 'devops', 'data scientist'];
  const roles = roleKeywords.filter(role =>
    resumeText.toLowerCase().includes(role)
  );

  // Extract projects/achievements
  const projectLines = resumeText.split('\n').filter(line =>
    line.toLowerCase().includes('project') ||
    line.toLowerCase().includes('built') ||
    line.toLowerCase().includes('developed')
  );

  return {
    skills: foundSkills,
    experienceYears,
    roles,
    projects: projectLines.slice(0, 3), // Top 3 projects
    rawText: resumeText
  };
};

export const generateQuestionPrompt = (parsedResume) => {
  return `
Based on this resume information, generate 5 unique interview questions:

Skills: ${parsedResume.skills.join(', ')}
Experience: ${parsedResume.experienceYears} years
Roles: ${parsedResume.roles.join(', ')}
Key Projects: ${parsedResume.projects.join(' | ')}

Generate 5 interview questions that:
1. Are specific to their skills and experience
2. Mix technical and behavioral questions
3. Reference their actual projects/experience if possible
4. Progressive difficulty (easy to hard)

Format as JSON:
{
  "questions": [
    {
      "question": "...",
      "category": "technical|behavioral|experience",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;
};