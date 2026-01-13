/**
 * Generates course content based on course name and category
 * This uses template-based generation. Can be enhanced with AI later.
 */

// Export for Node.js scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateCourseContent }
}

export interface GeneratedCourseContent {
  shortDescription: string
  introduction: string
  description: string
  learningObjectives: string
  trainingMethodology: string
  targetAudience: string
  whoShouldAttend: string
  organisationalImpact: string
  personalImpact: string
  courseOutline: Array<{ day: string; title: string; content: string }>
  faqs: Array<{ question: string; answer: string }>
}

export function generateCourseContent(
  courseName: string,
  category: string,
  duration: string
): GeneratedCourseContent {
  // Extract keywords from course name for better content generation
  const keywords = extractKeywords(courseName)
  const courseType = detectCourseType(courseName, category)

  // Generate short description
  const shortDescription = `This comprehensive ${duration.toLowerCase()} program provides participants with essential knowledge and practical skills in ${keywords.join(', ')}. Designed for professionals seeking to enhance their expertise and advance their careers.`

  // Generate introduction
  const introduction = `<p>Welcome to <strong>${courseName}</strong>, a comprehensive training program designed to equip professionals with the knowledge, skills, and tools necessary to excel in today's competitive business environment.</p>
<p>This program combines theoretical foundations with practical applications, ensuring participants gain both conceptual understanding and hands-on experience. Through interactive sessions, case studies, and real-world scenarios, participants will develop the competencies needed to drive organizational success.</p>
<p>Our expert instructors bring years of industry experience and will guide you through the latest best practices, methodologies, and tools relevant to ${keywords[0] || category}.</p>`

  // Generate description
  const description = `<p><strong>${courseName}</strong> is a structured learning experience that covers essential concepts, methodologies, and practical applications in ${category}.</p>
<ul>
<li>Comprehensive coverage of core ${keywords[0] || category} principles and best practices</li>
<li>Interactive learning sessions with real-world case studies and examples</li>
<li>Practical exercises and hands-on activities to reinforce learning</li>
<li>Expert guidance from industry professionals with extensive experience</li>
<li>Networking opportunities with peers and industry experts</li>
<li>Certificate of completion upon successful program completion</li>
</ul>
<p>This program is designed to be highly interactive, engaging, and practical, ensuring that participants can immediately apply what they learn in their professional roles.</p>`

  // Generate learning objectives
  const learningObjectives = `<p>Upon completion of this program, participants will be able to:</p>
<ul>
<li>Understand the fundamental concepts and principles of ${keywords[0] || category}</li>
<li>Apply best practices and methodologies in real-world scenarios</li>
<li>Develop practical skills and competencies relevant to their professional roles</li>
<li>Identify opportunities for improvement and innovation in their work</li>
<li>Create actionable plans to implement learning outcomes in their organizations</li>
<li>Enhance their professional capabilities and career prospects</li>
</ul>`

  // Generate training methodology
  const trainingMethodology = `<p>This program employs a blended learning approach that combines various instructional methods to maximize learning effectiveness:</p>
<ul>
<li><strong>Interactive Lectures:</strong> Expert-led sessions covering key concepts and theories</li>
<li><strong>Case Studies:</strong> Real-world scenarios and examples for practical application</li>
<li><strong>Group Discussions:</strong> Collaborative learning through peer interaction and knowledge sharing</li>
<li><strong>Hands-on Exercises:</strong> Practical activities to reinforce learning and build skills</li>
<li><strong>Role Plays & Simulations:</strong> Experiential learning opportunities to practice new skills</li>
<li><strong>Q&A Sessions:</strong> Opportunities to clarify doubts and deepen understanding</li>
</ul>
<p>This methodology ensures active participation, engagement, and practical application of learning outcomes.</p>`

  // Generate target audience
  const targetAudience = `<p>This program is designed for professionals who:</p>
<ul>
<li>Work in ${category} or related fields</li>
<li>Seek to enhance their knowledge and skills in ${keywords[0] || category}</li>
<li>Want to stay updated with latest industry trends and best practices</li>
<li>Are looking to advance their careers through professional development</li>
<li>Need practical tools and methodologies to improve their performance</li>
</ul>`

  // Generate who should attend
  const whoShouldAttend = `<p>This program is ideal for:</p>
<ul>
<li>${getJobTitles(courseType).join('</li><li>')}</li>
<li>Anyone seeking to enhance their professional skills and knowledge</li>
</ul>`

  // Generate organisational impact
  const organisationalImpact = `<p>Organizations will benefit from this program through:</p>
<ul>
<li>Improved employee performance and productivity</li>
<li>Enhanced organizational capabilities and competitiveness</li>
<li>Better alignment with industry best practices and standards</li>
<li>Increased innovation and problem-solving capabilities</li>
<li>Strengthened team collaboration and effectiveness</li>
<li>Higher employee engagement and retention</li>
</ul>`

  // Generate personal impact
  const personalImpact = `<p>Participants will experience personal growth through:</p>
<ul>
<li>Enhanced professional knowledge and expertise</li>
<li>Improved confidence in applying new skills and methodologies</li>
<li>Better career prospects and advancement opportunities</li>
<li>Expanded professional network and connections</li>
<li>Increased job satisfaction and professional fulfillment</li>
<li>Recognition through professional certification</li>
</ul>`

  // Generate course outline
  const courseOutline = generateCourseOutline(courseName, keywords, duration)

  // Generate FAQs
  const faqs = generateFAQs(courseName, duration, category)

  return {
    shortDescription,
    introduction,
    description,
    learningObjectives,
    trainingMethodology,
    targetAudience,
    whoShouldAttend,
    organisationalImpact,
    personalImpact,
    courseOutline,
    faqs,
  }
}

// Helper functions
function extractKeywords(courseName: string): string[] {
  const commonWords = ['course', 'training', 'program', 'certification', 'workshop', 'seminar', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  const words = courseName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !commonWords.includes(word) && word.length > 2)
    .slice(0, 5)
  return words.length > 0 ? words : ['professional development']
}

function detectCourseType(courseName: string, category: string): string {
  const name = courseName.toLowerCase()
  if (name.includes('management') || name.includes('leadership')) return 'management'
  if (name.includes('finance') || name.includes('accounting')) return 'finance'
  if (name.includes('hr') || name.includes('human resource')) return 'hr'
  if (name.includes('project') || name.includes('pmp')) return 'project'
  if (name.includes('it') || name.includes('technology') || name.includes('software')) return 'it'
  if (name.includes('marketing') || name.includes('sales')) return 'marketing'
  if (name.includes('quality') || name.includes('iso')) return 'quality'
  return 'general'
}

function getJobTitles(courseType: string): string[] {
  const titles: Record<string, string[]> = {
    management: [
      'Managers and Team Leaders',
      'Supervisors and Department Heads',
      'Executives and Senior Management',
      'Project Managers',
    ],
    finance: [
      'Finance Managers and Controllers',
      'Accountants and Financial Analysts',
      'CFOs and Finance Directors',
      'Auditors and Compliance Officers',
    ],
    hr: [
      'HR Managers and Directors',
      'HR Business Partners',
      'Talent Acquisition Specialists',
      'Learning and Development Professionals',
    ],
    project: [
      'Project Managers and Coordinators',
      'Program Managers',
      'Project Team Members',
      'PMO Professionals',
    ],
    it: [
      'IT Managers and Directors',
      'Software Developers and Engineers',
      'System Administrators',
      'IT Consultants',
    ],
    marketing: [
      'Marketing Managers and Directors',
      'Brand Managers',
      'Digital Marketing Specialists',
      'Sales Professionals',
    ],
    quality: [
      'Quality Managers',
      'Quality Assurance Professionals',
      'Compliance Officers',
      'Process Improvement Specialists',
    ],
    general: [
      'Professionals seeking skill enhancement',
      'Team members looking to advance their careers',
      'Individuals interested in professional development',
    ],
  }
  return titles[courseType] || titles.general
}

function generateCourseOutline(
  courseName: string,
  keywords: string[],
  duration: string
): Array<{ day: string; title: string; content: string }> {
  const days = parseInt(duration) || 5
  const outline: Array<{ day: string; title: string; content: string }> = []

  const dayTitles = [
    'Introduction and Fundamentals',
    'Core Concepts and Principles',
    'Advanced Applications',
    'Practical Implementation',
    'Best Practices and Case Studies',
    'Integration and Optimization',
    'Review and Action Planning',
  ]

  for (let i = 0; i < days && i < dayTitles.length; i++) {
    outline.push({
      day: `Day ${i + 1}`,
      title: dayTitles[i] || `Module ${i + 1}`,
      content: `<ul>
<li>Introduction to key concepts and learning objectives</li>
<li>Interactive sessions on ${keywords[0] || 'core topics'}</li>
<li>Practical exercises and case studies</li>
<li>Group discussions and knowledge sharing</li>
<li>Q&A and clarification sessions</li>
</ul>`,
    })
  }

  return outline
}

function generateFAQs(courseName: string, duration: string, category: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `What is the duration of the ${courseName} program?`,
      answer: `The program is conducted over ${duration}, providing comprehensive coverage of all essential topics and allowing sufficient time for practical application and interactive learning.`,
    },
    {
      question: `Who should attend this ${courseName} program?`,
      answer: `This program is designed for professionals working in ${category} or related fields who seek to enhance their knowledge, skills, and competencies. It is suitable for individuals at various career levels looking to advance their professional development.`,
    },
    {
      question: `What will I learn from this program?`,
      answer: `You will gain comprehensive knowledge of ${courseName} principles, best practices, and practical applications. The program covers essential concepts, methodologies, and tools that you can immediately apply in your professional role.`,
    },
    {
      question: `Will I receive a certificate upon completion?`,
      answer: `Yes, participants who successfully complete the program will receive a certificate of completion, recognizing their achievement and professional development.`,
    },
    {
      question: `What is the training methodology used in this program?`,
      answer: `The program employs a blended learning approach combining interactive lectures, case studies, group discussions, hands-on exercises, and practical activities to ensure effective learning and skill development.`,
    },
    {
      question: `Can this program be customized for in-house delivery?`,
      answer: `Yes, we offer customized in-house training solutions tailored to your organization's specific needs and requirements. Please contact us to discuss your requirements.`,
    },
  ]
}

