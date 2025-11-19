/**
 * Seed script to add dummy programs to the database
 * Run with: node scripts/seed-programs.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Category to Reference Code mapping
const categoryToRefCode = {
  "Admin & Secretarial": "AD",
  "Contracts Management": "CM",
  "Customer Service": "CS",
  "Electrical Engineering": "EE",
  "Finance & Accounting": "FI",
  "Health & Safety": "HS",
  "HR Management": "HR",
  "Information Technology": "IT",
  "Maintenance Management": "MN",
  "Management & Leadership": "ML",
  "Mechanical Engineering": "ME",
  "Oil & Gas": "OG",
  "Project Management": "PM",
  "Public Relations": "PR",
  "Purchasing Management": "MM",
  "Urban Planning & Development": "UP",
}

// Dummy programs data
const dummyPrograms = [
  // Project Management programs
  {
    refCode: "PM001",
    programName: "Certified Project Management Professional (PMP)®",
    category: "Project Management",
    type: ["Public Program", "Signature Program"],
    status: "Published",
    duration: "5 days",
    targetAudience: "Project managers, team leaders, and professionals seeking PMP certification",
    learningObjectives: "Master project management methodologies, prepare for PMP exam, and gain hands-on experience with real-world projects",
    trainingMethodology: "Interactive workshops, case studies, practice exams, and group exercises",
    introduction: "This comprehensive program prepares professionals for the Project Management Professional (PMP)® certification exam while providing practical skills for managing complex projects.",
    description: "The PMP certification is one of the most prestigious credentials in project management. This intensive program covers all domains of the PMBOK Guide, including project initiation, planning, execution, monitoring, and closing.",
    organisationalImpact: "Organizations benefit from certified project managers who can deliver projects on time and within budget, improving overall project success rates.",
    personalImpact: "Participants gain recognized credentials, enhanced career prospects, and increased earning potential in the project management field.",
    whoShouldAttend: "Project managers, program managers, project coordinators, and professionals with at least three years of project management experience.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Introduction to Project Management & PMP Framework",
        content: "Overview of project management, PMI framework, project lifecycle, and PMP exam structure. Understanding the role of a project manager."
      },
      {
        day: "Day 2",
        title: "Project Integration & Scope Management",
        content: "Project charter development, project management plan creation, scope planning, and scope control techniques."
      },
      {
        day: "Day 3",
        title: "Schedule, Cost & Quality Management",
        content: "WBS creation, network diagrams, critical path method, earned value management, and quality assurance processes."
      },
      {
        day: "Day 4",
        title: "Resource, Risk & Communication Management",
        content: "Team acquisition, resource optimization, risk identification and mitigation, stakeholder communication strategies."
      },
      {
        day: "Day 5",
        title: "Procurement, Stakeholder Management & Exam Preparation",
        content: "Contract management, stakeholder engagement, project closure, and comprehensive PMP exam review with practice questions."
      }
    ],
    certifications: [
      {
        name: "PMP Certification",
        description: "Project Management Professional certification from PMI upon passing the exam",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "What are the prerequisites for the PMP exam?",
        answer: "You need either a four-year degree with at least three years of project management experience and 35 hours of project management education, or a high school diploma with five years of project management experience and 35 hours of project management education."
      },
      {
        question: "How long is the PMP certification valid?",
        answer: "The PMP certification is valid for three years. You need to earn 60 Professional Development Units (PDUs) to renew it."
      },
      {
        question: "Does this course include exam fees?",
        answer: "No, the exam fee is separate and must be paid directly to PMI when you register for the exam."
      }
    ]
  },
  {
    refCode: "PM002",
    programName: "Agile Project Management Fundamentals",
    category: "Project Management",
    type: ["Public Program"],
    status: "Published",
    duration: "3 days",
    targetAudience: "Project managers, Scrum Masters, product owners, and team members transitioning to Agile",
    learningObjectives: "Understand Agile principles and values, learn Scrum framework, practice Agile ceremonies, and implement Agile in your organization",
    trainingMethodology: "Hands-on simulations, group exercises, role-playing, and interactive discussions",
    introduction: "Agile methodologies have revolutionized project management. This program provides comprehensive training in Agile principles and Scrum practices.",
    description: "Learn the fundamental concepts of Agile project management including Scrum, Kanban, and Lean principles. This course emphasizes practical application through real-world scenarios.",
    organisationalImpact: "Organizations adopting Agile see improved team productivity, faster time-to-market, and better customer satisfaction.",
    personalImpact: "Gain essential Agile skills that are in high demand across industries, enhancing your career prospects.",
    whoShouldAttend: "Project managers, developers, product managers, and anyone involved in software development or project delivery.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Agile Principles & Values",
        content: "Introduction to Agile manifesto, core values and principles, Agile vs. traditional methods, and Agile mindset transformation."
      },
      {
        day: "Day 2",
        title: "Scrum Framework Deep Dive",
        content: "Scrum roles (Product Owner, Scrum Master, Development Team), Scrum events (Sprint, Daily Standup, Sprint Review, Retrospective), and Scrum artifacts."
      },
      {
        day: "Day 3",
        title: "Advanced Agile Practices & Implementation",
        content: "Kanban methodology, Agile metrics and reporting, scaling Agile, and organizational change management for Agile adoption."
      }
    ],
    certifications: [
      {
        name: "Agile Fundamentals Certificate",
        description: "Certificate of completion in Agile Project Management Fundamentals",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "Do I need prior project management experience?",
        answer: "No prior experience is required, but basic understanding of project concepts is helpful."
      },
      {
        question: "Is this course suitable for non-IT projects?",
        answer: "Yes, Agile principles can be applied to various types of projects beyond software development."
      }
    ]
  },
  // Finance & Accounting programs
  {
    refCode: "FI001",
    programName: "Advanced Budgeting & Cost Control",
    category: "Finance & Accounting",
    type: ["Public Program", "Signature Program"],
    status: "Published",
    duration: "5 days",
    targetAudience: "Finance managers, budget analysts, cost controllers, and financial planners",
    learningObjectives: "Master budgeting techniques, cost analysis methods, variance analysis, and financial forecasting",
    trainingMethodology: "Case studies, Excel workshops, financial modeling exercises, and real-world budget scenarios",
    introduction: "Effective budgeting and cost control are critical for organizational success. This program provides advanced techniques for financial planning and cost management.",
    description: "Comprehensive training in modern budgeting and cost control techniques including zero-based budgeting, activity-based costing, variance analysis, and performance measurement.",
    organisationalImpact: "Organizations gain better financial control, improved resource allocation, and enhanced profitability through effective cost management.",
    personalImpact: "Develop expertise in financial planning that is highly valued across industries, leading to career advancement opportunities.",
    whoShouldAttend: "Finance professionals, budget managers, cost accountants, and anyone responsible for financial planning and control.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Fundamentals of Budgeting",
        content: "Budgeting principles, types of budgets, budget preparation process, and budget timeline development."
      },
      {
        day: "Day 2",
        title: "Advanced Budgeting Techniques",
        content: "Zero-based budgeting, rolling budgets, activity-based budgeting, and budget consolidation methods."
      },
      {
        day: "Day 3",
        title: "Cost Analysis & Control",
        content: "Cost classification, cost behavior analysis, standard costing, and variance analysis techniques."
      },
      {
        day: "Day 4",
        title: "Performance Measurement & KPIs",
        content: "Financial KPIs, balanced scorecard, performance dashboards, and management reporting systems."
      },
      {
        day: "Day 5",
        title: "Forecasting & Strategic Financial Planning",
        content: "Financial forecasting methods, scenario planning, sensitivity analysis, and strategic budget alignment."
      }
    ],
    certifications: [
      {
        name: "Budgeting & Cost Control Certificate",
        description: "Certificate of completion in Advanced Budgeting & Cost Control",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "What level of financial knowledge is required?",
        answer: "Participants should have basic understanding of accounting principles and financial statements."
      },
      {
        question: "Are Excel skills necessary?",
        answer: "Basic Excel skills are helpful, as we'll work with financial models, but all formulas and techniques will be explained."
      }
    ]
  },
  {
    refCode: "FI002",
    programName: "Financial Analysis & Reporting",
    category: "Finance & Accounting",
    type: ["Public Program"],
    status: "Published",
    duration: "4 days",
    targetAudience: "Financial analysts, accountants, finance managers, and business analysts",
    learningObjectives: "Master financial statement analysis, ratio analysis, cash flow analysis, and financial modeling",
    trainingMethodology: "Hands-on analysis of real financial statements, Excel modeling, case studies, and interactive workshops",
    introduction: "Financial analysis skills are essential for making informed business decisions. This program equips participants with advanced analytical techniques.",
    description: "Learn to analyze financial statements, calculate and interpret financial ratios, perform cash flow analysis, and create comprehensive financial reports for management decision-making.",
    organisationalImpact: "Organizations benefit from better financial insights, improved decision-making, and enhanced financial performance monitoring.",
    personalImpact: "Develop critical analytical skills that are essential for senior finance roles and career advancement.",
    whoShouldAttend: "Financial analysts, accountants, finance managers, CFOs, and business analysts working with financial data.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Financial Statement Fundamentals",
        content: "Understanding income statements, balance sheets, cash flow statements, and financial statement interrelationships."
      },
      {
        day: "Day 2",
        title: "Financial Ratio Analysis",
        content: "Liquidity ratios, profitability ratios, efficiency ratios, leverage ratios, and market value ratios."
      },
      {
        day: "Day 3",
        title: "Cash Flow Analysis",
        content: "Operating cash flow, investing cash flow, financing cash flow, free cash flow, and cash flow forecasting."
      },
      {
        day: "Day 4",
        title: "Financial Modeling & Forecasting",
        content: "Building financial models, forecasting techniques, scenario analysis, and creating executive financial reports."
      }
    ],
    certifications: [
      {
        name: "Financial Analysis Certificate",
        description: "Certificate of completion in Financial Analysis & Reporting",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "What Excel skills do I need?",
        answer: "Intermediate Excel skills are recommended, including formulas, functions, and basic charting."
      },
      {
        question: "Will I receive templates?",
        answer: "Yes, participants receive Excel templates and financial analysis models to use in their work."
      }
    ]
  },
  // HR Management programs
  {
    refCode: "HR001",
    programName: "Strategic HR Business Partner",
    category: "HR Management",
    type: ["Public Program", "Signature Program"],
    status: "Published",
    duration: "5 days",
    targetAudience: "HR managers, HR business partners, senior HR professionals, and organizational development specialists",
    learningObjectives: "Develop strategic HR capabilities, align HR with business objectives, master HR analytics, and become a trusted business advisor",
    trainingMethodology: "Case studies, strategic planning workshops, role-playing exercises, and interactive discussions",
    introduction: "Modern HR professionals must move beyond administrative tasks to become strategic business partners. This program transforms HR professionals into strategic advisors.",
    description: "Comprehensive training in strategic HR management including business alignment, HR metrics and analytics, organizational development, talent management, and change leadership.",
    organisationalImpact: "Organizations benefit from HR that drives business results, improves employee engagement, and contributes to organizational effectiveness.",
    personalImpact: "Elevate your HR career by gaining strategic skills that position you as a business leader and trusted advisor.",
    whoShouldAttend: "HR managers, HR business partners, HR directors, and senior HR professionals seeking to enhance their strategic capabilities.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Strategic HR Framework",
        content: "Understanding business strategy, aligning HR with business objectives, strategic HR planning, and HR as a business partner."
      },
      {
        day: "Day 2",
        title: "HR Analytics & Metrics",
        content: "Key HR metrics, workforce analytics, predictive analytics in HR, and using data for decision-making."
      },
      {
        day: "Day 3",
        title: "Talent Management & Development",
        content: "Strategic talent planning, succession planning, leadership development, and building high-performing teams."
      },
      {
        day: "Day 4",
        title: "Organizational Development & Change",
        content: "Organizational design, change management, culture transformation, and building organizational capability."
      },
      {
        day: "Day 5",
        title: "HR Business Partner Skills & Consulting",
        content: "Consulting skills for HR, stakeholder management, influencing skills, and becoming a trusted advisor."
      }
    ],
    certifications: [
      {
        name: "Strategic HR Business Partner Certificate",
        description: "Certificate of completion in Strategic HR Business Partner Program",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "What HR experience is required?",
        answer: "This program is designed for HR professionals with at least 3-5 years of experience in HR roles."
      },
      {
        question: "Is this applicable to all industries?",
        answer: "Yes, the strategic HR principles covered are applicable across all industries and sectors."
      }
    ]
  },
  // Management & Leadership programs
  {
    refCode: "ML001",
    programName: "Executive Leadership Development Program",
    category: "Management & Leadership",
    type: ["Signature Program"],
    status: "Published",
    duration: "5 days",
    targetAudience: "Senior executives, directors, general managers, and high-potential leaders",
    learningObjectives: "Develop executive leadership capabilities, strategic thinking, decision-making skills, and change leadership",
    trainingMethodology: "Leadership assessments, executive coaching sessions, strategic simulations, peer learning, and action planning",
    introduction: "Effective executive leadership drives organizational success. This intensive program develops the capabilities needed for senior leadership roles.",
    description: "A comprehensive executive development program covering strategic leadership, decision-making, change management, stakeholder engagement, and building high-performing organizations.",
    organisationalImpact: "Organizations develop stronger leadership pipeline, improve strategic execution, and enhance organizational performance.",
    personalImpact: "Accelerate your leadership development and prepare for the most senior roles in your organization.",
    whoShouldAttend: "Senior executives, directors, general managers, and high-potential leaders identified for senior positions.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Strategic Leadership Foundations",
        content: "Leadership models, strategic thinking, vision and mission development, and leadership assessment."
      },
      {
        day: "Day 2",
        title: "Decision-Making & Problem-Solving",
        content: "Executive decision-making frameworks, strategic problem-solving, risk management, and crisis leadership."
      },
      {
        day: "Day 3",
        title: "Leading Change & Transformation",
        content: "Change leadership models, transformation strategies, managing resistance, and building change capability."
      },
      {
        day: "Day 4",
        title: "Stakeholder Engagement & Influence",
        content: "Stakeholder mapping, influence strategies, negotiation skills, and building strategic partnerships."
      },
      {
        day: "Day 5",
        title: "Building High-Performing Organizations",
        content: "Organizational culture, team development, performance management, and leadership legacy."
      }
    ],
    certifications: [
      {
        name: "Executive Leadership Certificate",
        description: "Certificate of completion in Executive Leadership Development Program",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "Is there any pre-work required?",
        answer: "Participants will receive a leadership assessment and pre-reading materials before the program."
      },
      {
        question: "Is this suitable for new leaders?",
        answer: "This program is designed for experienced leaders. New leaders may benefit from our foundational leadership program first."
      }
    ]
  },
  // Information Technology programs
  {
    refCode: "IT001",
    programName: "Cloud Computing & AWS Fundamentals",
    category: "Information Technology",
    type: ["Public Program"],
    status: "Published",
    duration: "4 days",
    targetAudience: "IT professionals, system administrators, developers, and technical managers",
    learningObjectives: "Understand cloud computing concepts, learn AWS services, master cloud architecture, and prepare for AWS certification",
    trainingMethodology: "Hands-on labs, AWS console exercises, architecture design workshops, and real-world scenarios",
    introduction: "Cloud computing is transforming IT infrastructure. This program provides comprehensive training in cloud computing and AWS services.",
    description: "Learn cloud computing fundamentals including IaaS, PaaS, SaaS models, AWS core services, cloud architecture patterns, and security best practices.",
    organisationalImpact: "Organizations gain expertise in cloud adoption, reducing IT costs, improving scalability, and enhancing agility.",
    personalImpact: "Develop in-demand cloud skills and prepare for AWS certifications that significantly enhance career prospects.",
    whoShouldAttend: "IT professionals, system administrators, cloud engineers, developers, and anyone involved in cloud migration or management.",
    courseOutline: [
      {
        day: "Day 1",
        title: "Cloud Computing Fundamentals",
        content: "Cloud models (IaaS, PaaS, SaaS), cloud deployment models, cloud benefits, and cloud economics."
      },
      {
        day: "Day 2",
        title: "AWS Core Services",
        content: "EC2, S3, RDS, VPC, IAM, Lambda, and other essential AWS services and their use cases."
      },
      {
        day: "Day 3",
        title: "Cloud Architecture & Design",
        content: "Well-architected framework, scalability patterns, high availability, disaster recovery, and cost optimization."
      },
      {
        day: "Day 4",
        title: "Security & Best Practices",
        content: "Cloud security, compliance, monitoring, logging, and AWS certification exam preparation."
      }
    ],
    certifications: [
      {
        name: "Cloud Computing Certificate",
        description: "Certificate of completion in Cloud Computing & AWS Fundamentals",
        imageUrl: null
      }
    ],
    faqs: [
      {
        question: "Do I need AWS account access?",
        answer: "We provide AWS accounts for lab exercises, but having your own AWS account is recommended for practice."
      },
      {
        question: "Does this prepare for AWS certification?",
        answer: "Yes, this program covers the core topics for AWS Certified Cloud Practitioner and AWS Certified Solutions Architect Associate exams."
      }
    ]
  }
]

async function seedPrograms() {
  console.log('Starting program seeding...\n')

  try {
    // Check existing programs to avoid duplicates
    const existingPrograms = await prisma.program.findMany({
      select: { refCode: true }
    })
    const existingRefCodes = new Set(existingPrograms.map(p => p.refCode))

    let createdCount = 0
    let skippedCount = 0

    for (const program of dummyPrograms) {
      if (existingRefCodes.has(program.refCode)) {
        console.log(`⚠️  Skipping ${program.refCode} - already exists`)
        skippedCount++
        continue
      }

      try {
        const created = await prisma.program.create({
          data: {
            refCode: program.refCode,
            programName: program.programName,
            category: program.category,
            type: program.type,
            status: program.status,
            duration: program.duration,
            targetAudience: program.targetAudience || null,
            learningObjectives: program.learningObjectives || null,
            trainingMethodology: program.trainingMethodology || null,
            introduction: program.introduction || null,
            description: program.description || null,
            organisationalImpact: program.organisationalImpact || null,
            personalImpact: program.personalImpact || null,
            whoShouldAttend: program.whoShouldAttend || null,
            mainCourseImageUrl: null,
            cardImageUrl: null,
            courseOutline: {
              create: program.courseOutline || []
            },
            certifications: {
              create: program.certifications || []
            },
            faqs: {
              create: program.faqs || []
            }
          }
        })

        console.log(`✅ Created: ${program.refCode} - ${program.programName}`)
        createdCount++
      } catch (error) {
        console.error(`❌ Error creating ${program.refCode}:`, error.message)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Created: ${createdCount} programs`)
    console.log(`   ⚠️  Skipped: ${skippedCount} programs (already exist)`)
    console.log(`\n✨ Seeding completed!`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedPrograms()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

